'use client'

import { toast } from 'sonner'

export default function AnamneseLinkShare({
  link,
}: {
  link?: string
}) {
  const copy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      toast.success('Link copiado')
    } catch {
      toast.error('Não foi possível copiar o link')
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Link público da anamnese</label>
        <div className="flex gap-2">
          <input
            value={link || ''}
            readOnly
            placeholder="Link indisponível"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
          />
          <button
            type="button"
            onClick={copy}
            disabled={!link}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60"
          >
            Copiar link
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <div className="font-medium mb-1">Segurança</div>
        <div>
          Este link deve usar um token não sequencial. No momento, o backend não expõe token público para anamnese; este link é apenas um placeholder de UI.
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4">
        <div>
          <div className="text-sm font-medium">Ativar/Desativar link</div>
          <div className="text-xs text-gray-500">Não suportado pelo backend</div>
        </div>
        <button type="button" disabled className="px-4 py-2 border border-gray-300 rounded-lg opacity-60">
          Desativado
        </button>
      </div>
    </div>
  )
}
