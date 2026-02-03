'use client'

import { useState, useEffect } from 'react'
import { Copy, Loader2, Globe, Instagram, MessageCircle, Search, Facebook } from 'lucide-react'
import { toast } from 'sonner'
import { onlineBookingService, BookingLinks } from '@/services/onlineBookingService'

export default function LinksTab() {
  const [loading, setLoading] = useState(true)
  const [links, setLinks] = useState<BookingLinks | null>(null)

  useEffect(() => {
    loadLinks()
  }, [])

  const loadLinks = async () => {
    try {
      setLoading(true)
      const data = await onlineBookingService.getLinks()
      setLinks(data)
    } catch (error: any) {
      console.error('Erro ao carregar links:', error)
      toast.error('Erro ao carregar links')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Link ${label} copiado!`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!links) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Não foi possível carregar os links</p>
      </div>
    )
  }

  const linkCards = [
    {
      icon: Globe,
      title: 'Geral',
      description: 'Página online do seu agendamento. Envie o link diretamente aos seus clientes para agendarem de qualquer lugar.',
      link: links.general_link,
      color: 'bg-blue-500'
    },
    {
      icon: Instagram,
      title: 'Instagram',
      description: 'Adicione este link em sua bio do Instagram para seus clientes agendarem de qualquer lugar.',
      link: links.instagram_link,
      color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500'
    },
    {
      icon: MessageCircle,
      title: 'WhatsApp',
      description: 'Adicione este link em caso os seus clientes agendem sem ligar.',
      link: links.whatsapp_link,
      color: 'bg-green-500'
    },
    {
      icon: Search,
      title: 'Google',
      description: 'Adicione este link em alguma campanha do Google para seus clientes agendarem sem ligar.',
      link: links.google_link,
      color: 'bg-red-500'
    },
    {
      icon: Facebook,
      title: 'Facebook',
      description: 'Adicione este link em seu Facebook para seus clientes agendarem de qualquer lugar.',
      link: links.facebook_link,
      color: 'bg-blue-600'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Links de Agendamento</h3>
        <p className="text-sm text-gray-600 mb-6">
          Receba agendamentos pelas plataformas em que seus clientes mais utilizam.
        </p>
      </div>

      {/* Link padrão */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">Link padrão</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={links.base_url}
            readOnly
            className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm"
          />
          <button
            onClick={() => copyToClipboard(links.base_url, 'padrão')}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90"
          >
            <Copy className="w-4 h-4" />
            Copiar
          </button>
        </div>
      </div>

      {/* Cards de links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {linkCards.map((card) => {
          const Icon = card.icon
          return (
            <div key={card.title} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className={`${card.color} p-2 rounded-lg text-white`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="font-semibold text-gray-900">{card.title}</h4>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                {card.description}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={card.link}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded text-xs"
                />
                <button
                  onClick={() => copyToClipboard(card.link, card.title)}
                  className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded hover:bg-gray-200 text-sm"
                >
                  <Copy className="w-3 h-3" />
                  Copiar
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nota */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Compartilhe estes links em suas redes sociais, site e materiais de marketing para facilitar o agendamento dos seus clientes.
        </p>
      </div>
    </div>
  )
}
