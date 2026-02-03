'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { formatApiError } from '@/utils/errorHandler'

type Point = { x: number; y: number }

const getPos = (canvas: HTMLCanvasElement, clientX: number, clientY: number): Point => {
  const rect = canvas.getBoundingClientRect()
  return { x: clientX - rect.left, y: clientY - rect.top }
}

export default function AnamneseSignaturePad({
  initialImage,
  disabled,
  canSign,
  onSaveLocal,
  onSign,
}: {
  initialImage?: string | null
  disabled?: boolean
  canSign: boolean
  onSaveLocal: (data: { signatureName: string; signatureImageBase64: string }) => void
  onSign: (data: { signatureName: string; signatureImageBase64: string }) => Promise<void>
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasInk, setHasInk] = useState(false)
  const [signatureName, setSignatureName] = useState('')
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [signing, setSigning] = useState(false)

  const ctx = useMemo(() => {
    const canvas = canvasRef.current
    if (!canvas) return null
    return canvas.getContext('2d')
  }, [canvasRef.current])

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    canvas.width = canvas.offsetWidth
    canvas.height = 220

    const context = canvas.getContext('2d')
    if (!context) return

    context.lineWidth = 2
    context.lineCap = 'round'
    context.strokeStyle = '#111827'

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const clear = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
  }

  const beginStroke = (p: Point) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.beginPath()
    context.moveTo(p.x, p.y)
    setIsDrawing(true)
  }

  const stroke = (p: Point) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return
    context.lineTo(p.x, p.y)
    context.stroke()
    setHasInk(true)
  }

  const endStroke = () => {
    setIsDrawing(false)
  }

  const exportBase64 = (): string | null => {
    const canvas = canvasRef.current
    if (!canvas) return null
    if (!hasInk) return null
    return canvas.toDataURL('image/png')
  }

  const handleSaveLocal = () => {
    if (disabled) return
    if (!signatureName.trim()) {
      toast.error('Informe o nome para assinatura')
      return
    }
    const img = exportBase64()
    if (!img) {
      toast.error('Desenhe a assinatura antes de salvar')
      return
    }
    setPreview(img)
    onSaveLocal({ signatureName: signatureName.trim(), signatureImageBase64: img })
    toast.success('Assinatura salva no formulário')
  }

  const handleSign = async () => {
    if (disabled) return
    if (!canSign) {
      toast.error('Salve a anamnese antes de assinar')
      return
    }
    if (!signatureName.trim()) {
      toast.error('Informe o nome para assinatura')
      return
    }
    const img = exportBase64()
    if (!img) {
      toast.error('Desenhe a assinatura antes de salvar')
      return
    }

    setSigning(true)
    try {
      await onSign({ signatureName: signatureName.trim(), signatureImageBase64: img })
    } catch (e: any) {
      toast.error(formatApiError(e))
    } finally {
      setSigning(false)
    }
  }

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600 mb-2">Preview da assinatura</div>
          <img src={preview} alt="Assinatura" className="max-w-full h-auto border rounded" />
          <button
            type="button"
            onClick={() => setPreview(null)}
            disabled={disabled}
            className="mt-3 text-sm text-primary hover:underline disabled:opacity-60"
          >
            Regravar assinatura
          </button>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="text-sm text-gray-600 mb-2">Assine abaixo</div>
          <div className="w-full">
            <canvas
              ref={canvasRef}
              className="w-full rounded-md border border-gray-200 bg-white"
              onMouseDown={(e) => beginStroke(getPos(e.currentTarget, e.clientX, e.clientY))}
              onMouseMove={(e) => stroke(getPos(e.currentTarget, e.clientX, e.clientY))}
              onMouseUp={endStroke}
              onMouseLeave={endStroke}
              onTouchStart={(e) => {
                const t = e.touches[0]
                beginStroke(getPos(e.currentTarget, t.clientX, t.clientY))
              }}
              onTouchMove={(e) => {
                const t = e.touches[0]
                stroke(getPos(e.currentTarget, t.clientX, t.clientY))
              }}
              onTouchEnd={endStroke}
            />
          </div>

          <div className="mt-3 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <button
              type="button"
              onClick={clear}
              disabled={disabled}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              Limpar assinatura
            </button>
            <button
              type="button"
              onClick={handleSaveLocal}
              disabled={disabled}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60"
            >
              Salvar assinatura
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Nome do assinante</label>
        <input
          type="text"
          value={signatureName}
          onChange={(e) => setSignatureName(e.target.value)}
          disabled={disabled}
          placeholder="Digite o nome completo"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSign}
          disabled={disabled || signing}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
        >
          {signing ? 'Assinando...' : 'Salvar assinatura'}
        </button>
      </div>

      {!canSign && (
        <div className="text-xs text-gray-500">
          Salve a anamnese para habilitar assinatura eletrônica.
        </div>
      )}
    </div>
  )
}
