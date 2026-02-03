# Usar Python 3.12.8 (versão estável recomendada)
# Compatível com todas as bibliotecas do projeto e melhor performance
FROM python:3.12.8-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    curl \
    wget \
    redis-tools \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Make wait scripts executable
RUN chmod +x /app/wait-for-rabbitmq.sh /app/wait-for-services.sh 2>/dev/null || true

# Remove pytest cache if it exists (force cleanup)
RUN find /app -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true

# Remove __pycache__ directories
RUN find /app -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

# Create uploads directory
RUN mkdir -p /app/uploads

# Set Python environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Expose port
EXPOSE 8000

# Run the application with proper settings
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "info", "--timeout-keep-alive", "75"]
