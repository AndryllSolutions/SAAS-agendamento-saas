'use client'

import { useState, useEffect } from 'react'
import { Save, Loader2, Search, Building2, FileText, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import companySettingsService, { CompanyDetails, CompanyType } from '@/services/companySettingsService'

interface Props {
  data?: CompanyDetails
  onUpdate: () => void
}

export default function CompanyDetailsTab({ data, onUpdate }: Props) {
  const [loading, setLoading] = useState(false)
  const [searchingCEP, setSearchingCEP] = useState(false)
  const [formData, setFormData] = useState<Partial<CompanyDetails>>({
    company_type: CompanyType.PESSOA_FISICA,
    document_number: '',
    company_name: '',
    municipal_registration: '',
    state_registration: '',
    email: '',
    phone: '',
    whatsapp: '',
    postal_code: '',
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    country: 'BR'
  })

  useEffect(() => {
    if (data) {
      setFormData(data)
    }
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar documento
    if (formData.document_number) {
      const cleanDoc = formData.document_number.replace(/\D/g, '')
      if (formData.company_type === CompanyType.PESSOA_FISICA) {
        if (cleanDoc.length === 11 && !companySettingsService.validateCPF(cleanDoc)) {
          toast.error('CPF inválido')
          return
        }
      } else {
        if (cleanDoc.length === 14 && !companySettingsService.validateCNPJ(cleanDoc)) {
          toast.error('CNPJ inválido')
          return
        }
      }
    }

    try {
      setLoading(true)
      await companySettingsService.updateDetails(formData)
      toast.success('Detalhes da empresa atualizados com sucesso!')
      onUpdate()
    } catch (error: any) {
      console.error('Erro ao salvar:', error)
      toast.error(error.response?.data?.detail || 'Erro ao salvar detalhes')
    } finally {
      setLoading(false)
    }
  }

  const handleCEPSearch = async () => {
    if (!formData.postal_code) {
      toast.error('Informe o CEP')
      return
    }

    try {
      setSearchingCEP(true)
      const addressData = await companySettingsService.searchAddressByCEP(formData.postal_code)
      
      setFormData({
        ...formData,
        address: addressData.address,
        neighborhood: addressData.neighborhood,
        city: addressData.city,
        state: addressData.state
      })
      
      toast.success('Endereço encontrado!')
    } catch (error) {
      toast.error('CEP não encontrado')
    } finally {
      setSearchingCEP(false)
    }
  }

  const handleDocumentChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    let formatted = value
    
    if (formData.company_type === CompanyType.PESSOA_FISICA && cleanValue.length === 11) {
      formatted = companySettingsService.formatCPF(cleanValue)
    } else if (formData.company_type === CompanyType.PESSOA_JURIDICA && cleanValue.length === 14) {
      formatted = companySettingsService.formatCNPJ(cleanValue)
    }
    
    setFormData({ ...formData, document_number: formatted })
  }

  const handleCEPChange = (value: string) => {
    const cleanValue = value.replace(/\D/g, '')
    const formatted = cleanValue.length === 8 ? companySettingsService.formatCEP(cleanValue) : value
    setFormData({ ...formData, postal_code: formatted })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Detalhes da Empresa</h2>
        <p className="text-gray-600">
          Informações cadastrais, fiscais e de contato da empresa
        </p>
      </div>

      {/* Identificação */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Identificação
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Pessoa *
            </label>
            <select
              value={formData.company_type}
              onChange={(e) => setFormData({ ...formData, company_type: e.target.value as CompanyType, document_number: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value={CompanyType.PESSOA_FISICA}>Pessoa Física</option>
              <option value={CompanyType.PESSOA_JURIDICA}>Pessoa Jurídica</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.company_type === CompanyType.PESSOA_FISICA ? 'CPF' : 'CNPJ'}
            </label>
            <input
              type="text"
              value={formData.document_number}
              onChange={(e) => handleDocumentChange(e.target.value)}
              placeholder={formData.company_type === CompanyType.PESSOA_FISICA ? '000.000.000-00' : '00.000.000/0000-00'}
              maxLength={formData.company_type === CompanyType.PESSOA_FISICA ? 14 : 18}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Empresa
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Nome fantasia ou razão social"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inscrição Municipal
            </label>
            <input
              type="text"
              value={formData.municipal_registration}
              onChange={(e) => setFormData({ ...formData, municipal_registration: e.target.value })}
              placeholder="Opcional"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inscrição Estadual
            </label>
            <input
              type="text"
              value={formData.state_registration}
              onChange={(e) => setFormData({ ...formData, state_registration: e.target.value })}
              placeholder="Opcional"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Contato */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Contato
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail Principal
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="contato@empresa.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(00) 0000-0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp
            </label>
            <input
              type="tel"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              placeholder="(00) 00000-0000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Endereço */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Endereço
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CEP
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => handleCEPChange(e.target.value)}
                placeholder="00000-000"
                maxLength={9}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleCEPSearch}
                disabled={searchingCEP}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {searchingCEP ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço (Logradouro)
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Rua, Avenida, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número
            </label>
            <input
              type="text"
              value={formData.address_number}
              onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
              placeholder="123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Complemento
            </label>
            <input
              type="text"
              value={formData.address_complement}
              onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
              placeholder="Apto, Sala, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bairro
            </label>
            <input
              type="text"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              placeholder="Centro"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="São Paulo"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado (UF)
            </label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
              placeholder="SP"
              maxLength={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              País
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
              placeholder="BR"
              maxLength={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent uppercase"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-6 border-t">
        <p className="text-sm text-gray-500">
          * Campos obrigatórios
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
              Salvar Alterações
            </>
          )}
        </button>
      </div>
    </form>
  )
}
