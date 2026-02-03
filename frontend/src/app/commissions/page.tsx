'use client'

import { useState, useEffect } from 'react'
import { commissionService, userService } from '@/services/api'
import { DollarSign, CheckCircle, Clock, Settings } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import { FeatureWrapper } from '@/components/FeatureWrapper'
import * as Tabs from '@radix-ui/react-tabs'
import Link from 'next/link'

export default function CommissionsPage() {
  const [activeTab, setActiveTab] = useState('detailed')
  const [commissions, setCommissions] = useState<any[]>([])
  const [professionals, setProfessionals] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null)

  useEffect(() => {
    loadData()
  }, [selectedProfessional])

  const loadData = async () => {
    try {
      const [commissionsRes, professionalsRes] = await Promise.all([
        commissionService.list({ professional_id: selectedProfessional || undefined }),
        userService.getProfessionals(),
      ])
      const items = commissionsRes.data || []
      setCommissions(items)
      setProfessionals(professionalsRes.data || [])

      // Calcula resumo simples no frontend
      const totals = items.reduce(
        (acc: any, c: any) => {
          const value = Number(c.commission_value || 0)
          acc.total_amount += value
          if (c.status === 'paid') {
            acc.total_paid += value
          } else if (c.status === 'pending') {
            acc.total_pending += value
          }
          return acc
        },
        { total_amount: 0, total_paid: 0, total_pending: 0 }
      )
      setSummary(totals)
    } catch (error: any) {
      toast.error('Erro ao carregar comissões')
    } finally {
      setLoading(false)
    }
  }

  const handlePay = async (id: number) => {
    if (!confirm('Marcar esta comissão como paga?')) return
    try {
      await commissionService.pay(id, { payment_date: new Date().toISOString() })
      toast.success('Comissão marcada como paga!')
      loadData()
    } catch (error: any) {
      toast.error('Erro ao pagar comissão')
    }
  }

  const columns = [
    { key: 'id', label: 'ID' },
    { 
      key: 'professional_id', 
      label: 'Profissional',
      render: (c: any) => {
        // Primeiro tenta usar o objeto professional retornado pelo backend (joinedload)
        if (c.professional?.full_name) {
          return c.professional.full_name
        }
        // Fallback: busca na lista de profissionais carregada separadamente
        const prof = professionals.find(p => p.id === c.professional_id)
        return prof?.full_name || 'N/A'
      }
    },
    { 
      key: 'commission_value', 
      label: 'Valor da Comissão',
      render: (c: any) => `R$ ${Number(c.commission_value || 0).toFixed(2)}`
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (c: any) => (
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-1 ${
            c.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
          }`}>
            {c.status === 'paid' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Paga
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                Pendente
              </>
            )}
          </span>
          {/* ✅ NOVO: Indicador de transação financeira */}
          {c.financial_transaction_id && (
            <span 
              className="text-blue-600 text-lg" 
              title={`Registrado no financeiro (ID: ${c.financial_transaction_id})`}
            >
              💰
            </span>
          )}
        </div>
      )
    },
    { 
      key: 'created_at', 
      label: 'Data',
      render: (c: any) => new Date(c.created_at).toLocaleDateString('pt-BR')
    },
  ]

  return (
    <DashboardLayout>
      <div className="p-6">
        <FeatureWrapper feature="commissions" asCard={true}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comissões</h1>
            <p className="text-gray-600 mt-1">Gerencie comissões dos profissionais</p>
          </div>
        </div>

        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <Tabs.List className="flex border-b border-gray-200">
            <Tabs.Trigger
              value="detailed"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Detalhadas
            </Tabs.Trigger>
            <Tabs.Trigger
              value="summary"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Resumidas
            </Tabs.Trigger>
            <Tabs.Trigger
              value="paid"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Pagas
            </Tabs.Trigger>
            <Tabs.Trigger
              value="config"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Configurações
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="detailed" className="space-y-6">
            <div className="flex justify-end">
              <select
                value={selectedProfessional || ''}
                onChange={(e) => setSelectedProfessional(e.target.value ? parseInt(e.target.value) : null)}
                className="border rounded-lg px-4 py-2"
              >
                <option value="">Todos os profissionais</option>
                {professionals.map(prof => (
                  <option key={prof.id} value={prof.id}>{prof.full_name}</option>
                ))}
              </select>
            </div>

        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Pendente</span>
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                R$ {summary.total_pending?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Pago</span>
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                R$ {summary.total_paid?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Total Geral</span>
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                R$ {summary.total_amount?.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        )}

            <DataTable
              data={commissions}
              columns={columns}
              loading={loading}
              actions={(c) => (
                <div className="flex items-center gap-2">
                  {c.status !== 'paid' && (
                    <button
                      onClick={() => handlePay(c.id)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded"
                      title="Marcar como paga"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  {/* ✅ NOVO: Link para transação financeira */}
                  {c.financial_transaction_id && (
                    <Link
                      href={`/financial/transactions?highlight=${c.financial_transaction_id}`}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                      title="Ver no financeiro"
                    >
                      Ver 💰
                    </Link>
                  )}
                </div>
              )}
            />
          </Tabs.Content>

          <Tabs.Content value="summary" className="space-y-6">
            <div className="text-gray-600">Resumo de comissões em desenvolvimento...</div>
          </Tabs.Content>

          <Tabs.Content value="paid" className="space-y-6">
            <DataTable
              data={commissions.filter(c => c.status === 'paid')}
              columns={columns}
              loading={loading}
            />
          </Tabs.Content>

          <Tabs.Content value="config" className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurações de Comissões</h3>
              <p className="text-gray-600 mb-4">
                Configure as regras padrão de comissões para sua empresa.
              </p>
              <Link
                href="/commissions/config"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
              >
                <Settings className="w-4 h-4" />
                Abrir Configurações
              </Link>
            </div>
          </Tabs.Content>
        </Tabs.Root>
        </FeatureWrapper>
      </div>
    </DashboardLayout>
  )
}

