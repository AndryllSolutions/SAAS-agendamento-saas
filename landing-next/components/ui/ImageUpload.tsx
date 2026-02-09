'use client'

import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { uploadService } from '@/services/api'
import { toAbsoluteImageUrl } from '@/utils/apiUrl'

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  prefix?: string
  label?: string
  className?: string
  maxSize?: number // in MB
  aspectRatio?: number // width/height
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'images',
  prefix = '',
  label = 'Upload de Imagem',
  className = '',
  maxSize = 10,
  aspectRatio
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  const [preview, setPreview] = useState<string | null>(toAbsoluteImageUrl(value))
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Atualizar preview quando value mudar
  useEffect(() => {
    setPreview(toAbsoluteImageUrl(value))
  }, [value])

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione um arquivo de imagem')
      return
    }

    // Validate file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      toast.error(`Arquivo muito grande. Tamanho máximo: ${maxSize}MB`)
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload file
    setUploading(true)
    try {
      const response = await uploadService.uploadImage(file, folder, prefix)
      const data = response.data as { url?: string }

      if (!data?.url) {
        throw new Error('Erro ao fazer upload')
      }

      onChange(data.url)
      toast.success('Imagem enviada com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer upload da imagem')
      setPreview(null)
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = () => {
    setPreview(null)
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      
      {preview ? (
        <div className="relative inline-block">
          <div className="relative w-48 h-48 rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        >
          {uploading ? (
            <div className="flex flex-col items-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="text-sm text-gray-600">Enviando...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                Clique para fazer upload
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF até {maxSize}MB
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  )
}

