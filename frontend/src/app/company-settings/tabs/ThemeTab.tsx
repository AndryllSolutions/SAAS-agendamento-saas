'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Palette, Globe, Image, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import companySettingsService, { ThemeSettings, Language } from '@/services/companySettingsService'
import { useCompanyTheme } from '@/hooks/useCompanyTheme'

interface Props {
  data?: ThemeSettings
  onUpdate: () => void
}

export default function ThemeTab({ data, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<ThemeSettings>>({
    interface_language: Language.PT_BR,
    sidebar_color: '#6366f1',
    theme_mode: 'light',
    custom_logo_url: ''
  })
  const { updateTheme } = useCompanyTheme()

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      
      // Atualizar no backend
      await companySettingsService.updateThemeSettings(formData)
      
      // Aplicar imediatamente no frontend
      await updateTheme(formData)
      
      toast.success('✅ Configurações de tema atualizadas e aplicadas!')
      onUpdate()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.response?.data?.detail || 'Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const predefinedColors = [
    { name: 'Índigo', value: '#6366f1' },
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Verde', value: '#10b981' },
    { name: 'Roxo', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Vermelho', value: '#ef4444' },
    { name: 'Laranja', value: '#f97316' },
    { name: 'Amarelo', value: '#eab308' },
    { name: 'Ciano', value: '#06b6d4' },
    { name: 'Cinza', value: '#6b7280' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Personalizar Aparência</h2>
        <p className="text-gray-600">
          Customize a aparência e idioma do sistema
        </p>
      </div>

      {/* Idioma da Interface */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Idioma do Sistema
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Define o idioma da interface administrativa
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    Funcionalidade Beta
                  </p>
                  <p className="text-sm text-yellow-800">
                    A tradução está em desenvolvimento. Algumas partes do sistema podem permanecer em português.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="language"
                  value={Language.PT_BR}
                  checked={formData.interface_language === Language.PT_BR}
                  onChange={(e) => setFormData({ ...formData, interface_language: e.target.value as Language })}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-gray-900">🇧🇷 Português (Brasil)</div>
                  <div className="text-sm text-gray-600">Idioma padrão do sistema</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="radio"
                  name="language"
                  value={Language.ES}
                  checked={formData.interface_language === Language.ES}
                  onChange={(e) => setFormData({ ...formData, interface_language: e.target.value as Language })}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <div className="font-medium text-gray-900">🇪🇸 Español</div>
                  <div className="text-sm text-gray-600">Spanish language (Beta)</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Cor do Menu Lateral */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Palette className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cor do Menu Lateral
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Personalize a cor principal do sistema
            </p>

            {/* Cores Predefinidas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cores Predefinidas
              </label>
              <div className="grid grid-cols-5 gap-3">
                {predefinedColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, sidebar_color: color.value })}
                    className={`group relative aspect-square rounded-lg border-2 transition-all hover:scale-105 ${
                      formData.sidebar_color === color.value
                        ? 'border-gray-900 ring-2 ring-gray-900 ring-offset-2'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.value }}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-white font-medium text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-lg">
                      {color.name}
                    </span>
                    {formData.sidebar_color === color.value && (
                      <span className="absolute inset-0 flex items-center justify-center text-white">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Cor Personalizada */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Personalizada
              </label>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    type="color"
                    value={formData.sidebar_color}
                    onChange={(e) => setFormData({ ...formData, sidebar_color: e.target.value })}
                    className="w-20 h-12 rounded-lg border border-gray-300 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={formData.sidebar_color}
                  onChange={(e) => setFormData({ ...formData, sidebar_color: e.target.value })}
                  placeholder="#6366f1"
                  maxLength={7}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono uppercase"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Use o formato hexadecimal (#RRGGBB)
              </p>
            </div>

            {/* Preview */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Pré-visualização</p>
              <div className="flex gap-3">
                <div
                  className="w-24 h-24 rounded-lg shadow-md flex items-center justify-center text-white font-semibold"
                  style={{ backgroundColor: formData.sidebar_color }}
                >
                  Menu
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  <div
                    className="h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.sidebar_color, opacity: 0.9 }}
                  />
                  <div
                    className="h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.sidebar_color, opacity: 0.7 }}
                  />
                  <div
                    className="h-8 rounded-lg shadow-sm"
                    style={{ backgroundColor: formData.sidebar_color, opacity: 0.5 }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logo Personalizada */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Image className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Logo Personalizada
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              URL da logo personalizada (opcional)
            </p>

            <input
              type="url"
              value={formData.custom_logo_url}
              onChange={(e) => setFormData({ ...formData, custom_logo_url: e.target.value })}
              placeholder="https://exemplo.com/logo.png"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              Recomendado: PNG ou SVG com fundo transparente, tamanho máximo 200x60px
            </p>

            {formData.custom_logo_url && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-3">Pré-visualização</p>
                <div className="bg-white p-4 rounded-lg border border-gray-200 inline-block">
                  <img
                    src={formData.custom_logo_url}
                    alt="Logo Preview"
                    className="max-h-16 max-w-[200px]"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="60"%3E%3Crect fill="%23f3f4f6" width="200" height="60"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%236b7280" font-family="sans-serif" font-size="12"%3EErro ao carregar%3C/text%3E%3C/svg%3E'
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t">
        <p className="text-sm text-gray-500">
          As alterações serão aplicadas imediatamente após salvar
        </p>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>
    </form>
  )
}
