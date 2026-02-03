'use client'

import { useState, useEffect } from 'react'
import { financialService } from '@/services/api'
import { Plus, Lock, Calculator, X, History, FileText } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import { useAuthStore } from '@/store/authStore'
import * as Tabs from '@radix-ui/react-tabs'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function CashRegistersPage() {
  const [cashRegisters, setCashRegisters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showCloseModal, setShowCloseModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [registerToClose, setRegisterToClose] = useState<any | null>(null)
  const [selectedRegister, setSelectedRegister] = useState<any | null>(null)
  const [conferenceData, setConferenceData] = useState<any | null>(null)
  const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary')
  const [formData, setFormData] = useState({
    opening_balance: 0,
  })
  const [closeData, setCloseData] = useState({
    closing_balance: 0,
  })
  const { user } = useAuthStore()

  useEffect(() => {
    loadCashRegisters()
  }, [])

  useEffect(() => {
    if (selectedRegister && showDetailsModal) {
      loadConferenceData()
    }
  }, [selectedRegister, showDetailsModal])

  const loadCashRegisters = async () => {
    try {
      setLoading(true)
      const response = await financialService.listCashRegisters()
      setCashRegisters(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar caixas')
    } finally {
      setLoading(false)
    }
  }

  const loadConferenceData = async () => {
    if (!selectedRegister) return
    try {
      const response = await financialService.getCashRegisterConference(selectedRegister.id)
      setConferenceData(response.data)
    } catch (error: any) {
      console.error('Erro ao carregar conferência:', error)
      // Set default data if error
      setConferenceData({
        opening_balance: selectedRegister.opening_balance || 0,
        movements: 0,
        cash_balance: selectedRegister.opening_balance || 0,
        other_payments: {},
        total_received: 0,
        total_to_receive: 0,
        payment_summary: {}
      })
    }
  }

  const formatCurrency = (value: number | string | null | undefined) => {
    const num = Number(value || 0)
    return num.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return format(date, "dd/MM/yyyy, HH:mm'h'", { locale: ptBR })
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      bank_transfer: 'Transferência',
    }
    return labels[method] || method
  }

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.company_id) {
      toast.error('Empresa não identificada para abrir o caixa')
      return
    }

    const payload = {
      company_id: user.company_id,
      opening_balance: formData.opening_balance,
    }

    try {
      await financialService.openCashRegister(payload)
      toast.success('Caixa aberto!')
      setShowModal(false)
      setFormData({ opening_balance: 0 })
      loadCashRegisters()
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao abrir caixa')
    }
  }

  const handleClose = async (id: number) => {
    if (!closeData.closing_balance && closeData.closing_balance !== 0) {
      toast.error('Informe o saldo de fechamento')
      return
    }

    const payload = {
      closing_balance: closeData.closing_balance,
      payment_summary: conferenceData?.payment_summary || {},
    }

    try {
      await financialService.closeCashRegister(id, payload)
      toast.success('Caixa fechado!')
      setShowCloseModal(false)
      setShowDetailsModal(false)
      setRegisterToClose(null)
      setSelectedRegister(null)
      setCloseData({ closing_balance: 0 })
      loadCashRegisters()
    } catch (error: any) {
      toast.error('Erro ao fechar caixa')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'is_open', 
      label: 'Status',
      render: (cr: any) => (
        <span className={cr.is_open ? 'text-green-600 font-semibold' : 'text-gray-600'}>
          {cr.is_open ? 'Aberto' : 'Fechado'}
        </span>
      )
    },
    { 
      key: 'opening_balance', 
      label: 'Valor Inicial',
      render: (cr: any) => formatCurrency(cr.opening_balance)
    },
    { 
      key: 'opening_date', 
      label: 'Aberto em',
      render: (cr: any) => formatDateTime(cr.opening_date)
    },
  ]

  const openRegister = cashRegisters.find(r => r.is_open)

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Caixa</h1>
            <p className="text-gray-600 mt-1">Gerencie abertura e fechamento de caixa</p>
          </div>
          <div className="flex gap-3">
            {openRegister && (
              <button
                onClick={() => {
                  setSelectedRegister(openRegister)
                  setShowDetailsModal(true)
                }}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                <History className="w-5 h-5" />
                Histórico
              </button>
            )}
            {!openRegister && (
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
                Abrir Caixa
              </button>
            )}
          </div>
        </div>

        {/* Open Cash Register Card */}
        {openRegister && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-green-600">Caixa aberto</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Caixa aberto em {formatDateTime(openRegister.opening_date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Saldo em caixa</p>
                <p className="text-3xl font-bold text-green-600">
                  {formatCurrency(conferenceData?.cash_balance || openRegister.opening_balance)}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => {
                  setSelectedRegister(openRegister)
                  setShowDetailsModal(true)
                }}
                className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                <Calculator className="w-4 h-4" />
                Conferir caixa
              </button>
              <button
                onClick={() => {
                  setRegisterToClose(openRegister)
                  setCloseData({
                    closing_balance: Number(conferenceData?.cash_balance || openRegister.opening_balance),
                  })
                  setShowCloseModal(true)
                }}
                className="flex items-center gap-2 bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700"
              >
                <Lock className="w-4 h-4" />
                Fechar caixa
              </button>
            </div>
          </div>
        )}

        {/* Cash Registers List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Histórico de Caixas</h2>
          </div>
          <DataTable
            data={cashRegisters}
            columns={columns}
            loading={loading}
            actions={(cr) => (
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    setSelectedRegister(cr)
                    setShowDetailsModal(true)
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                  title="Consultar caixa"
                >
                  <Calculator className="w-4 h-4" />
                </button>
                {cr.is_open && (
                  <button
                    onClick={() => {
                      setRegisterToClose(cr)
                      setCloseData({
                        closing_balance: Number(cr.opening_balance || 0),
                      })
                      setShowCloseModal(true)
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Fechar caixa"
                  >
                    <Lock className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          />
        </div>

        {/* Open Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Abrir Caixa</h2>
              <form onSubmit={handleOpen} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valor Inicial</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.opening_balance}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        opening_balance: parseFloat(e.target.value || '0'),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setFormData({ opening_balance: 0 })
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Abrir Caixa
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Close Modal */}
        {showCloseModal && registerToClose && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Fechar Caixa #{registerToClose.id}</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleClose(registerToClose.id)
                }}
                className="space-y-4"
              >
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    Valor de abertura:{' '}
                    <span className="font-semibold">
                      {formatCurrency(registerToClose.opening_balance)}
                    </span>
                  </p>
                  <label className="block text-sm font-medium mb-1">Saldo em caixa no fechamento</label>
                  <input
                    type="number"
                    step="0.01"
                    value={closeData.closing_balance}
                    onChange={(e) =>
                      setCloseData({
                        closing_balance: parseFloat(e.target.value || '0'),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2"
                    required
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCloseModal(false)
                      setRegisterToClose(null)
                      setCloseData({ closing_balance: 0 })
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Confirmar Fechamento
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedRegister && conferenceData && (
          <div className="fixed inset-0 bg-black/50 flex items-stretch justify-end z-50">
            <div className="bg-white h-full w-full max-w-4xl shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between px-8 py-6 border-b">
                <div>
                  <h2 className="text-3xl font-bold text-green-600">
                    {selectedRegister.is_open ? 'Caixa aberto' : 'Caixa fechado'}
                  </h2>
                  <p className="mt-3 text-sm text-gray-700">
                    Caixa aberto em {formatDateTime(selectedRegister.opening_date)}
                  </p>
                  {!selectedRegister.is_open && selectedRegister.closing_date && (
                    <p className="text-sm text-gray-500">
                      Fechado em {formatDateTime(selectedRegister.closing_date)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedRegister(null)
                    setConferenceData(null)
                  }}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-8 py-6">
                <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as 'summary' | 'detailed')} className="space-y-6">
                  <Tabs.List className="flex border-b border-gray-200">
                    <Tabs.Trigger
                      value="summary"
                      className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
                    >
                      Resumido
                    </Tabs.Trigger>
                    <Tabs.Trigger
                      value="detailed"
                      className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
                    >
                      Detalhado
                    </Tabs.Trigger>
                  </Tabs.List>

                  <Tabs.Content value="summary" className="space-y-6">
                    {/* Conferência de caixa */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Conferência de caixa</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Saldo inicial</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(conferenceData.opening_balance)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Dinheiro</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(conferenceData.movements)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Saldo inicial</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(conferenceData.opening_balance)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Movimentações</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(conferenceData.movements)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-lg font-semibold text-gray-900">Saldo em caixa</span>
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(conferenceData.cash_balance)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Outros pagamentos */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Outros pagamentos</h3>
                      <div className="space-y-3">
                        {Object.entries(conferenceData.other_payments || {}).map(([method, data]: [string, any]) => (
                          <div key={method} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {getPaymentMethodLabel(method)}
                              {data.available_days > 0 && (
                                <span className="text-xs text-gray-500 ml-2">
                                  (Disponível em {data.available_days} dias)
                                </span>
                              )}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(data.total)}
                            </span>
                          </div>
                        ))}
                        {Object.keys(conferenceData.other_payments || {}).length === 0 && (
                          <p className="text-sm text-gray-500">Nenhum outro pagamento registrado</p>
                        )}
                        <div className="flex items-center justify-between pt-3 border-t">
                          <span className="text-lg font-semibold text-gray-900">Total recebido</span>
                          <span className="text-xl font-bold text-green-600">
                            {formatCurrency(conferenceData.total_received)}
                          </span>
                        </div>
                        {conferenceData.total_to_receive > 0 && (
                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm font-medium text-gray-600">Total à receber</span>
                            <span className="text-lg font-semibold text-green-600">
                              {formatCurrency(conferenceData.total_to_receive)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Tabs.Content>

                  <Tabs.Content value="detailed" className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-4">Detalhamento completo</h3>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Movimentações de Caixa</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Saldo inicial:</span>
                              <span className="font-medium">{formatCurrency(conferenceData.opening_balance)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Entradas (Dinheiro):</span>
                              <span className="font-medium text-green-600">
                                +{formatCurrency(conferenceData.movements)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-semibold">Saldo em caixa:</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(conferenceData.cash_balance)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Outros Pagamentos</h4>
                          <div className="space-y-2 text-sm">
                            {Object.entries(conferenceData.other_payments || {}).map(([method, data]: [string, any]) => (
                              <div key={method} className="flex justify-between">
                                <span>
                                  {getPaymentMethodLabel(method)}
                                  {data.available_days > 0 && (
                                    <span className="text-xs text-gray-500 ml-2">
                                      (Disponível em {data.available_days} dias)
                                    </span>
                                  )}
                                </span>
                                <span className="font-medium">{formatCurrency(data.total)}</span>
                              </div>
                            ))}
                            {Object.keys(conferenceData.other_payments || {}).length === 0 && (
                              <p className="text-gray-500">Nenhum outro pagamento</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">Resumo Financeiro</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Total recebido:</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(conferenceData.total_received)}
                              </span>
                            </div>
                            {conferenceData.total_to_receive > 0 && (
                              <div className="flex justify-between">
                                <span>Total à receber:</span>
                                <span className="font-bold text-blue-600">
                                  {formatCurrency(conferenceData.total_to_receive)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Tabs.Content>
                </Tabs.Root>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-8 py-4 border-t bg-gray-50">
                <button
                  type="button"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedRegister(null)
                    setConferenceData(null)
                  }}
                >
                  Fechar
                </button>
                {selectedRegister.is_open && (
                  <button
                    type="button"
                    className="px-5 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90"
                    onClick={() => {
                      setShowDetailsModal(false)
                      setRegisterToClose(selectedRegister)
                      setCloseData({
                        closing_balance: Number(conferenceData.cash_balance),
                      })
                      setShowCloseModal(true)
                    }}
                  >
                    Fechar caixa
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
