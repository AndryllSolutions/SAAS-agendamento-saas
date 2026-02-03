'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'
import { DrawerStackProvider, useDrawerStack } from '@/components/professionals/DrawerStackManager'
import EmployeesListPanel from '@/components/professionals/EmployeesListPanel'
import EmployeeDrawer from '@/components/professionals/EmployeeDrawer'
import ProfessionalForm from '@/components/ProfessionalForm'

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
  cpf_cnpj?: string
  date_of_birth?: string
  bio?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  working_hours?: any
}

function EmployeesPageContent() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  const { openDrawer, closeAllDrawers } = useDrawerStack()

  const loadEmployees = async () => {
    try {
      setLoading(true)
      const { professionalService } = await import('@/services/api')
      const response = await professionalService.list()
      setEmployees(response.data)
    } catch (error) {
      toast.error('Erro ao carregar profissionais')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEmployees()
  }, [])

  const handleEmployeeSelect = (employee: Employee) => {
    setSelectedEmployeeId(employee.id)
    
    openDrawer(1, 
      <EmployeeDrawer 
        employee={employee}
        onClose={() => {
          setSelectedEmployeeId(undefined)
        }}
        onSave={(data) => {
          // Implementar lógica de salvamento
          console.log('Saving employee:', data)
          loadEmployees() // Recarregar lista após salvar
          toast.success('Profissional atualizado com sucesso!')
        }}
      />
    )
  }

  const handleCreateEmployee = () => {
    setShowCreateModal(true)
  }

  const handleCreateSuccess = () => {
    setShowCreateModal(false)
    loadEmployees()
    toast.success('Profissional criado com sucesso!')
  }

  const handleCreateClose = () => {
    setShowCreateModal(false)
  }

  return (
    <DashboardLayout>
      <div className="flex h-full bg-gray-100">
        {/* Lista de Profissionais */}
        <EmployeesListPanel
          employees={employees}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeSelect={handleEmployeeSelect}
          onCreateEmployee={handleCreateEmployee}
          loading={loading}
        />

        {/* Conteúdo principal */}
        <div className="flex-1 flex items-center justify-center">
          {selectedEmployeeId ? (
            <div className="text-center text-gray-500">
              <p>Drawer aberto para o profissional selecionado</p>
            </div>
          ) : (
            <div className="text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Selecione um profissional
              </h3>
              <p className="text-gray-500">
                Escolha um profissional da lista para visualizar e editar suas informações
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Criação */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <ProfessionalForm
              onClose={handleCreateClose}
              onSuccess={handleCreateSuccess}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

export default function EmployeesPage() {
  return (
    <DrawerStackProvider>
      <EmployeesPageContent />
    </DrawerStackProvider>
  )
}
