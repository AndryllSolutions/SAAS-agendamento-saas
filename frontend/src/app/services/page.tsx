'use client'

import { useState, useEffect } from 'react'
import { serviceService } from '@/services/api'
import { Plus, Edit, Trash2, Clock, DollarSign, X } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'

export default function ServicesPage() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    currency: 'BRL'
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await serviceService.list()
      setServices(response.data)
    } catch (error) {
      toast.error('Erro ao carregar serviços')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingId) {
        await serviceService.update(editingId, formData)
        toast.success('Serviço atualizado!')
      } else {
        await serviceService.create(formData)
        toast.success('Serviço criado!')
      }
      setShowModal(false)
      setEditingId(null)
      loadServices()
      resetForm()
    } catch (error) {
      toast.error('Erro ao salvar serviço')
    }
  }

  const handleEdit = (service: any) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration_minutes: service.duration_minutes.toString(),
      currency: service.currency || 'BRL'
    })
    setEditingId(service.id)
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este serviço?')) {
      try {
        await serviceService.delete(id)
        toast.success('Serviço excluído!')
        loadServices()
      } catch (error) {
        toast.error('Erro ao excluir serviço')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      currency: 'BRL'
    })
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Serviços</h1>
        <button
          onClick={() => {
            resetForm()
            setEditingId(null)
            setShowModal(true)
          }}
          className="bg-primary text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" />
          Novo Serviço
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service: any) => (
            <div key={service.id} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg">{service.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="text-red-600 hover:bg-red-50 p-2 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">{service.duration_minutes} min</span>
                </div>
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <DollarSign className="w-5 h-5" />
                  <span>{service.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nome</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duração (min)</label>
                  <input
                    type="number"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
                >
                  {editingId ? 'Atualizar' : 'Criar'}
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