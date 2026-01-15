'use client'

import { useState, useEffect } from 'react'
import { X, User, MapPin, Instagram, Facebook, Settings, Hash, Users, AlertCircle } from 'lucide-react'

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  initialData?: any
  loading?: boolean
}

const ClientModal = ({ isOpen, onClose, onSubmit, initialData, loading }: ClientModalProps) => {
  const [activeTab, setActiveTab] = useState('cadastro')
  const [formData, setFormData] = useState({
    // Identificação
    full_name: '',
    nickname: '',
    email: '',
    phone: '',
    cellphone: '',
    
    // Dados Pessoais
    date_of_birth: '',
    cpf: '',
    cnpj: '',
    
    // Endereço
    address: '',
    address_number: '',
    address_complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    
    // Relacionamentos
    dependents: [],
    referred_by: '',
    hashtags: [],
    
    // Observações
    notes: '',
    
    // Marketing
    marketing_whatsapp: false,
    marketing_email: false,
    
    // Configurações
    default_discount: 0,
    is_active: true,
    notifications_enabled: true,
    block_access: false,
    
    // Redes Sociais
    instagram: '',
    facebook: '',
  })

  const tabs = [
    { id: 'cadastro', label: 'Cadastro', icon: User },
    { id: 'painel', label: 'Painel', icon: User, disabled: !initialData },
    { id: 'debitos', label: 'Débitos', icon: Settings, disabled: !initialData },
    { id: 'creditos', label: 'Créditos', icon: Settings, disabled: !initialData },
    { id: 'cashback', label: 'Cashback', icon: Settings, disabled: !initialData },
    { id: 'agendamentos', label: 'Agendamentos', icon: Settings, disabled: !initialData },
    { id: 'vendas', label: 'Vendas', icon: Settings, disabled: !initialData },
    { id: 'pacotes', label: 'Pacotes', icon: Settings, disabled: !initialData },
    { id: 'mensagens', label: 'Mensagens', icon: Settings, disabled: !initialData },
    { id: 'anotacoes', label: 'Anotações', icon: Settings, disabled: !initialData },
  ]

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        date_of_birth: initialData.date_of_birth || '',
      })
    } else {
      // Reset form para novo cliente
      setFormData({
        full_name: '',
        nickname: '',
        email: '',
        phone: '',
        cellphone: '',
        date_of_birth: '',
        cpf: '',
        cnpj: '',
        address: '',
        address_number: '',
        address_complement: '',
        neighborhood: '',
        city: '',
        state: '',
        zip_code: '',
        dependents: [],
        referred_by: '',
        hashtags: [],
        notes: '',
        marketing_whatsapp: false,
        marketing_email: false,
        default_discount: 0,
        is_active: true,
        notifications_enabled: true,
        block_access: false,
        instagram: '',
        facebook: '',
      })
    }
  }, [initialData, isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação básica
    if (!formData.full_name.trim()) {
      alert('Nome é obrigatório')
      return
    }
    
    // Preparar dados para envio (remover campos que não existem no backend)
    const submitData = {
      full_name: formData.full_name,
      nickname: formData.nickname,
      email: formData.email,
      phone: formData.phone,
      cellphone: formData.cellphone,
      date_of_birth: formData.date_of_birth,
      cpf: formData.cpf,
      cnpj: formData.cnpj,
      address: formData.address,
      address_number: formData.address_number,
      address_complement: formData.address_complement,
      neighborhood: formData.neighborhood,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      notes: formData.notes,
      marketing_whatsapp: formData.marketing_whatsapp,
      marketing_email: formData.marketing_email,
      is_active: formData.is_active,
    }
    
    onSubmit(submitData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {initialData ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Menu Lateral */}
          <div className="w-64 border-r bg-gray-50">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => !tab.disabled && setActiveTab(tab.id)}
                    disabled={tab.disabled}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors text-sm ${
                      tab.disabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'hover:bg-gray-200 text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 flex">
            <form onSubmit={handleSubmit} className="flex-1 p-6 overflow-y-auto">
              {/* Aba Cadastro */}
              {activeTab === 'cadastro' && (
                <div className="space-y-6">
                  {/* Foto/Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Alterar Foto
                    </button>
                  </div>

                  {/* Identificação */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Identificação</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Apelido</label>
                        <input
                          type="text"
                          value={formData.nickname}
                          onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                        <input
                          type="tel"
                          value={formData.cellphone}
                          onChange={(e) => setFormData({ ...formData, cellphone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dados Pessoais */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Dados Pessoais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aniversário
                        </label>
                        <input
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                        <input
                          type="text"
                          value={formData.cpf}
                          onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="000.000.000-00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                        <input
                          type="text"
                          value={formData.cnpj}
                          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Relacionamentos */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Relacionamentos</h3>
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600" />
                          <span className="text-sm text-yellow-800">
                            Crie o cliente para editar dependentes
                          </span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Indicado por</label>
                        <select
                          value={formData.referred_by}
                          onChange={(e) => setFormData({ ...formData, referred_by: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Selecione um cliente</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hashtags</label>
                        <input
                          type="text"
                          value={formData.hashtags.join(', ')}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            hashtags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                          placeholder="ex: cliente-vip, aniversariante, categoria-a"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      rows={3}
                      placeholder="Observações internas sobre o cliente..."
                    />
                  </div>
                </div>
              )}

              {/* Demais Abas (Placeholder) */}
              {activeTab !== 'cadastro' && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    {tabs.find(t => t.id === activeTab)?.label} - Funcionalidade em desenvolvimento
                  </p>
                </div>
              )}
            </form>

            {/* Painéis Laterais */}
            <div className="w-80 border-l p-6 space-y-6 overflow-y-auto">
              {/* Endereço */}
              <div>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Endereço
                  </span>
                  <span>▼</span>
                </button>
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    placeholder="Rua, Avenida..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Número"
                      value={formData.address_number}
                      onChange={(e) => setFormData({ ...formData, address_number: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Complemento"
                      value={formData.address_complement}
                      onChange={(e) => setFormData({ ...formData, address_complement: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Bairro"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Cidade"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input
                      type="text"
                      placeholder="UF"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      maxLength={2}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="CEP"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              {/* Redes Sociais */}
              <div>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    <Instagram className="w-4 h-4" />
                    Redes Sociais
                  </span>
                  <span>▼</span>
                </button>
                <div className="mt-2 space-y-2">
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                    <input
                      type="text"
                      placeholder="Instagram"
                      value={formData.instagram}
                      onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-gray-400 text-sm">@</span>
                    <input
                      type="text"
                      placeholder="Facebook"
                      value={formData.facebook}
                      onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Configurações */}
              <div>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Configurações
                  </span>
                  <span>▼</span>
                </button>
                <div className="mt-2 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Desconto Padrão (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.default_discount}
                      onChange={(e) => setFormData({ ...formData, default_discount: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Ativo</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.notifications_enabled}
                        onChange={(e) => setFormData({ ...formData, notifications_enabled: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Notificações</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.block_access}
                        onChange={(e) => setFormData({ ...formData, block_access: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Bloquear acesso</span>
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.marketing_whatsapp}
                        onChange={(e) => setFormData({ ...formData, marketing_whatsapp: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Marketing WhatsApp</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.marketing_email}
                        onChange={(e) => setFormData({ ...formData, marketing_email: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm">Marketing E-mail</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ClientModal
