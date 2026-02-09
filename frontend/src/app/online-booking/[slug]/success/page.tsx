'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { CheckCircle, Home, Share2 } from 'lucide-react'

export default function PublicBookingSuccessPage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug ?? ''
  const publicUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/online-booking/${slug}`

  return (
    <div className="min-h-screen bg-[#f5f6f8] px-4 py-12 text-center text-gray-900">
      <div className="mx-auto max-w-md space-y-6 rounded-3xl bg-white p-8 shadow-xl">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle className="h-16 w-16" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-gray-400">Tudo certo</p>
          <h1 className="text-3xl font-bold">Agendamento confirmado! 🎉</h1>
          <p className="text-sm text-gray-500">
            Você receberá um email e um WhatsApp com todos os detalhes. Caso precise alterar ou cancelar, responda a mensagem recebida.
          </p>
        </div>

        <div className="rounded-2xl bg-gray-50 p-4 text-left text-sm text-gray-600">
          <p className="font-semibold text-gray-900">Lembretes rápidos</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Chegue com 10 minutos de antecedência.</li>
            <li>Aviso mínimo de 24h para reagendamento.</li>
            <li>Traga um documento com foto, se solicitado.</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            href={`/online-booking/${slug}`}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-6 py-4 text-lg font-semibold text-white transition hover:bg-gray-800"
          >
            <Home className="h-5 w-5" /> Voltar para a página de agendamento
          </Link>
          <button
            onClick={() => navigator.share?.({ title: 'Meu agendamento', url: publicUrl }) || navigator.clipboard.writeText(publicUrl)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:border-gray-300"
          >
            <Share2 className="h-4 w-4" /> Compartilhar link
          </button>
        </div>
      </div>
    </div>
  )
}
