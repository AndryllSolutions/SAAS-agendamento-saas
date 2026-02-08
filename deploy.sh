#!/bin/bash

# Deploy Script for SAAS Agendamento System on VPS
# Usage: ./deploy.sh [staging|production]

set -e

# Configuration
ENVIRONMENT=${1:-production}
BACKUP_DIR="/opt/backups/agendamento"
APP_DIR="/opt/agendamento"
LOG_FILE="/var/log/agendamento-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a $LOG_FILE
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a $LOG_FILE
    exit 1
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a $LOG_FILE
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   error "This script should not be run as root. Run as a user with sudo privileges."
fi

# Check Docker and Docker Compose
command -v docker >/dev/null 2>&1 || error "Docker is not installed"
command -v docker-compose >/dev/null 2>&1 || error "Docker Compose is not installed"

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    sudo mkdir -p $BACKUP_DIR
    sudo mkdir -p $APP_DIR
    sudo mkdir -p $APP_DIR/uploads
    sudo mkdir -p $APP_DIR/logs
    sudo mkdir -p $APP_DIR/ssl
    sudo chown -R $USER:$USER $APP_DIR
    sudo chown -R $USER:$USER $BACKUP_DIR
}

# Backup current deployment
backup_current() {
    if [ -d "$APP_DIR" ]; then
        log "Backing up current deployment..."
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        sudo cp -r $APP_DIR $BACKUP_DIR/$BACKUP_NAME
        log "Backup created: $BACKUP_DIR/$BACKUP_NAME"
    fi
}

# Clone or update repository
update_code() {
    log "Updating code from repository..."
    if [ -d "$APP_DIR/.git" ]; then
        cd $APP_DIR
        git fetch origin
        git reset --hard origin/master
        git pull origin master
    else
        git clone https://github.com/AndryllSolutions/SAAS-agendamento-saas.git $APP_DIR
        cd $APP_DIR
    fi
    log "Code updated successfully"
}

# Load environment variables
load_environment() {
    log "Loading environment variables..."
    if [ -f "$APP_DIR/.env.production" ]; then
        export $(cat $APP_DIR/.env.production | grep -v '^#' | xargs)
        log "Environment variables loaded from .env.production"
    else
        warning ".env.production file not found. Using default values."
    fi
}

# Build and deploy containers
deploy_containers() {
    log "Building and deploying containers..."
    cd $APP_DIR
    
    # Stop existing containers
    docker-compose -f docker-compose.production.yml down || true
    
    # Build new images
    log "Building Docker images..."
    docker-compose -f docker-compose.production.yml build --no-cache
    
    # Start services
    log "Starting services..."
    docker-compose -f docker-compose.production.yml up -d
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 30
    
    # Check service health
    check_health
}

# Check service health
check_health() {
    log "Checking service health..."
    
    # Check backend health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        log "Backend health check passed"
    else
        error "Backend health check failed"
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "Frontend health check passed"
    else
        error "Frontend health check failed"
    fi
    
    # Check database connection
    if docker exec agendamento_db_prod pg_isready -U agendamento_app -d agendamento > /dev/null 2>&1; then
        log "Database health check passed"
    else
        error "Database health check failed"
    fi
}

# Run database migrations
run_migrations() {
    log "Running database migrations..."
    cd $APP_DIR/backend
    
    # Check if alembic is available
    if docker exec agendamento_backend_prod alembic current > /dev/null 2>&1; then
        docker exec agendamento_backend_prod alembic upgrade head
        log "Database migrations completed"
    else
        warning "Alembic not available, skipping migrations"
    fi
}

# Setup SSL certificates (Let's Encrypt)
setup_ssl() {
    log "Setting up SSL certificates..."
    
    # Install certbot if not present
    if ! command -v certbot >/dev/null 2>&1; then
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Generate certificates
    if [ ! -f "$APP_DIR/ssl/atendo.website.crt" ]; then
        sudo certbot --nginx -d atendo.website -d www.atendo.website --non-interactive --agree-tos --email admin@atendo.website
        
        # Copy certificates to app directory
        sudo cp /etc/letsencrypt/live/atendo.website/fullchain.pem $APP_DIR/ssl/atendo.website.crt
        sudo cp /etc/letsencrypt/live/atendo.website/privkey.pem $APP_DIR/ssl/atendo.website.key
        sudo chown $USER:$USER $APP_DIR/ssl/*
        
        log "SSL certificates generated and copied"
    else
        log "SSL certificates already exist"
    fi
}

# Cleanup old backups
cleanup_backups() {
    log "Cleaning up old backups (keeping last 5)..."
    cd $BACKUP_DIR
    ls -t | tail -n +6 | xargs -r rm -rf
    log "Backup cleanup completed"
}

# Setup log rotation
setup_logrotate() {
    log "Setting up log rotation..."
    sudo tee /etc/logrotate.d/agendamento > /dev/null <<EOF
$APP_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $USER $USER
    postrotate
        docker-compose -f $APP_DIR/docker-compose.production.yml restart nginx
    endscript
}
EOF
    log "Log rotation configured"
}

# Main deployment function
main() {
    log "Starting deployment for environment: $ENVIRONMENT"
    
    create_directories
    backup_current
    update_code
    load_environment
    deploy_containers
    run_migrations
    setup_ssl
    setup_logrotate
    cleanup_backups
    
    log "Deployment completed successfully!"
    log "Application is available at: https://atendo.website"
    log "API documentation: https://atendo.website/docs"
}

# Rollback function
rollback() {
    log "Rolling back to previous deployment..."
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n 1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        error "No backup found for rollback"
    fi
    
    log "Restoring from backup: $LATEST_BACKUP"
    sudo cp -r $BACKUP_DIR/$LATEST_BACKUP/* $APP_DIR/
    cd $APP_DIR
    docker-compose -f docker-compose.production.yml up -d
    
    log "Rollback completed"
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "staging"|"production")
        main
        ;;
    *)
        echo "Usage: $0 [staging|production|rollback]"
        echo "  staging     - Deploy to staging environment"
        echo "  production  - Deploy to production environment (default)"
        echo "  rollback    - Rollback to previous deployment"
        exit 1
        ;;
esac
