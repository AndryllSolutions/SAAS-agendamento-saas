'use client'

import { useState, useEffect } from 'react'
import { Link as LinkIcon, Copy, Loader2 } from 'lucide-react'
import DashboardLayout from '@/components/DashboardLayout'
import { toast } from 'sonner'
import { onlineBookingService } from '@/services/onlineBookingService'

export default function SchedulingLinkPage() {
  const [link, setLink] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCompanyLink = async () => {
      try {
        setLoading(true)
        const links = await onlineBookingService.getLinks()
        setLink(links.general_link || links.base_url)
      } catch (error: any) {
        console.error('Erro ao buscar informações da empresa:', error)
        const message = error.response?.data?.detail || 'Erro ao carregar link de agendamento'
        toast.error(message)
        setLink('')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanyLink()
  }, [])

  const handleCopy = () => {
    if (link) {
      navigator.clipboard.writeText(link)
      toast.success('Link copiado!')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Link de Agendamento</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <LinkIcon className="w-8 h-8 text-primary" />
            <h2 className="text-xl font-bold">Seu Link de Agendamento</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 border rounded-lg px-4 py-2 bg-gray-50"
                  placeholder="Carregando link..."
                />
                <button
                  onClick={handleCopy}
                  disabled={!link}
                  className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
              </div>
              <p className="text-sm text-gray-600">
                Compartilhe este link com seus clientes para que eles possam agendar serviços online.
              </p>
              {link && (
                <p className="text-xs text-gray-500 mt-2">
                  <strong>Nota:</strong> Este link está em desenvolvimento e será ativado em breve.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

