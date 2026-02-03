'use client'

import { useState, useEffect, useMemo } from 'react'
import { financialService, clientService, userService } from '@/services/api'
import { Plus, Filter, Search, Calculator, Lock, Edit, MoreVertical, Info, ChevronDown, X, Minus, ArrowRightLeft, HandIcon } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import LoadingState from '@/components/ui/LoadingState'
import ErrorState from '@/components/ui/ErrorState'
import EmptyState from '@/components/ui/EmptyState'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

interface Transaction {
  id: number
  type: 'income' | 'expense'
  value: number
  net_value?: number
  fee_percentage?: number
  fee_value?: number
  description: string
  date: string
  status: string
  is_paid: boolean
  account?: { id: number; name: string }
  category?: { id: number; name: string }
  origin?: string
  command_id?: number
  purchase_id?: number
  client?: { id: number; full_name: string }
  payment_method?: string | null
}

interface Totals {
  received: number
  to_receive: number
  paid: number
  to_pay: number
}

type FiltersState = {
  type: Array<'income' | 'expense'>
  status: Array<'blocked' | 'available' | 'open' | 'overdue' | 'paid'>
  start_date: string
  end_date: string
  client_id: string
  payment_methods: string[]
  account_ids: number[]
  category_ids: number[]
  date_type: 'due' | 'availability' | 'competency' | 'payment'
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [total, setTotal] = useState(0)
  const [totals, setTotals] = useState<Totals | null>(null)
  const [showTotals, setShowTotals] = useState(false)
  const [loadingTotals, setLoadingTotals] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [showSearch, setShowSearch] = useState(true)
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [activeDrawer, setActiveDrawer] = useState<'income' | 'expense' | 'voucher' | 'transfer' | null>(null)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // Filters
  const [filters, setFilters] = useState<FiltersState>({
    type: [] as Array<'income' | 'expense'>,
    status: [] as Array<'blocked' | 'available' | 'open' | 'overdue' | 'paid'>,
    start_date: '',
    end_date: '',
    client_id: '',
    payment_methods: [] as string[],
    account_ids: [] as number[],
    category_ids: [] as number[],
    date_type: 'due' as 'due' | 'availability' | 'competency' | 'payment',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [clients, setClients] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [accounts, setAccounts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [paymentForms, setPaymentForms] = useState<any[]>([])
  const [gotoPage, setGotoPage] = useState('')

  const [transactionForm, setTransactionForm] = useState({
    type: 'income' as 'income' | 'expense',
    value: '',
    date: new Date().toISOString().slice(0, 16),
    description: '',
    account_id: '',
    category_id: '',
    payment_method: '',
    client_id: '',
  })

  const [voucherForm, setVoucherForm] = useState({
    value: '',
    due_date: '',
    professional_id: '',
    category_id: '',
    payment_method: '',
    account_id: '',
    commission_advance: false,
    extra_toggle: false,
  })

  const [transferForm, setTransferForm] = useState({
    value: '',
    date: new Date().toISOString().slice(0, 16),
    payment_method: '',
    reason: '',
    source_account_id: '',
    source_category_id: '',
    destination_account_id: '',
    destination_category_id: '',
  })
  const [sortField] = useState<'date'>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  const getCompanyId = () => {
    let companyId = 1
    try {
      const authStorage = localStorage.getItem('auth-storage')
      if (authStorage) {
        const authData = JSON.parse(authStorage)
        companyId = authData?.state?.user?.company_id || 1
      }
    } catch (err) {
      console.warn('Could not get company_id from auth storage')
    }
    return companyId
  }

  const getCategoryIdByName = (name: string) => {
    const match = categories.find((category: any) => category.name?.toLowerCase() === name.toLowerCase())
    return match ? String(match.id) : ''
  }

  const loadTransactions = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const params: any = {
        skip: (page - 1) * limit,
        limit
      }

      if (filters.type.length > 0) params.type = filters.type
      if (filters.status.length > 0) {
        const mappedStatuses = new Set<string>()
        if (filters.status.includes('blocked')) mappedStatuses.add('blocked')
        if (filters.status.includes('open') || filters.status.includes('overdue')) mappedStatuses.add('planned')
        if (filters.status.includes('available') || filters.status.includes('paid')) mappedStatuses.add('liquidated')
        params.status = Array.from(mappedStatuses)

        if (filters.status.includes('paid') && !filters.status.includes('available')) {
          params.is_paid = true
        } else if (filters.status.includes('available') && !filters.status.includes('paid')) {
          params.is_paid = false
        }
      }
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date
      if (filters.client_id) params.client_id = parseInt(filters.client_id)
      if (filters.payment_methods.length > 0) params.payment_method = filters.payment_methods
      if (filters.account_ids.length > 0) params.account_id = filters.account_ids
      if (filters.category_ids.length > 0) params.category_id = filters.category_ids
      if (filters.date_type) params.date_type = filters.date_type

      const response = await financialService.listTransactions(params)
      setTransactions(response.data || [])
      setTotal(response.data?.length || 0)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao carregar transações'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setShowDetailsModal(true)
  }

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsEditing(true)
    setTransactionForm({
      type: transaction.type,
      value: transaction.value?.toString() || '',
      date: new Date(transaction.date).toISOString().slice(0, 16),
      description: transaction.description || '',
      account_id: transaction.account?.id?.toString() || '',
      category_id: transaction.category?.id?.toString() || '',
      payment_method: transaction.payment_method || '',
      client_id: transaction.client?.id?.toString() || '',
    })
    setActiveDrawer(transaction.type)
  }

  const handleDeleteTransaction = async (transaction: Transaction) => {
    if (!confirm(`Deseja excluir a transacao #${transaction.id}?`)) return
    try {
      await financialService.deleteTransaction(transaction.id)
      toast.success('Transacao excluida com sucesso!')
      loadTransactions()
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao excluir transacao'
      toast.error(errorMessage)
    }
  }

  const handleCreateTransaction = async () => {
    try {
      const payload = {
        company_id: getCompanyId(),
        type: transactionForm.type,
        value: parseFloat(transactionForm.value),
        date: new Date(transactionForm.date).toISOString(),
        description: transactionForm.description,
        account_id: transactionForm.account_id ? parseInt(transactionForm.account_id) : null,
        category_id: transactionForm.category_id ? parseInt(transactionForm.category_id) : null,
        payment_method: transactionForm.payment_method || null,
        client_id: transactionForm.client_id ? parseInt(transactionForm.client_id) : null,
        origin: 'manual'
      }

      if (isEditing && selectedTransaction) {
        await financialService.updateTransaction(selectedTransaction.id, payload)
        toast.success('Transacao atualizada com sucesso!')
      } else {
        await financialService.createTransaction(payload)
        toast.success('Transacao criada com sucesso!')
      }
      setActiveDrawer(null)
      setIsEditing(false)
      setSelectedTransaction(null)
      setTransactionForm({
        type: 'income',
        value: '',
        date: new Date().toISOString().slice(0, 16),
        description: '',
        account_id: '',
        category_id: '',
        payment_method: '',
        client_id: '',
      })
      loadTransactions()
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao salvar transacao'
      toast.error(errorMessage)
    }
  }

  const handleCreateVoucher = async () => {
    try {
      const descriptionParts = ['Vale']
      const professional = professionals.find((prof: any) => prof.id === parseInt(voucherForm.professional_id))
      if (professional) descriptionParts.push(`Profissional: ${professional.full_name}`)
      if (voucherForm.commission_advance) descriptionParts.push('Adiantamento de comissao')
      if (voucherForm.extra_toggle) descriptionParts.push('Extra ativo')

      const payload = {
        company_id: getCompanyId(),
        type: 'expense',
        value: parseFloat(voucherForm.value),
        date: new Date(voucherForm.due_date).toISOString(),
        description: descriptionParts.join(' | '),
        account_id: voucherForm.account_id ? parseInt(voucherForm.account_id) : null,
        category_id: voucherForm.category_id ? parseInt(voucherForm.category_id) : null,
        payment_method: voucherForm.payment_method || null,
        origin: 'manual'
      }

      await financialService.createTransaction(payload)
      toast.success('Vale criado com sucesso!')
      setActiveDrawer(null)
      setVoucherForm({
        value: '',
        due_date: '',
        professional_id: '',
        category_id: '',
        payment_method: '',
        account_id: '',
        commission_advance: false,
        extra_toggle: false,
      })
      loadTransactions()
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao salvar vale'
      toast.error(errorMessage)
    }
  }

  const handleCreateTransfer = async () => {
    try {
      const companyId = getCompanyId()
      const baseDescription = transferForm.reason ? `Transferencia - ${transferForm.reason}` : 'Transferencia'
      const baseDate = new Date(transferForm.date).toISOString()

      await financialService.createTransaction({
        company_id: companyId,
        type: 'expense',
        value: parseFloat(transferForm.value),
        date: baseDate,
        description: `${baseDescription} (origem)`,
        account_id: transferForm.source_account_id ? parseInt(transferForm.source_account_id) : null,
        category_id: transferForm.source_category_id ? parseInt(transferForm.source_category_id) : null,
        payment_method: transferForm.payment_method || null,
        origin: 'manual'
      })

      await financialService.createTransaction({
        company_id: companyId,
        type: 'income',
        value: parseFloat(transferForm.value),
        date: baseDate,
        description: `${baseDescription} (destino)`,
        account_id: transferForm.destination_account_id ? parseInt(transferForm.destination_account_id) : null,
        category_id: transferForm.destination_category_id ? parseInt(transferForm.destination_category_id) : null,
        payment_method: transferForm.payment_method || null,
        origin: 'manual'
      })

      toast.success('Transferencia criada com sucesso!')
      setActiveDrawer(null)
      setTransferForm({
        value: '',
        date: new Date().toISOString().slice(0, 16),
        payment_method: '',
        reason: '',
        source_account_id: '',
        source_category_id: '',
        destination_account_id: '',
        destination_category_id: '',
      })
      loadTransactions()
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Erro ao salvar transferencia'
      toast.error(errorMessage)
    }
  }

  const loadTotals = async () => {
    setLoadingTotals(true)
    try {
      const params: any = {}
      if (filters.start_date) params.start_date = filters.start_date
      if (filters.end_date) params.end_date = filters.end_date

      if (filters.type.length > 0) params.type = filters.type
      if (filters.status.length > 0) {
        const mappedStatuses = new Set<string>()
        if (filters.status.includes('blocked')) mappedStatuses.add('blocked')
        if (filters.status.includes('open') || filters.status.includes('overdue')) mappedStatuses.add('planned')
        if (filters.status.includes('available') || filters.status.includes('paid')) mappedStatuses.add('liquidated')
        params.status = Array.from(mappedStatuses)

        if (filters.status.includes('paid') && !filters.status.includes('available')) {
          params.is_paid = true
        } else if (filters.status.includes('available') && !filters.status.includes('paid')) {
          params.is_paid = false
        }
      }
      if (filters.client_id) params.client_id = parseInt(filters.client_id)
      if (filters.payment_methods.length > 0) params.payment_method = filters.payment_methods
      if (filters.account_ids.length > 0) params.account_id = filters.account_ids
      if (filters.category_ids.length > 0) params.category_id = filters.category_ids
      if (filters.date_type) params.date_type = filters.date_type

      const response = await financialService.getTransactionsTotals(params)
      const data = response.data
      setTotals({
        received: Number(data.total_received || 0),
        to_receive: Number(data.total_to_receive || 0),
        paid: Number(data.total_paid || 0),
        to_pay: Number(data.total_to_pay || 0)
      })
    } catch (err: any) {
      console.error('Erro ao carregar totais:', err)
      setTotals(null)
    } finally {
      setLoadingTotals(false)
    }
  }

  const loadClients = async () => {
    try {
      const response = await clientService.list()
      setClients(response.data || [])
    } catch (err) {
      console.error('Erro ao carregar clientes:', err)
    }
  }

  const loadMetadata = async () => {
    try {
      const [accountsRes, categoriesRes, paymentFormsRes, professionalsRes] = await Promise.all([
        financialService.listAccounts(),
        financialService.listCategories(),
        financialService.listPaymentForms(),
        userService.getProfessionals()
      ])
      setAccounts(accountsRes.data || [])
      setCategories(categoriesRes.data || [])
      setPaymentForms(paymentFormsRes.data || [])
      setProfessionals(professionalsRes.data || [])
    } catch (err) {
      console.error('Erro ao carregar dados auxiliares:', err)
    }
  }

  useEffect(() => {
    loadClients()
    loadMetadata()
  }, [])

  useEffect(() => {
    loadTransactions()
    if (showTotals) {
      loadTotals()
    }
  }, [page, filters, showTotals])

  const handleRetry = () => {
    loadTransactions()
  }

  const handleFilterChange = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value })
    setPage(1)
  }

  const toggleArrayFilter = (key: 'type' | 'status' | 'payment_methods' | 'account_ids' | 'category_ids', value: any) => {
    const current = filters[key] as any[]
    const exists = Array.isArray(current) && current.includes(value)
    const updated = exists ? current.filter((item: any) => item !== value) : [...current, value]
    setFilters({ ...filters, [key]: updated })
    setPage(1)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredTransactions.map((transaction) => transaction.id))
    } else {
      setSelectedIds([])
    }
  }

  const handleSelectRow = (id: number) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id])
  }

  const clearFilters = () => {
    setFilters({
      type: [],
      status: [],
      start_date: '',
      end_date: '',
      client_id: '',
      payment_methods: [],
      account_ids: [],
      category_ids: [],
      date_type: 'due'
    })
    setPage(1)
  }

  const handleTogglePaid = async (transactionId: number) => {
    try {
      await financialService.toggleTransactionPaid(transactionId)
      toast.success('Status de pagamento atualizado!')
      loadTransactions()
      if (showTotals) {
        loadTotals()
      }
    } catch (err: any) {
      toast.error('Erro ao atualizar status de pagamento')
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const getStatusBadge = (transaction: Transaction) => {
    const today = new Date()
    const transactionDate = new Date(transaction.date)
    const isOverdue = transaction.status === 'planned' && transactionDate < new Date(today.toDateString())

    let label = 'Em aberto'
    let className = 'bg-yellow-100 text-yellow-800'
    let icon: any = null

    if (transaction.status === 'blocked') {
      label = 'Bloqueado'
      className = 'bg-gray-200 text-gray-700'
      icon = Lock
    } else if (transaction.is_paid) {
      label = 'Pago'
      className = 'bg-green-100 text-green-800'
    } else if (isOverdue) {
      label = 'Atrasado'
      className = 'bg-red-100 text-red-800'
    } else if (transaction.status === 'liquidated') {
      label = 'Disponível'
      className = 'bg-blue-100 text-blue-800'
    }

    const Icon = icon

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${className}`}>
        {Icon && <Icon className="w-3 h-3" />}
        {label}
      </span>
    )
  }

  const getOriginLink = (transaction: Transaction) => {
    if (transaction.command_id) {
      return (
        <Link 
          href={`/commands/${transaction.command_id}`}
          className="text-primary hover:text-primary/80 font-medium"
        >
          C#{transaction.command_id}
        </Link>
      )
    }
    if (transaction.purchase_id) {
      return (
        <Link 
          href={`/purchases/${transaction.purchase_id}`}
          className="text-primary hover:text-primary/80 font-medium"
        >
          P#{transaction.purchase_id}
        </Link>
      )
    }
    return <span className="text-gray-500">-</span>
  }

  const getOriginLabel = (origin: string) => {
    const labels: Record<string, string> = {
      command: 'Comanda',
      purchase: 'Compra',
      manual: 'Manual',
      subscription: 'Assinatura',
      other: 'Outro',
    }
    return labels[origin] || origin
  }

  const getPaymentMethodLabel = (method: string | null | undefined) => {
    if (!method) return '-'
    const labels: Record<string, string> = {
      cash: 'Dinheiro',
      credit_card: 'Cartão de Crédito',
      debit_card: 'Cartão de Débito',
      pix: 'PIX',
      boleto: 'Boleto',
      cheque: 'Cheque',
      pending: 'Pendente',
      bank_transfer: 'Transferência',
    }
    return labels[method] || method
  }

  const paymentMethodOptions = paymentForms.length > 0
    ? paymentForms.map((form: any) => ({ value: form.type, label: form.name }))
    : [
        { value: 'cash', label: 'Dinheiro' },
        { value: 'credit_card', label: 'Cartão de Crédito' },
        { value: 'debit_card', label: 'Cartão de Débito' },
        { value: 'pix', label: 'Pix' },
        { value: 'boleto', label: 'Boleto' },
        { value: 'cheque', label: 'Cheque' },
        { value: 'pending', label: 'Pendente' }
      ]

  const cashAccounts = accounts.filter((account: any) => account.account_type === 'cash')
  const bankAccounts = accounts.filter((account: any) => account.account_type === 'bank')

  const filteredTransactions = useMemo(() => {
    const filtered = transactions.filter((transaction) => {
      if (filters.type.length > 0 && !filters.type.includes(transaction.type)) return false

      if (filters.status.length > 0) {
        const today = new Date()
        const transactionDate = new Date(transaction.date)
        const isOverdue = transaction.status === 'planned' && transactionDate < new Date(today.toDateString())

        const statusMatches = filters.status.some((status) => {
          if (status === 'blocked') return transaction.status === 'blocked'
          if (status === 'paid') return transaction.is_paid
          if (status === 'overdue') return isOverdue
          if (status === 'open') return transaction.status === 'planned' && !isOverdue
          if (status === 'available') return transaction.status === 'liquidated' && !transaction.is_paid
          return false
        })

        if (!statusMatches) return false
      }

      if (filters.payment_methods.length > 0 && !filters.payment_methods.includes(transaction.payment_method || '')) return false
      if (filters.account_ids.length > 0 && !filters.account_ids.includes(transaction.account?.id || 0)) return false
      if (filters.category_ids.length > 0 && !filters.category_ids.includes(transaction.category?.id || 0)) return false

      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return (
        transaction.client?.full_name?.toLowerCase().includes(search) ||
        transaction.description?.toLowerCase().includes(search) ||
        transaction.category?.name?.toLowerCase().includes(search) ||
        transaction.id.toString().includes(search)
      )
    })

    return [...filtered].sort((a, b) => {
      if (sortField === 'date') {
        const aDate = new Date(a.date).getTime()
        const bDate = new Date(b.date).getTime()
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate
      }
      return 0
    })
  }, [transactions, searchTerm, sortField, sortDirection, filters])

  if (loading && transactions.length === 0) {
    return (
      <DashboardLayout>
        <LoadingState message="Carregando transações..." />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">Transações</h1>
            <p className="text-gray-600 mt-1">Gerencie receitas e despesas</p>
          </div>

          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Buscar
            </button>
            <button
              onClick={() => setShowFilters(true)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
            <button
              onClick={() => {
                setShowTotals(true)
                loadTotals()
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Calculator className="w-4 h-4" />
              Calcular totais
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNewMenu((prev) => !prev)}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Novo
                <ChevronDown className="w-4 h-4" />
              </button>
              {showNewMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedTransaction(null)
                      setTransactionForm({ ...transactionForm, type: 'income' })
                      setActiveDrawer('income')
                      setShowNewMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-green-700"
                  >
                    <Plus className="w-4 h-4" />
                    Recebimento
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedTransaction(null)
                      setTransactionForm({ ...transactionForm, type: 'expense' })
                      setActiveDrawer('expense')
                      setShowNewMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-red-700"
                  >
                    <Minus className="w-4 h-4" />
                    Despesa
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedTransaction(null)
                      setActiveDrawer('voucher')
                      setVoucherForm({
                        ...voucherForm,
                        category_id: voucherForm.category_id || getCategoryIdByName('Vales')
                      })
                      setShowNewMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-blue-700"
                  >
                    <HandIcon className="w-4 h-4" />
                    Vale
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setSelectedTransaction(null)
                      setActiveDrawer('transfer')
                      setTransferForm({
                        ...transferForm,
                        source_category_id: transferForm.source_category_id || getCategoryIdByName('Transferência'),
                        destination_category_id: transferForm.destination_category_id || getCategoryIdByName('Transferência')
                      })
                      setShowNewMenu(false)
                    }}
                    className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 text-orange-700"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Transferência
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>

        {/* Search */}
        {showSearch && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente, descrição, categoria ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Totals Modal */}
        {showTotals && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-xl font-semibold">Totais</h2>
                <button
                  onClick={() => setShowTotals(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6">
                {loadingTotals && (
                  <div className="text-sm text-gray-500">Carregando totais...</div>
                )}
                {!loadingTotals && totals && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                      <p className="text-sm text-green-700">Recebidos</p>
                      <p className="text-2xl font-bold text-green-700">{formatCurrency(totals.received)}</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-sm text-blue-700">A Receber</p>
                      <p className="text-2xl font-bold text-blue-700">{formatCurrency(totals.to_receive)}</p>
                    </div>
                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                      <p className="text-sm text-orange-700">Pagos</p>
                      <p className="text-2xl font-bold text-orange-700">{formatCurrency(totals.paid)}</p>
                    </div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                      <p className="text-sm text-red-700">A Pagar</p>
                      <p className="text-2xl font-bold text-red-700">{formatCurrency(totals.to_pay)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="fixed inset-0 z-40">
            <button
              onClick={() => setShowFilters(false)}
              className="absolute inset-0 bg-black/40"
              aria-label="Fechar filtros"
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Filtros</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Periodo</h3>
                    <button
                      onClick={() => {
                        handleFilterChange('start_date', '')
                        handleFilterChange('end_date', '')
                      }}
                      className="text-xs text-primary"
                    >
                      Limpar
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-gray-500">Data inicial</label>
                      <input
                        type="date"
                        value={filters.start_date}
                        onChange={(e) => handleFilterChange('start_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500">Data final</label>
                      <input
                        type="date"
                        value={filters.end_date}
                        onChange={(e) => handleFilterChange('end_date', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Cliente</h3>
                    <button
                      onClick={() => handleFilterChange('client_id', '')}
                      className="text-xs text-primary"
                    >
                      Limpar
                    </button>
                  </div>
                  <select
                    value={filters.client_id}
                    onChange={(e) => handleFilterChange('client_id', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Todos</option>
                    {clients.map((client: any) => (
                      <option key={client.id} value={client.id}>
                        {client.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Tipo de transacao</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.type.includes('income')}
                        onChange={() => toggleArrayFilter('type', 'income')}
                        className="rounded"
                      />
                      Recebimentos (contas a receber)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={filters.type.includes('expense')}
                        onChange={() => toggleArrayFilter('type', 'expense')}
                        className="rounded"
                      />
                      Despesas (contas a pagar)
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-700">Tipo de data</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'due', label: 'Vencimento' },
                      { value: 'availability', label: 'Disponibilidade' },
                      { value: 'competency', label: 'Competencia' },
                      { value: 'payment', label: 'Pagamento' }
                    ] as const).map((item) => (
                      <label key={item.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="date_type"
                          checked={filters.date_type === item.value}
                          onChange={() => handleFilterChange('date_type', item.value)}
                        />
                        {item.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Status</h3>
                    <button
                      onClick={() => handleFilterChange('status', [])}
                      className="text-xs text-primary"
                    >
                      Desmarcar tudo
                    </button>
                  </div>
                  <div className="space-y-2">
                    {[
                      { value: 'blocked', label: 'Bloqueado' },
                      { value: 'available', label: 'Disponivel' },
                      { value: 'open', label: 'Em aberto' },
                      { value: 'overdue', label: 'Atrasado' },
                      { value: 'paid', label: 'Pago' }
                    ].map((status) => (
                      <label key={status.value} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status.value as FiltersState['status'][number])}
                          onChange={() => toggleArrayFilter('status', status.value)}
                          className="rounded"
                        />
                        {status.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Formas de pagamento</h3>
                    <button
                      onClick={() => handleFilterChange('payment_methods', [])}
                      className="text-xs text-primary"
                    >
                      Desmarcar tudo
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { value: 'boleto', label: 'Boleto' },
                      { value: 'credit_card', label: 'Credito' },
                      { value: 'debit_card', label: 'Debito' },
                      { value: 'cheque', label: 'Cheque' },
                      { value: 'cash', label: 'Dinheiro' },
                      { value: 'pix', label: 'Pix' },
                      { value: 'pending', label: 'Pendente' }
                    ].map((method) => (
                      <label key={method.value} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.payment_methods.includes(method.value)}
                          onChange={() => toggleArrayFilter('payment_methods', method.value)}
                          className="rounded"
                        />
                        {method.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Contas</h3>
                    <button
                      onClick={() => handleFilterChange('account_ids', [])}
                      className="text-xs text-primary"
                    >
                      Desmarcar tudo
                    </button>
                  </div>
                  <div className="space-y-4 text-sm">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Caixa</p>
                      <div className="mt-2 space-y-2">
                        {cashAccounts.length === 0 && (
                          <div className="text-xs text-gray-400">Nenhuma conta caixa</div>
                        )}
                        {cashAccounts.map((account: any) => (
                          <label key={account.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.account_ids.includes(account.id)}
                              onChange={() => toggleArrayFilter('account_ids', account.id)}
                              className="rounded"
                            />
                            {account.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase">Banco</p>
                      <div className="mt-2 space-y-2">
                        {bankAccounts.length === 0 && (
                          <div className="text-xs text-gray-400">Nenhuma conta bancaria</div>
                        )}
                        {bankAccounts.map((account: any) => (
                          <label key={account.id} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={filters.account_ids.includes(account.id)}
                              onChange={() => toggleArrayFilter('account_ids', account.id)}
                              className="rounded"
                            />
                            {account.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-gray-700">Categorias</h3>
                    <button
                      onClick={() => handleFilterChange('category_ids', [])}
                      className="text-xs text-primary"
                    >
                      Desmarcar tudo
                    </button>
                  </div>
                  <div className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                    {categories.map((category: any) => (
                      <label key={category.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.category_ids.includes(category.id)}
                          onChange={() => toggleArrayFilter('category_ids', category.id)}
                          className="rounded"
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t flex items-center justify-between">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Limpar filtros
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && transactions.length === 0 && (
          <ErrorState
            title="Erro ao carregar transações"
            message={error}
            onRetry={handleRetry}
          />
        )}

        {/* Empty State */}
        {!loading && !error && filteredTransactions.length === 0 && (
          <EmptyState
            title="Nenhuma transação encontrada"
            message="Não há transações para os filtros selecionados."
          />
        )}

        {/* Transactions Table */}
        {!error && filteredTransactions.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={filteredTransactions.length > 0 && selectedIds.length === filteredTransactions.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => setSortDirection((prev) => prev === 'asc' ? 'desc' : 'asc')}
                    >
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Titular
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Origem
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Forma de pagamento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoria
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor bruto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor líquido
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <MoreVertical className="w-4 h-4 inline" />
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => {
                    const netValue = transaction.net_value ?? transaction.value
                    const feePercentage = Number(transaction.fee_percentage ?? 0)
                    const description = transaction.description || 
                      (transaction.command_id ? `Referente à comanda #${transaction.command_id} para ${transaction.client?.full_name || ''}` :
                       transaction.purchase_id ? `Referente à compra de pacote de ${transaction.client?.full_name || ''}` : '')

                    return (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded"
                            checked={selectedIds.includes(transaction.id)}
                            onChange={() => handleSelectRow(transaction.id)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <button className="text-primary-600 font-medium hover:underline">
                            {transaction.client?.full_name || '-'}
                          </button>
                          <div className="text-xs text-gray-500 mt-1">{description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="text-primary-600 font-medium">
                            {getOriginLink(transaction)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {getOriginLabel(transaction.origin || 'manual')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {getPaymentMethodLabel(transaction.payment_method)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.category?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(transaction.value)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Conta: {transaction.account?.name || 'Caixa'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="font-semibold text-gray-900">
                            {formatCurrency(netValue)}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Taxa: {feePercentage.toFixed(2)}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(transaction)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={transaction.is_paid}
                              onChange={() => handleTogglePaid(transaction.id)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenDetails(transaction)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              title="Informações"
                            >
                              <Info className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditTransaction(transaction)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-full text-primary hover:text-primary/80 hover:bg-primary/10"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction)}
                              className="h-8 w-8 inline-flex items-center justify-center rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                              title="Excluir"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {total > 0 && (
              <div className="bg-gray-50 px-6 py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="text-sm text-gray-700">
                  {total} no total
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, Math.ceil(total / limit) || 1) }, (_, i) => {
                        const pageNum = i + 1
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-3 py-1 rounded-lg ${
                              page === pageNum
                                ? 'bg-primary text-white'
                                : 'border hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        )
                      })}
                      {Math.ceil(total / limit) > 5 && (
                        <span className="px-3 py-1">...</span>
                      )}
                      {Math.ceil(total / limit) > 5 && (
                        <button
                          onClick={() => setPage(Math.ceil(total / limit))}
                          className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                        >
                          {Math.ceil(total / limit)}
                        </button>
                      )}
                    </div>
                    <button
                      onClick={() => setPage(p => p + 1)}
                      disabled={page * limit >= total}
                      className="px-3 py-1 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>20 / página</span>
                    <select
                      value={limit}
                      className="px-2 py-1 border rounded-lg text-sm"
                      disabled
                    >
                      <option value={20}>20 / página</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span>Vá até</span>
                    <input
                      type="number"
                      value={gotoPage}
                      onChange={(e) => setGotoPage(e.target.value)}
                      onBlur={() => {
                        const pageNum = Number(gotoPage)
                        if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(total / limit)) {
                          setPage(pageNum)
                        }
                      }}
                      className="w-20 px-2 py-1 border rounded-lg"
                    />
                  </div>
                  <div className="text-sm text-gray-600">
                    Página {page} de {Math.max(1, Math.ceil(total / limit))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Drawers */}
        {activeDrawer && (
          <div className="fixed inset-0 z-50">
            <button
              onClick={() => setActiveDrawer(null)}
              className="absolute inset-0 bg-black/40"
              aria-label="Fechar"
            />
            <div className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">
                  {activeDrawer === 'income' && 'Novo recebimento'}
                  {activeDrawer === 'expense' && 'Nova despesa'}
                  {activeDrawer === 'voucher' && 'Novo vale'}
                  {activeDrawer === 'transfer' && 'Nova transferência'}
                </h2>
                <button
                  onClick={() => {
                    setActiveDrawer(null)
                    setIsEditing(false)
                    setSelectedTransaction(null)
                  }}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {(activeDrawer === 'income' || activeDrawer === 'expense') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={transactionForm.value}
                        onChange={(e) => setTransactionForm({ ...transactionForm, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                      <input
                        type="datetime-local"
                        value={transactionForm.date}
                        onChange={(e) => setTransactionForm({ ...transactionForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                      <select
                        value={transactionForm.client_id}
                        onChange={(e) => setTransactionForm({ ...transactionForm, client_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Selecionar</option>
                        {clients.map((client: any) => (
                          <option key={client.id} value={client.id}>
                            {client.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                      <input
                        type="text"
                        value={transactionForm.description}
                        onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conta *</label>
                      <select
                        value={transactionForm.account_id}
                        onChange={(e) => setTransactionForm({ ...transactionForm, account_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Selecionar</option>
                        {accounts.map((account: any) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                      <select
                        value={transactionForm.category_id}
                        onChange={(e) => setTransactionForm({ ...transactionForm, category_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Selecionar</option>
                        {categories.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento *</label>
                      <select
                        value={transactionForm.payment_method}
                        onChange={(e) => setTransactionForm({ ...transactionForm, payment_method: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Selecionar</option>
                        {paymentMethodOptions.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {activeDrawer === 'voucher' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={voucherForm.value}
                        onChange={(e) => setVoucherForm({ ...voucherForm, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento *</label>
                      <input
                        type="date"
                        value={voucherForm.due_date}
                        onChange={(e) => setVoucherForm({ ...voucherForm, due_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pago para profissional *</label>
                      <select
                        value={voucherForm.professional_id}
                        onChange={(e) => setVoucherForm({ ...voucherForm, professional_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Selecionar</option>
                        {professionals.map((professional: any) => (
                          <option key={professional.id} value={professional.id}>
                            {professional.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                      <select
                        value={voucherForm.category_id}
                        onChange={(e) => setVoucherForm({ ...voucherForm, category_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Selecionar</option>
                        {categories.map((category: any) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento *</label>
                      <select
                        value={voucherForm.payment_method}
                        onChange={(e) => setVoucherForm({ ...voucherForm, payment_method: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Selecionar</option>
                        {paymentMethodOptions.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Conta *</label>
                      <select
                        value={voucherForm.account_id}
                        onChange={(e) => setVoucherForm({ ...voucherForm, account_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Selecionar</option>
                        {accounts.map((account: any) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-center justify-between text-sm">
                      <span>Adiantamento de comissao</span>
                      <input
                        type="checkbox"
                        checked={voucherForm.commission_advance}
                        onChange={(e) => setVoucherForm({ ...voucherForm, commission_advance: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                    <label className="flex items-center justify-between text-sm">
                      <span>Switch adicional</span>
                      <input
                        type="checkbox"
                        checked={voucherForm.extra_toggle}
                        onChange={(e) => setVoucherForm({ ...voucherForm, extra_toggle: e.target.checked })}
                        className="h-4 w-4"
                      />
                    </label>
                  </div>
                )}

                {activeDrawer === 'transfer' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Valor *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={transferForm.value}
                        onChange={(e) => setTransferForm({ ...transferForm, value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
                      <input
                        type="datetime-local"
                        value={transferForm.date}
                        onChange={(e) => setTransferForm({ ...transferForm, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Forma de pagamento *</label>
                      <select
                        value={transferForm.payment_method}
                        onChange={(e) => setTransferForm({ ...transferForm, payment_method: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                      >
                        <option value="">Selecionar</option>
                        {paymentMethodOptions.map((method) => (
                          <option key={method.value} value={method.value}>
                            {method.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                      <input
                        type="text"
                        value={transferForm.reason}
                        onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>

                    <div className="border border-red-100 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-red-600">
                        <span className="h-2 w-2 rounded-full bg-red-500" />
                        Conta de origem
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Conta *</label>
                        <select
                          value={transferForm.source_account_id}
                          onChange={(e) => setTransferForm({ ...transferForm, source_account_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">Selecionar</option>
                          {accounts.map((account: any) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Categoria *</label>
                        <select
                          value={transferForm.source_category_id}
                          onChange={(e) => setTransferForm({ ...transferForm, source_category_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">Selecionar</option>
                          {categories.map((category: any) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="border border-green-100 rounded-lg p-4 space-y-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-green-600">
                        <span className="h-2 w-2 rounded-full bg-green-500" />
                        Conta de destino
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Conta *</label>
                        <select
                          value={transferForm.destination_account_id}
                          onChange={(e) => setTransferForm({ ...transferForm, destination_account_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">Selecionar</option>
                          {accounts.map((account: any) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Categoria *</label>
                        <select
                          value={transferForm.destination_category_id}
                          onChange={(e) => setTransferForm({ ...transferForm, destination_category_id: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          required
                        >
                          <option value="">Selecionar</option>
                          {categories.map((category: any) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t p-4 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveDrawer(null)
                    setIsEditing(false)
                    setSelectedTransaction(null)
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (activeDrawer === 'income' || activeDrawer === 'expense') {
                      handleCreateTransaction()
                    }
                    if (activeDrawer === 'voucher') {
                      handleCreateVoucher()
                    }
                    if (activeDrawer === 'transfer') {
                      handleCreateTransfer()
                    }
                  }}
                  className="px-4 py-2 bg-primary text-white rounded-lg"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
