import { useState, useEffect } from 'react'
import { companySettingsService, Language } from '@/services/companySettingsService'

export function useThemeSettings() {
  const [sidebarColor, setSidebarColor] = useState('#6366f1')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadThemeSettings()
  }, [])

  const loadThemeSettings = async () => {
    try {
      const settings = await companySettingsService.getThemeSettings()
      if (settings.sidebar_color) {
        setSidebarColor(settings.sidebar_color)
        // Apply to CSS variable
        document.documentElement.style.setProperty('--sidebar-color', settings.sidebar_color)
      }
    } catch (error) {
      console.error('Error loading theme settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSidebarColor = async (color: string) => {
    try {
      await companySettingsService.updateThemeSettings({
        sidebar_color: color,
        interface_language: Language.PT_BR,
        theme_mode: 'light'
      })
      setSidebarColor(color)
      document.documentElement.style.setProperty('--sidebar-color', color)
    } catch (error) {
      console.error('Error updating sidebar color:', error)
      throw error
    }
  }

  return {
    sidebarColor,
    loading,
    updateSidebarColor,
    reloadTheme: loadThemeSettings
  }
}
