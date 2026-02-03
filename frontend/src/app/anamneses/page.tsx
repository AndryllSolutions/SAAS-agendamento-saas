'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, FileText, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import DataTable from '@/components/ui/DataTable'
import ErrorState from '@/components/ui/ErrorState'
import LoadingState from '@/components/ui/LoadingState'
import * as Tabs from '@radix-ui/react-tabs'
import Link from 'next/link'
import { deleteAnamnese, listAnamneses } from '@/services/anamneses'
import type { Anamnese, AnamneseStatusUi } from '@/types/anamneses'
import AnamneseDrawer from './_components/AnamneseDrawer'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function AnamnesesPage() {
  const queryClient = useQueryClient()

  const [activeTab, setActiveTab] = useState<'list' | 'templates'>('list')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selected, setSelected] = useState<Anamnese | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [status, setStatus] = useState<AnamneseStatusUi | 'Todos'>('Todos')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedSearch(searchInput), 300)
    return () => window.clearTimeout(id)
  }, [searchInput])

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, status])

  useEffect(() => {
    const onDocClick = () => setOpenMenuId(null)
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const listQuery = useQuery({
    queryKey: ['anamneses', 'list', { search: debouncedSearch, status }],
    queryFn: () => listAnamneses({ search: debouncedSearch, status }),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => deleteAnamnese(id),
    onSuccess: async () => {
      toast.success('Excluída com sucesso')
      await queryClient.invalidateQueries({ queryKey: ['anamneses', 'list'] })
    },
    onError: () => {
      toast.error('Erro ao excluir anamnese')
    },
  })

  const items = listQuery.data?.items || []
  const total = listQuery.data?.total || 0

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize
    const end = start + pageSize
    return items.slice(start, end)
  }, [items, page, pageSize])

  const columns = useMemo(
    () => [
      {
        key: 'clientName',
        label: 'Cliente',
        sortable: true,
        render: (a: Anamnese) => (
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate">{a.clientName}</div>
            {a.clientPhone ? <div className="text-xs text-gray-500 truncate">{a.clientPhone}</div> : null}
          </div>
        ),
      },
      {
        key: 'templateName',
        label: 'Modelo de Anamnese',
        sortable: true,
      },
      {
        key: 'date',
        label: 'Data',
        sortable: true,
        render: (a: Anamnese) =>
          a.date ? format(new Date(a.date), 'dd/MM/yyyy', { locale: ptBR }) : '-',
      },
      {
        key: 'status',
        label: 'Status',
        render: (a: Anamnese) => (
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              a.isSigned
                ? 'bg-green-100 text-green-800'
                : a.status === 'Fechado'
                ? 'bg-gray-100 text-gray-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {a.isSigned ? 'Assinada' : a.status}
          </span>
        ),
      },
    ],
    []
  )

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6" />
              Anamneses
            </h1>
          </div>
          <button
            onClick={() => {
              setSelected(null)
              setDrawerOpen(true)
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova anamnese
          </button>
        </div>

        <Tabs.Root value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <Tabs.List className="flex border-b border-gray-200">
            <Tabs.Trigger
              value="list"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Anamneses
            </Tabs.Trigger>
            <Tabs.Trigger
              value="templates"
              className="px-6 py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-gray-900 data-[state=active]:border-primary data-[state=active]:text-primary"
            >
              Modelo de anamneses
            </Tabs.Trigger>
          </Tabs.List>

          <Tabs.Content value="list" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div className="flex flex-col md:flex-row gap-3 md:items-center">
                <div className="relative">
                  <input
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    placeholder="Procure por nome…"
                    className="w-full md:w-[340px] px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full md:w-[180px] px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="Todos">Todos</option>
                  <option value="Aberto">Aberto</option>
                  <option value="Fechado">Fechado</option>
                </select>
              </div>
            </div>

            {listQuery.isLoading && items.length === 0 ? (
              <LoadingState message="Carregando anamneses..." />
            ) : listQuery.isError ? (
              <ErrorState
                title="Erro ao carregar anamneses"
                message="Não foi possível carregar a lista."
                onRetry={() => listQuery.refetch()}
              />
            ) : (
              <DataTable
                data={pageItems}
                columns={columns}
                loading={listQuery.isFetching}
                searchable={false}
                pagination={{
                  page,
                  pageSize,
                  total,
                  onPageChange: setPage,
                  onPageSizeChange: setPageSize,
                }}
                actions={(a) => (
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="p-2 rounded-lg hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === a.id ? null : a.id)
                      }}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {openMenuId === a.id && (
                      <div className="absolute right-0 mt-2 w-40 rounded-md border border-gray-200 bg-white shadow-lg z-10">
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
                          onClick={() => {
                            setSelected(a)
                            setDrawerOpen(true)
                            setOpenMenuId(null)
                          }}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={deleteMutation.isPending || !!a.isSigned}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-60"
                          onClick={async () => {
                            setOpenMenuId(null)
                            if (a.isSigned) {
                              toast.error('Anamnese assinada não pode ser excluída')
                              return
                            }
                            if (!confirm('Deseja realmente excluir esta anamnese?')) return
                            await deleteMutation.mutateAsync(a.id)
                          }}
                        >
                          Excluir
                        </button>
                      </div>
                    )}
                  </div>
                )}
                onRowClick={(a) => {
                  setSelected(a)
                  setDrawerOpen(true)
                }}
              />
            )}
          </Tabs.Content>

          <Tabs.Content value="templates" className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-lg font-semibold text-gray-900">Modelo de anamneses</div>
                  <div className="text-sm text-gray-600">Estrutura base pronta. Editor será implementado nesta rota.</div>
                </div>
                <Link
                  href="/anamneses/modelos"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Abrir modelos
                </Link>
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>

        <AnamneseDrawer
          open={drawerOpen}
          initial={selected}
          onClose={() => {
            setDrawerOpen(false)
            setSelected(null)
          }}
        />
      </div>
    </DashboardLayout>
  )
}
