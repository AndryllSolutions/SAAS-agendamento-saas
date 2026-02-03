'use client'

import { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  searchable?: boolean
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
  }
  actions?: (item: T) => React.ReactNode
  onRowClick?: (item: T) => void
}

export default function DataTable<T extends { id: number }>({
  data,
  columns,
  loading = false,
  searchable = true,
  pagination,
  actions,
  onRowClick,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<keyof T | string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    return columns.some((col) => {
      const value = item[col.key as keyof T]
      return String(value).toLowerCase().includes(searchTerm.toLowerCase())
    })
  })

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0
    const aValue = a[sortColumn as keyof T]
    const bValue = b[sortColumn as keyof T]
    
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return
    
    if (sortColumn === column.key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column.key)
      setSortDirection('asc')
    }
  }

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {searchable && (
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  onClick={() => handleSort(column)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {sortColumn === column.key && (
                      <span className="text-primary">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Ações</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-12 text-center text-gray-500">
                  Nenhum registro encontrado
                </td>
              </tr>
            ) : (
              sortedData.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick?.(item)}
                  className={`hover:bg-gray-50 transition-colors ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((column) => (
                    <td key={String(column.key)} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(item) : String(item[column.key as keyof T] || '')}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {actions(item)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && totalPages > 1 && (
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Mostrando {((pagination.page - 1) * pagination.pageSize) + 1} até{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total} resultados
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 text-sm">
              Página {pagination.page} de {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => pagination.onPageChange(totalPages)}
              disabled={pagination.page >= totalPages}
              className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

