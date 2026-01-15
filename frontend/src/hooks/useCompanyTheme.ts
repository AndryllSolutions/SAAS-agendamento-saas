/**
 * Hook para carregar e aplicar configuracoes de tema da empresa
 */
import { useEffect, useState } from 'react'
import { companySettingsService, ThemeSettings } from '@/services/companySettingsService'

export const useCompanyTheme = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadThemeSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const settings = await companySettingsService.getThemeSettings()
      setThemeSettings(settings)
      applyTheme(settings)
    } catch (error: any) {
      console.error('❌ Erro ao carregar configurações de tema:', error)
      setError(error.response?.data?.detail || 'Erro ao carregar tema')
    } finally {
      setLoading(false)
    }
  }

  const applyTheme = (settings: ThemeSettings) => {
    if (!settings) return

    // Aplicar cor da sidebar
    if (settings.sidebar_color) {
      document.documentElement.style.setProperty('--sidebar-color', settings.sidebar_color)
    }

    // Aplicar modo de tema (light/dark)
    if (settings.theme_mode) {
      const root = document.documentElement
      
      if (settings.theme_mode === 'dark') {
        root.classList.add('dark')
      } else if (settings.theme_mode === 'light') {
        root.classList.remove('dark')
      } else if (settings.theme_mode === 'auto') {
        // Detectar preferencia do sistema
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      }
    }

    // Aplicar idioma da interface
    if (settings.interface_language) {
      document.documentElement.lang = settings.interface_language
    }
  }

  const updateTheme = async (updates: Partial<ThemeSettings>) => {
    try {
      setLoading(true)
      setError(null)
      const updatedSettings = await companySettingsService.updateThemeSettings(updates)
      
      // Mesclar com configurações existentes
      const newSettings = { ...themeSettings, ...updatedSettings }
      setThemeSettings(newSettings)
      applyTheme(newSettings)
      
      return newSettings
    } catch (error: any) {
      console.error('❌ Erro ao atualizar tema:', error)
      setError(error.response?.data?.detail || 'Erro ao atualizar tema')
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    themeSettings,
    loading,
    error,
    updateTheme,
    reloadTheme: loadThemeSettings
  }
}
