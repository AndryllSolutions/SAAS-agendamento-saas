/**
 * User Service
 * Handles user-related API operations
 */

import api from './api'

export interface ChangePasswordRequest {
  old_password: string
  new_password: string
}

export interface UpdateProfileRequest {
  name?: string
  email?: string
  phone?: string
  avatar_url?: string
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  notifications?: {
    email: boolean
    sms: boolean
    whatsapp: boolean
    push: boolean
  }
}

export const userService = {
  // Change password
  changePassword: (data: ChangePasswordRequest) =>
    api.put('/users/change-password', data),

  // Update profile
  updateProfile: (data: UpdateProfileRequest) =>
    api.put('/users/profile', data),

  // Get current user profile
  getProfile: () =>
    api.get('/users/profile'),

  // Update user preferences
  updatePreferences: (preferences: UserPreferences) =>
    api.put('/users/preferences', preferences),

  // Get user preferences
  getPreferences: () =>
    api.get('/users/preferences'),

  // Upload avatar
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('avatar', file)
    return api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Delete account (soft delete)
  deleteAccount: (password: string) =>
    api.delete('/users/account', { data: { password } }),

  // Get user sessions (active tokens)
  getSessions: () =>
    api.get('/users/sessions'),

  // Revoke session
  revokeSession: (sessionId: string) =>
    api.delete(`/users/sessions/${sessionId}`),

  // Revoke all sessions except current
  revokeAllSessions: () =>
    api.delete('/users/sessions/all'),
}
