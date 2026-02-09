export interface CompanyProfile {
  id: number
  name: string
  slug?: string
  logoUrl?: string
  logo_url?: string
  primaryColor?: string
  address?: string
  phone?: string
  whatsapp?: string
  instagram?: string
  description?: string
  isOpen?: boolean
  status?: 'open' | 'closed'
}

export interface ServiceItem {
  id: number
  name: string
  description?: string
  category?: string
  durationMin?: number
  duration_minutes?: number
  priceFrom?: number
  price_from?: number
  imageUrl?: string
  image_url?: string
}

export interface ProfessionalItem {
  id: number
  name: string
  full_name?: string
  role?: string
  specialty?: string
  avatarUrl?: string
  avatar_url?: string
}

export interface AvailabilityResponse {
  date: string
  slots: string[]
}

export interface BookingFormValues {
  name: string
  phone: string
  email?: string
  notes?: string
}
