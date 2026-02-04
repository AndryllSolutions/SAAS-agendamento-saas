/**
 * Tipos TypeScript baseados no schema do backend
 * Agendamento SAAS - React Native
 */

// ==================== CORE TYPES ====================

export enum UserRole {
  ADMIN = 'admin',
  PROFESSIONAL = 'professional',
  CLIENT = 'client',
  STAFF = 'staff'
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  OTHER = 'other'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIAL = 'partial'
}

// ==================== USER TYPES ====================

export interface User {
  id: number;
  created_at: string;
  updated_at: string;
  company_id?: number;
  name: string;
  email: string;
  phone?: string;
  saas_role?: string;
  role: UserRole;
  is_active?: boolean;
  is_verified?: boolean;
  avatar_url?: string;
  bio?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  specialties?: Record<string, any>;
  working_hours?: Record<string, any>;
  commission_rate?: number;
  oauth_provider?: string;
  oauth_id?: string;
  notification_preferences?: Record<string, boolean>;
  notes?: string;
  tags?: Record<string, any>;
  cpf_cnpj?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user_id: string;
  email: string;
  role: string;
}

// ==================== COMPANY TYPES ====================

export interface Company {
  id: number;
  created_at: string;
  updated_at: string;
  name: string;
  trade_name?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  website?: string;
  logo_url?: string;
  subscription_plan_id?: number;
  is_active: boolean;
  trial_ends_at?: string;
  max_users?: number;
  max_appointments_per_month?: number;
  custom_settings?: Record<string, any>;
  business_hours?: Record<string, any>;
  timezone?: string;
  language?: string;
  currency?: string;
  tax_id?: string;
  industry?: string;
  size?: string;
  notes?: string;
}

// ==================== APPOINTMENT TYPES ====================

export interface Appointment {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  client_crm_id?: number;
  professional_id?: number;
  service_id?: number;
  resource_id?: number;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  client_notes?: string;
  professional_notes?: string;
  internal_notes?: string;
  cancelled_at?: string;
  cancelled_by?: number;
  cancellation_reason?: string;
  checked_in_at?: string;
  check_in_code?: string;
  reminder_sent_24h?: boolean;
  reminder_sent_2h?: boolean;
  payment_status?: string;
  
  // Relacionamentos (populados)
  client?: Client;
  professional?: User;
  service?: Service;
  resource?: Resource;
}

// ==================== SERVICE TYPES ====================

export interface Service {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  category_id?: number;
  name: string;
  description?: string;
  duration_minutes: number;
  price: number;
  currency?: string;
  color?: string;
  is_active: boolean;
  requires_payment?: boolean;
  allow_online_booking?: boolean;
  max_concurrent?: number;
  buffer_minutes_before?: number;
  buffer_minutes_after?: number;
  custom_fields?: Record<string, any>;
  image_url?: string;
  display_order?: number;
  
  // Relacionamentos
  category?: ServiceCategory;
  professionals?: User[];
}

export interface ServiceCategory {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  display_order?: number;
  is_active: boolean;
}

// ==================== CLIENT TYPES ====================

export interface Client {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  name: string;
  email?: string;
  phone?: string;
  cpf_cnpj?: string;
  date_of_birth?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  notes?: string;
  is_active: boolean;
  tags?: Record<string, any>;
  custom_fields?: Record<string, any>;
  preferences?: Record<string, any>;
  source?: string;
  referral?: string;
}

// ==================== PAYMENT TYPES ====================

export interface Payment {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  appointment_id?: number;
  user_id?: number;
  amount: number;
  payment_method?: PaymentMethod;
  status?: PaymentStatus;
  payment_date?: string;
  due_date?: string;
  notes?: string;
  transaction_id?: string;
  gateway_response?: Record<string, any>;
  installments?: number;
  first_installment_due?: string;
  
  // Relacionamentos
  appointment?: Appointment;
  user?: User;
}

// ==================== RESOURCE TYPES ====================

export interface Resource {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  name: string;
  type: string;
  description?: string;
  location?: string;
  capacity?: number;
  color?: string;
  is_active: boolean;
  booking_rules?: Record<string, any>;
  custom_fields?: Record<string, any>;
}

// ==================== NOTIFICATION TYPES ====================

export interface Notification {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  user_id?: number;
  title: string;
  message: string;
  type: string;
  priority: string;
  is_read: boolean;
  read_at?: string;
  data?: Record<string, any>;
  expires_at?: string;
  
  // Relacionamentos
  user?: User;
}

export interface PushSubscription {
  id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  company_id: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  browser?: string;
  device_name?: string;
  user_agent?: string;
  is_active: boolean;
  last_used_at?: string;
}

// ==================== CONFIGURATION TYPES ====================

export interface CompanyThemeSettings {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  sidebar_color?: string;
  theme_mode?: string;
  interface_language?: string;
  custom_logo_url?: string;
  custom_favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  font_family?: string;
  custom_css?: string;
  layout_config?: Record<string, any>;
  branding_config?: Record<string, any>;
}

export interface OnlineBookingConfig {
  id: number;
  created_at: string;
  updated_at: string;
  company_id: number;
  is_enabled: boolean;
  booking_url?: string;
  require_phone?: boolean;
  require_email?: boolean;
  allow_cancellation?: boolean;
  cancellation_hours?: number;
  require_payment?: boolean;
  payment_required_amount?: number;
  auto_confirm?: boolean;
  show_prices?: boolean;
  allow_notes?: boolean;
  max_bookings_per_day?: number;
  booking_buffer_minutes?: number;
  custom_welcome_message?: string;
  custom_confirmation_message?: string;
  custom_cancellation_message?: string;
  working_days_config?: Record<string, any>;
  services_config?: Record<string, any>;
  professionals_config?: Record<string, any>;
  advanced_settings?: Record<string, any>;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
  total?: number;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

// ==================== FORM TYPES ====================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface CreateAppointmentRequest {
  client_crm_id: number;
  professional_id: number;
  service_id: number;
  start_time: string;
  end_time: string;
  client_notes?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar_url?: string;
  bio?: string;
  working_hours?: Record<string, any>;
  notification_preferences?: Record<string, boolean>;
}

// ==================== MOBILE SPECIFIC TYPES ====================

export interface DeviceInfo {
  device_name: string;
  browser?: string;
  user_agent: string;
  platform: string;
  version: string;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  icon?: string;
  badge?: number;
  sound?: string;
}

export interface AppSettings {
  apiBaseUrl: string;
  pushNotificationEnabled: boolean;
  biometricEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    appointments: boolean;
    promotions: boolean;
    system: boolean;
  };
}

export interface AppState {
  user: User | null;
  company: Company | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  settings: AppSettings;
}

// ==================== ERROR TYPES ====================

export interface ApiError {
  error: string;
  message: string;
  details?: Record<string, any>;
  code?: string;
  status?: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// ==================== UTILITY TYPES ====================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type ID = string | number;

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
}

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
  professional_id?: number;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  status?: AppointmentStatus;
  type?: 'appointment' | 'block' | 'available';
}
