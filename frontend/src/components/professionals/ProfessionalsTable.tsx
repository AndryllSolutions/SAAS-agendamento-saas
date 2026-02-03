'use client'

import React from 'react'
import { GripVertical, Edit, Trash2, Star, Clock, DollarSign, User as UserIcon, Mail, Phone, Award, Calendar, BarChart3, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'

interface Professional {
  id: number
  full_name: string
  email: string
  phone?: string
  cellphone?: string
  avatar_url?: string
  is_active: boolean
  commission_rate?: number
  specialties?: string[]
  role: string
  sort_order?: number
  cpf_cnpj?: string
  date_of_birth?: string
  bio?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  working_hours?: any
}

interface ProfessionalsTableProps {
  professionals: Professional[]
  loading: boolean
  onEdit: (prof: Professional) => void
  onDelete: (id: number) => void
  onDragStart: (e: React.DragEvent, item: Professional, index: number) => void
  onDragOver: (e: React.DragEvent, index: number) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, index: number) => void
  dragOverIndex: number | null
  isReordering: boolean
}

export function ProfessionalsTable({
  professionals,
  loading,
  onEdit,
  onDelete,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  dragOverIndex,
  isReordering
}: ProfessionalsTableProps) {
  const getFullImageUrl = (url: string | undefined | null): string | null => toAbsoluteImageUrl(url)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {professionals.map((professional, index) => (
        <div
          key={professional.id}
          draggable={!isReordering}
          onDragStart={(e) => onDragStart(e, professional, index)}
          onDragOver={(e) => onDragOver(e, index)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, index)}
          className={`bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 ${
            dragOverIndex === index ? 'border-blue-400 shadow-lg' : 'border-gray-200'
          } ${isReordering ? 'opacity-50' : ''}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Drag Handle */}
              {!isReordering && (
                <div className="cursor-move p-2 hover:bg-gray-100 rounded transition-colors">
                  <GripVertical className="w-4 h-4 text-gray-400" />
                </div>
              )}

              {/* Avatar */}
              {getFullImageUrl(professional.avatar_url) ? (
                <img
                  src={getFullImageUrl(professional.avatar_url) as string}
                  alt={professional.full_name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                  {professional.full_name.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Professional Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">{professional.full_name}</h3>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    professional.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {professional.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {professional.email && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-4 h-4" />
                      <span>{professional.email}</span>
                    </div>
                  )}
                  {(professional.phone || professional.cellphone) && (
                    <div className="flex items-center space-x-1">
                      <Phone className="w-4 h-4" />
                      <span>{professional.phone || professional.cellphone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-6 text-sm">
                {professional.commission_rate && (
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-gray-600">{professional.commission_rate}%</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">4.8</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(professional)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Editar"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(professional.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
