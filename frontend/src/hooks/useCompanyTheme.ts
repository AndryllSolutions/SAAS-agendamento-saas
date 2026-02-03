/**
 * Hook para carregar e aplicar configuracoes de tema da empresa
 */
import { useEffect, useState } from 'react'
import { companySettingsService, ThemeSettings } from '@/services/companySettingsService'

export const useCompanyTheme = () => {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizeHex = (hex: string) => {
    const value = hex.trim().replace('#', '')
    if (value.length === 3) {
      return `#${value[0]}${value[0]}${value[1]}${value[1]}${value[2]}${value[2]}`.toLowerCase()
    }
    if (value.length === 6) return `#${value}`.toLowerCase()
    return null
  }

  const parseColorToRgb = (color: string): { r: number; g: number; b: number } | null => {
    const trimmed = (color || '').trim()
    if (!trimmed) return null

    if (trimmed.startsWith('#')) {
      const normalized = normalizeHex(trimmed)
      if (!normalized) return null
      const r = parseInt(normalized.slice(1, 3), 16)
      const g = parseInt(normalized.slice(3, 5), 16)
      const b = parseInt(normalized.slice(5, 7), 16)
      if ([r, g, b].some((n) => Number.isNaN(n))) return null
      return { r, g, b }
    }

    const rgbMatch = trimmed.match(/^rgba?\(([^)]+)\)$/i)
    if (rgbMatch) {
      const parts = rgbMatch[1]
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
      if (parts.length < 3) return null
      const r = Number(parts[0])
      const g = Number(parts[1])
      const b = Number(parts[2])
      if ([r, g, b].some((n) => Number.isNaN(n))) return null
      return { r, g, b }
    }

    return null
  }

  const relativeLuminance = (rgb: { r: number; g: number; b: number }) => {
    const toLinear = (c: number) => {
      const s = c / 255
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
    }
    const r = toLinear(rgb.r)
    const g = toLinear(rgb.g)
    const b = toLinear(rgb.b)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const isTooLightForSidebar = (color: string) => {
    const rgb = parseColorToRgb(color)
    if (!rgb) return false
    return relativeLuminance(rgb) > 0.85
  }

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

  useEffect(() => {
    loadThemeSettings()
  }, [])

  const applyTheme = (settings: ThemeSettings) => {
    if (!settings) return

    // Aplicar cor da sidebar
    if (settings.sidebar_color) {
      if (isTooLightForSidebar(settings.sidebar_color)) {
        console.warn('⚠️ sidebar_color muito claro; ignorando para manter contraste')
      } else {
        document.documentElement.style.setProperty('--sidebar-color', settings.sidebar_color)
      }
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
