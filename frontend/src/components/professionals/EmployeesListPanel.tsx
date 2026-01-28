'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, Filter, Users, UserCheck, UserX } from 'lucide-react'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'

interface Employee {
  id: number
  full_name: string
  avatar_url?: string
  email: string
  phone?: string
  is_active: boolean
  commission_rate?: number
  specialties?: string[]
  role: string
}

interface EmployeesListPanelProps {
  employees: Employee[]
  selectedEmployeeId?: number
  onEmployeeSelect: (employee: Employee) => void
  onCreateEmployee: () => void
  loading?: boolean
}

export default function EmployeesListPanel({
  employees,
  selectedEmployeeId,
  onEmployeeSelect,
  onCreateEmployee,
  loading = false
}: EmployeesListPanelProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active')
  const [searchTerm, setSearchTerm] = useState('')

  const filteredEmployees = useMemo(() => {
    return employees.filter(employee => {
      const matchesTab = activeTab === 'active' ? employee.is_active : !employee.is_active
      const matchesSearch = searchTerm === '' || 
        employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesTab && matchesSearch
    })
  }, [employees, activeTab, searchTerm])

  const getFullImageUrl = (url: string | undefined | null): string | null => toAbsoluteImageUrl(url)

  const activeCount = employees.filter(e => e.is_active).length
  const inactiveCount = employees.filter(e => !e.is_active).length

  if (loading) {
    return (
      <div className="w-full max-w-sm bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 p-4 space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
          <button
            onClick={onCreateEmployee}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Novo profissional"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar profissionais..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 shrink-0">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Ativos</span>
            <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
              {activeCount}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`flex-1 flex items-center justify-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'inactive'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <UserX className="w-4 h-4" />
            <span>Inativos</span>
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
              {inactiveCount}
            </span>
          </button>
        </div>
      </div>

      {/* Employee List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredEmployees.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-sm">
              {searchTerm ? 'Nenhum profissional encontrado' : `Nenhum profissional ${activeTab === 'active' ? 'ativo' : 'inativo'}`}
            </p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              onClick={() => onEmployeeSelect(employee)}
              className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedEmployeeId === employee.id
                  ? 'border-blue-200 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="shrink-0">
                  {getFullImageUrl(employee.avatar_url) ? (
                    <img
                      src={getFullImageUrl(employee.avatar_url) as string}
                      alt={employee.full_name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {employee.full_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {employee.full_name}
                  </h3>
                  <p className="text-sm text-gray-500 truncate">
                    {employee.email}
                  </p>
                  
                  {/* Badges */}
                  <div className="flex items-center space-x-2 mt-2">
                    {employee.commission_rate && employee.commission_rate > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {employee.commission_rate}% comissão
                      </span>
                    )}
                    {employee.specialties && employee.specialties.length > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {employee.specialties.length} especialidade{employee.specialties.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      employee.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {employee.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
