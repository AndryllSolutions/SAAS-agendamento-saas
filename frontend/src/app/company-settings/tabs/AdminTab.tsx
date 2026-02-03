'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Settings, Globe, DollarSign, MapPin, Clock, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import companySettingsService, { AdminSettings, Language, Currency, Country } from '@/services/companySettingsService'

interface Props {
  data?: AdminSettings
  onUpdate: () => void
}

export default function AdminTab({ data, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<AdminSettings>>({
    default_message_language: Language.PT_BR,
    currency: Currency.BRL,
    country: Country.BR,
    timezone: 'America/Sao_Paulo',
    date_format: 'DD/MM/YYYY',
    time_format: 'HH:mm',
    additional_settings: {}
  })

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setLoading(true)
      await companySettingsService.updateAdminSettings(formData)
      toast.success('Configurações administrativas atualizadas!')
      onUpdate()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.response?.data?.detail || 'Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }

  const languages = [
    { value: Language.PT_BR, label: '🇧🇷 Português (Brasil)', description: 'Idioma padrão para mensagens' },
    { value: Language.ES, label: '🇪🇸 Español', description: 'Spanish language' },
    { value: Language.EN, label: '🇺🇸 English', description: 'English language' }
  ]

  const currencies = [
    { value: Currency.BRL, label: 'BRL - Real Brasileiro', symbol: 'R$' },
    { value: Currency.USD, label: 'USD - Dólar Americano', symbol: '$' },
    { value: Currency.EUR, label: 'EUR - Euro', symbol: '€' },
    { value: Currency.ARS, label: 'ARS - Peso Argentino', symbol: '$' },
    { value: Currency.CLP, label: 'CLP - Peso Chileno', symbol: '$' }
  ]

  const countries = [
    { value: Country.BR, label: '🇧🇷 Brasil', phone: '+55', doc: 'CPF/CNPJ' },
    { value: Country.AR, label: '🇦🇷 Argentina', phone: '+54', doc: 'DNI/CUIT' },
    { value: Country.CL, label: '🇨🇱 Chile', phone: '+56', doc: 'RUT' },
    { value: Country.US, label: '🇺🇸 Estados Unidos', phone: '+1', doc: 'SSN/EIN' }
  ]

  const timezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
    { value: 'America/Manaus', label: 'Manaus (GMT-4)' },
    { value: 'America/Rio_Branco', label: 'Rio Branco (GMT-5)' },
    { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)' },
    { value: 'America/Santiago', label: 'Santiago (GMT-3/GMT-4)' },
    { value: 'America/New_York', label: 'New York (GMT-5/GMT-4)' },
    { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-8/GMT-7)' }
  ]

  const dateFormats = [
    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY', example: '31/12/2025' },
    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY', example: '12/31/2025' },
    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD', example: '2025-12-31' }
  ]

  const timeFormats = [
    { value: 'HH:mm', label: '24 horas (HH:mm)', example: '14:30' },
    { value: 'hh:mm A', label: '12 horas (hh:mm AM/PM)', example: '02:30 PM' }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Configurações Administrativas</h2>
        <p className="text-gray-600">
          Parâmetros globais usados em mensagens, relatórios e validações
        </p>
      </div>

      {/* Idioma Padrão (Mensagens) */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Globe className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Idioma Padrão (Mensagens)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Define o idioma padrão para WhatsApp, SMS e e-mails automáticos
            </p>

            <div className="space-y-3">
              {languages.map((lang) => (
                <label
                  key={lang.value}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="message_language"
                    value={lang.value}
                    checked={formData.default_message_language === lang.value}
                    onChange={(e) => setFormData({ ...formData, default_message_language: e.target.value as Language })}
                    className="text-primary focus:ring-primary"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{lang.label}</div>
                    <div className="text-sm text-gray-600">{lang.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Moeda */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <DollarSign className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Moeda
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Moeda principal usada no financeiro, relatórios e agendamento online
            </p>

            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as Currency })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {currencies.map((curr) => (
                <option key={curr.value} value={curr.value}>
                  {curr.label} ({curr.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* País */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              País
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Define país base (impacta máscaras de telefone e documentos)
            </p>

            <div className="space-y-3">
              {countries.map((country) => (
                <label
                  key={country.value}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                >
                  <input
                    type="radio"
                    name="country"
                    value={country.value}
                    checked={formData.country === country.value}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value as Country })}
                    className="text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{country.label}</div>
                    <div className="text-sm text-gray-600">
                      Telefone: {country.phone} • Documento: {country.doc}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timezone */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fuso Horário
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Fuso horário usado para agendamentos e relatórios
            </p>

            <select
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Formatos */}
      <div className="border border-gray-200 rounded-lg p-6 space-y-6">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Formatos de Data e Hora
            </h3>

            {/* Formato de Data */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Formato de Data
              </label>
              <div className="space-y-2">
                {dateFormats.map((format) => (
                  <label
                    key={format.value}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="date_format"
                        value={format.value}
                        checked={formData.date_format === format.value}
                        onChange={(e) => setFormData({ ...formData, date_format: e.target.value })}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="font-medium text-gray-900">{format.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">Ex: {format.example}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Formato de Hora */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Formato de Hora
              </label>
              <div className="space-y-2">
                {timeFormats.map((format) => (
                  <label
                    key={format.value}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 border-2 border-transparent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="time_format"
                        value={format.value}
                        checked={formData.time_format === format.value}
                        onChange={(e) => setFormData({ ...formData, time_format: e.target.value })}
                        className="text-primary focus:ring-primary"
                      />
                      <span className="font-medium text-gray-900">{format.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">Ex: {format.example}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t">
        <p className="text-sm text-gray-500">
          Estas configurações afetam todo o sistema
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
