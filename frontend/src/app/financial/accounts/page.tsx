'use client'

import { useState, useEffect } from 'react'
import { financialService } from '@/services/api'
import { Plus, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import { useAuthStore } from '@/store/authStore'
import * as Tabs from '@radix-ui/react-tabs'

export default function FinancialAccountsPage() {
  const [activeTab, setActiveTab] = useState('accounts')
  const [accounts, setAccounts] = useState<any[]>([])
  const [paymentForms, setPaymentForms] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState({ accounts: true, paymentForms: true, categories: true })
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'account' | 'paymentForm' | 'category'>('account')
  const [selectedItem, setSelectedItem] = useState<any | null>(null)
  const { user } = useAuthStore()

  // Account form
  const [accountForm, setAccountForm] = useState({
    name: '',
    description: '',
    account_type: 'cash',
    balance: 0,
    admin_only: false,
    is_active: true,
  })

  // Payment form
  const [paymentFormData, setPaymentFormData] = useState({
    name: '',
    type: 'cash',
    integrates_with_gateway: false,
    gateway_name: '',
  })

  // Category form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    type: 'income',
    description: '',
  })

  useEffect(() => {
    loadAll()
  }, [])

  const loadAll = async () => {
    await Promise.all([
      loadAccounts(),
      loadPaymentForms(),
      loadCategories()
    ])
  }

  const loadAccounts = async () => {
    try {
      setLoading(prev => ({ ...prev, accounts: true }))
      const response = await financialService.listAccounts()
      setAccounts(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar contas financeiras')
    } finally {
      setLoading(prev => ({ ...prev, accounts: false }))
    }
  }

  const loadPaymentForms = async () => {
    try {
      setLoading(prev => ({ ...prev, paymentForms: true }))
      const response = await financialService.listPaymentForms()
      setPaymentForms(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar formas de pagamento')
    } finally {
      setLoading(prev => ({ ...prev, paymentForms: false }))
    }
  }

  const loadCategories = async () => {
    try {
      setLoading(prev => ({ ...prev, categories: true }))
      const response = await financialService.listCategories()
      setCategories(response.data || [])
    } catch (error: any) {
      toast.error('Erro ao carregar categorias')
    } finally {
      setLoading(prev => ({ ...prev, categories: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.company_id) {
      toast.error('Empresa não identificada')
      return
    }

    try {
      if (modalType === 'account') {
        const payload = {
          ...accountForm,
          company_id: user.company_id,
        }
        if (selectedItem) {
          await financialService.updateAccount(selectedItem.id, payload)
          toast.success('Conta atualizada com sucesso!')
        } else {
          await financialService.createAccount(payload)
          toast.success('Conta criada com sucesso!')
        }
        loadAccounts()
      } else if (modalType === 'paymentForm') {
        const payload = {
          ...paymentFormData,
          gateway_name: paymentFormData.integrates_with_gateway ? paymentFormData.gateway_name || null : null,
          company_id: user.company_id,
        }
        if (selectedItem) {
          await financialService.updatePaymentForm(selectedItem.id, payload)
          toast.success('Forma de pagamento atualizada!')
        } else {
          await financialService.createPaymentForm(payload)
          toast.success('Forma de pagamento criada!')
        }
        loadPaymentForms()
      } else if (modalType === 'category') {
        const payload = {
          ...categoryForm,
          company_id: user.company_id,
        }
        if (selectedItem) {
          await financialService.updateCategory(selectedItem.id, payload)
          toast.success('Categoria atualizada!')
        } else {
          await financialService.createCategory(payload)
          toast.success('Categoria criada!')
        }
        loadCategories()
      }
      setShowModal(false)
      setSelectedItem(null)
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar')
    }
  }

  const handleDelete = async (id: number, type: 'account' | 'paymentForm' | 'category') => {
    if (!confirm('Tem certeza que deseja excluir este item?')) return
    try {
      if (type === 'account') {
        await financialService.deleteAccount(id)
        toast.success('Conta excluída com sucesso!')
        loadAccounts()
      } else if (type === 'paymentForm') {
        await financialService.deletePaymentForm(id)
        toast.success('Forma de pagamento excluída!')
        loadPaymentForms()
      } else if (type === 'category') {
        await financialService.deleteCategory(id)
        toast.success('Categoria excluída!')
        loadCategories()
      }
    } catch (error: any) {
      toast.error('Erro ao excluir')
    }
  }

  const openModal = (type: 'account' | 'paymentForm' | 'category', item?: any) => {
    setModalType(type)
    setSelectedItem(item || null)
    if (type === 'account') {
      setAccountForm(item ? {
        name: item.name,
        description: item.description || '',
        account_type: item.account_type || 'cash',
        balance: Number(item.balance || 0),
        admin_only: item.admin_only ?? false,
        is_active: item.is_active ?? true,
      } : {
        name: '',
        description: '',
        account_type: 'cash',
        balance: 0,
        admin_only: false,
        is_active: true,
      })
    } else if (type === 'paymentForm') {
      setPaymentFormData(item ? {
        name: item.name,
        type: item.type,
        integrates_with_gateway: item.integrates_with_gateway ?? false,
        gateway_name: item.gateway_name || '',
      } : {
        name: '',
        type: 'cash',
        integrates_with_gateway: false,
        gateway_name: '',
      })
    } else if (type === 'category') {
      setCategoryForm(item ? {
        name: item.name,
        type: item.type,
        description: item.description || '',
      } : {
        name: '',
        type: 'income',
        description: '',
      })
    }
    setShowModal(true)
  }

  const accountColumns = [
    { key: 'name', label: 'Nome' },
    {
      key: 'account_type',
      label: 'Tipo',
      render: (a: any) => {
        const labels: Record<string, string> = {
          cash: 'Caixa',
          bank: 'Banco',
          credit_card: 'Cartão de Crédito',
        }
        return labels[a.account_type] || a.account_type
      },
    },
    {
      key: 'balance',
      label: 'Saldo',
      render: (a: any) => `R$ ${Number(a.balance || 0).toFixed(2)}`,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (a: any) => (
        <span className={a.is_active ? 'text-green-600' : 'text-gray-500'}>
          {a.is_active ? 'Ativa' : 'Inativa'}
        </span>
      ),
    },
  ]

  const paymentFormColumns = [
    { key: 'name', label: 'Nome' },
    { key: 'type', label: 'Tipo' },
    {
      key: 'integrates_with_gateway',
      label: 'Integração',
      render: (f: any) =>
        f.integrates_with_gateway ? (
          <span className="text-green-600">Integrado ({f.gateway_name || 'gateway'})</span>
        ) : (
          <span className="text-gray-500">Padrão</span>
        ),
    },
  ]

  const categoryColumns = [
    { key: 'name', label: 'Nome' },
    { 
      key: 'type', 
      label: 'Tipo',
      render: (c: any) => c.type === 'income' ? 'Receita' : 'Despesa'
    },
    { key: 'description', label: 'Descrição' },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cadastros</h1>
            <p className="text-gray-600 mt-1">Gerencie contas, formas de pagamento e categorias</p>
          </div>
        </div>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Tabs.List className="flex border-b border-gray-200">
            <Tabs.Trigger
              value="accounts"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Contas
            </Tabs.Trigger>
            <Tabs.Trigger
              value="payment-forms"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Formas de pagamento
            </Tabs.Trigger>
            <Tabs.Trigger
              value="categories"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Categorias
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="accounts" className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openModal('account')}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
                Nova Conta
              </button>
            </div>
            <DataTable
              data={accounts}
              columns={accountColumns}
              loading={loading.accounts}
              actions={(a) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('account', a)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(a.id, 'account')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            />
          </Tabs.Content>

          <Tabs.Content value="payment-forms" className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openModal('paymentForm')}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
                Nova Forma
              </button>
            </div>
            <DataTable
              data={paymentForms}
              columns={paymentFormColumns}
              loading={loading.paymentForms}
              actions={(f) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('paymentForm', f)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(f.id, 'paymentForm')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            />
          </Tabs.Content>

          <Tabs.Content value="categories" className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openModal('category')}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
              >
                <Plus className="w-5 h-5" />
                Nova Categoria
              </button>
            </div>
            <DataTable
              data={categories}
              columns={categoryColumns}
              loading={loading.categories}
              actions={(c) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal('category', c)}
                    className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.id, 'category')}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            />
          </Tabs.Content>
        </Tabs.Root>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">
                {selectedItem ? `Editar ${modalType === 'account' ? 'Conta' : modalType === 'paymentForm' ? 'Forma de Pagamento' : 'Categoria'}` : 
                 `Nova ${modalType === 'account' ? 'Conta' : modalType === 'paymentForm' ? 'Forma de Pagamento' : 'Categoria'}`}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {modalType === 'account' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={accountForm.name}
                        onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Descrição</label>
                      <textarea
                        value={accountForm.description}
                        onChange={(e) => setAccountForm({ ...accountForm, description: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo de Conta</label>
                      <select
                        value={accountForm.account_type}
                        onChange={(e) => setAccountForm({ ...accountForm, account_type: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="cash">Caixa</option>
                        <option value="bank">Banco</option>
                        <option value="credit_card">Cartão de Crédito</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Saldo Atual</label>
                      <input
                        type="number"
                        step="0.01"
                        value={accountForm.balance}
                        onChange={(e) =>
                          setAccountForm({
                            ...accountForm,
                            balance: parseFloat(e.target.value || '0'),
                          })
                        }
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={accountForm.admin_only}
                          onChange={(e) =>
                            setAccountForm({ ...accountForm, admin_only: e.target.checked })
                          }
                        />
                        <span>Somente administrador</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={accountForm.is_active}
                          onChange={(e) =>
                            setAccountForm({ ...accountForm, is_active: e.target.checked })
                          }
                        />
                        <span>Ativa</span>
                      </label>
                    </div>
                  </>
                )}

                {modalType === 'paymentForm' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={paymentFormData.name}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo</label>
                      <select
                        value={paymentFormData.type}
                        onChange={(e) => setPaymentFormData({ ...paymentFormData, type: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="cash">Dinheiro</option>
                        <option value="credit_card">Cartão de Crédito</option>
                        <option value="debit_card">Cartão de Débito</option>
                        <option value="pix">PIX</option>
                        <option value="bank_transfer">Transferência</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={paymentFormData.integrates_with_gateway}
                          onChange={(e) =>
                            setPaymentFormData({ ...paymentFormData, integrates_with_gateway: e.target.checked })
                          }
                        />
                        <span>Integra com gateway (ex: MercadoPago, Stripe)</span>
                      </label>
                      {paymentFormData.integrates_with_gateway && (
                        <input
                          type="text"
                          placeholder="Nome do gateway (opcional)"
                          value={paymentFormData.gateway_name}
                          onChange={(e) =>
                            setPaymentFormData({ ...paymentFormData, gateway_name: e.target.value })
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      )}
                    </div>
                  </>
                )}

                {modalType === 'category' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Nome</label>
                      <input
                        type="text"
                        value={categoryForm.name}
                        onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tipo</label>
                      <select
                        value={categoryForm.type}
                        onChange={(e) => setCategoryForm({ ...categoryForm, type: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        required
                      >
                        <option value="income">Receita</option>
                        <option value="expense">Despesa</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Descrição</label>
                      <textarea
                        value={categoryForm.description}
                        onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                        className="w-full border rounded-lg px-3 py-2"
                        rows={3}
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setSelectedItem(null)
                    }}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
