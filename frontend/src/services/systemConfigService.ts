/**
 * System Configuration Service
 * Handles admin system configuration API operations
 */

import api from './api'

export interface SystemConfig {
  // Application Settings
  app_name?: string
  app_description?: string
  app_logo_url?: string
  app_favicon_url?: string
  
  // Email Settings
  smtp_enabled?: boolean
  smtp_host?: string
  smtp_port?: number
  smtp_username?: string
  smtp_password?: string
  smtp_from_email?: string
  smtp_from_name?: string
  
  // SMS Settings
  sms_enabled?: boolean
  sms_provider?: 'twilio' | 'zenvia' | 'custom'
  sms_api_key?: string
  sms_api_secret?: string
  sms_from_number?: string
  
  // WhatsApp Settings
  whatsapp_enabled?: boolean
  whatsapp_api_url?: string
  whatsapp_api_key?: string
  whatsapp_instance_id?: string
  
  // Storage Settings
  storage_provider?: 'local' | 's3' | 'cloudinary'
  storage_bucket?: string
  storage_region?: string
  storage_access_key?: string
  storage_secret_key?: string
  
  // Security Settings
  session_timeout_minutes?: number
  password_min_length?: number
  password_require_uppercase?: boolean
  password_require_lowercase?: boolean
  password_require_numbers?: boolean
  password_require_symbols?: boolean
  max_login_attempts?: number
  lockout_duration_minutes?: number
  
  // Backup Settings
  backup_enabled?: boolean
  backup_frequency?: 'daily' | 'weekly' | 'monthly'
  backup_retention_days?: number
  backup_storage_provider?: string
  
  // Monitoring Settings
  sentry_enabled?: boolean
  sentry_dsn?: string
  analytics_enabled?: boolean
  analytics_provider?: 'google' | 'mixpanel' | 'custom'
  analytics_key?: string
  
  // Feature Flags
  maintenance_mode?: boolean
  registration_enabled?: boolean
  forgot_password_enabled?: boolean
  social_login_enabled?: boolean
  
  // Limits
  max_companies?: number
  max_users_per_company?: number
  max_file_size_mb?: number
  
  // Branding
  primary_color?: string
  secondary_color?: string
  custom_css?: string
}

export const systemConfigService = {
  // Get current system configuration
  getConfig: (): Promise<{ data: SystemConfig }> =>
    api.get('/admin/system-config'),

  // Update system configuration
  updateConfig: (config: Partial<SystemConfig>): Promise<{ data: SystemConfig }> =>
    api.put('/admin/system-config', config),

  // Test email configuration
  testEmail: (email: string): Promise<{ data: { success: boolean; message: string } }> =>
    api.post('/admin/system-config/test-email', { email }),

  // Test SMS configuration
  testSMS: (phone: string): Promise<{ data: { success: boolean; message: string } }> =>
    api.post('/admin/system-config/test-sms', { phone }),

  // Test WhatsApp configuration
  testWhatsApp: (phone: string): Promise<{ data: { success: boolean; message: string } }> =>
    api.post('/admin/system-config/test-whatsapp', { phone }),

  // Test storage configuration
  testStorage: (): Promise<{ data: { success: boolean; message: string } }> =>
    api.post('/admin/system-config/test-storage'),

  // Get system status
  getSystemStatus: (): Promise<{ data: { 
    database: boolean
    redis: boolean
    celery: boolean
    storage: boolean
    email: boolean
    sms: boolean
    whatsapp: boolean
  } }> =>
    api.get('/admin/system-status'),

  // Backup now
  backupNow: (): Promise<{ data: { success: boolean; backup_id: string } }> =>
    api.post('/admin/backup/now'),

  // List backups
  listBackups: (): Promise<{ data: Array<{
    id: string
    created_at: string
    size_mb: number
    status: 'completed' | 'failed' | 'in_progress'
  }> }> =>
    api.get('/admin/backups'),

  // Restore backup
  restoreBackup: (backupId: string): Promise<{ data: { success: boolean; message: string } }> =>
    api.post(`/admin/backup/${backupId}/restore`),
}
