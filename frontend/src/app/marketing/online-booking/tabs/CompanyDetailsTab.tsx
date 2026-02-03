'use client'

import { useState, useEffect } from 'react'
import { Upload, Save, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { onlineBookingService, OnlineBookingConfig } from '@/services/onlineBookingService'
import { companyService } from '@/services/api'

export default function CompanyDetailsTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<OnlineBookingConfig>({})
  const [companyData, setCompanyData] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [configData, company] = await Promise.all([
        onlineBookingService.getConfig(),
        companyService.getCurrentCompany()
      ])
      setConfig(configData)
      setCompanyData(company.data)
    } catch (error: any) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onlineBookingService.updateConfig(config)
      toast.success('Configurações salvas com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof OnlineBookingConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Informações da Empresa</h3>
        <p className="text-sm text-gray-600 mb-6">
          Configure as informações que aparecerão na sua página pública de agendamento
        </p>
      </div>

      {/* Logo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo da empresa
        </label>
        <div className="flex items-center gap-4">
          {config.logo_url && (
            <img
              src={config.logo_url}
              alt="Logo"
              className="w-20 h-20 object-contain rounded-lg border"
            />
          )}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <Upload className="w-4 h-4" />
            Alterar logo
          </button>
        </div>
      </div>

      {/* Nome da empresa */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome da empresa
        </label>
        <input
          type="text"
          value={config.public_name || companyData?.name || ''}
          onChange={(e) => handleChange('public_name', e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Nome que aparecerá na página pública"
        />
      </div>

      {/* Descrição */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          value={config.public_description || ''}
          onChange={(e) => handleChange('public_description', e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Informe uma descrição sobre seu estabelecimento para que seu cliente saiba um pouco sobre seu negócio e propósito"
        />
      </div>

      {/* Endereço */}
      <div>
        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={config.use_company_address !== false}
            onChange={(e) => handleChange('use_company_address', e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium text-gray-700">
            Utilizar endereço cadastrado nos Detalhes da Empresa
          </span>
        </label>

        {config.use_company_address === false && (
          <div className="space-y-4 pl-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço
                </label>
                <input
                  type="text"
                  value={config.public_address || ''}
                  onChange={(e) => handleChange('public_address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={config.public_address_number || ''}
                  onChange={(e) => handleChange('public_address_number', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  value={config.public_address_complement || ''}
                  onChange={(e) => handleChange('public_address_complement', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  value={config.public_neighborhood || ''}
                  onChange={(e) => handleChange('public_neighborhood', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade
                </label>
                <input
                  type="text"
                  value={config.public_city || ''}
                  onChange={(e) => handleChange('public_city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contatos */}
      <div>
        <h4 className="text-md font-semibold mb-4">Contatos</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <input
              type="text"
              value={config.public_whatsapp || ''}
              onChange={(e) => handleChange('public_whatsapp', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+55 (45) 99804-5387"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="text"
              value={config.public_phone || ''}
              onChange={(e) => handleChange('public_phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="+55 (45) 30284-198"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instagram
            </label>
            <input
              type="text"
              value={config.public_instagram || ''}
              onChange={(e) => handleChange('public_instagram', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="instagram.com/imperiocapelli/"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facebook
            </label>
            <input
              type="text"
              value={config.public_facebook || ''}
              onChange={(e) => handleChange('public_facebook', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="facebook.com/imperiocapelli"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Site
            </label>
            <input
              type="text"
              value={config.public_website || ''}
              onChange={(e) => handleChange('public_website', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="https://sites.google.com/view/imperiocapelli/i"
            />
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <div className="flex justify-end pt-4 border-t">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar
            </>
          )}
        </button>
      </div>
    </div>
  )
}
