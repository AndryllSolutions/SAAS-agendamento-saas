'use client'

import { useState, useEffect } from 'react'
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { onlineBookingService, GalleryImage } from '@/services/onlineBookingService'

export default function GalleryTab() {
  const [loading, setLoading] = useState(true)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadImages()
  }, [])

  const loadImages = async () => {
    try {
      setLoading(true)
      const data = await onlineBookingService.listGalleryImages()
      setImages(data)
    } catch (error: any) {
      console.error('Erro ao carregar imagens:', error)
      toast.error('Erro ao carregar galeria')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('Deseja realmente excluir esta imagem?')) return

    try {
      await onlineBookingService.deleteGalleryImage(imageId)
      toast.success('Imagem excluída com sucesso!')
      loadImages()
    } catch (error: any) {
      console.error('Erro ao excluir imagem:', error)
      toast.error('Erro ao excluir imagem')
    }
  }

  const handleUpload = () => {
    toast.info('Funcionalidade de upload em desenvolvimento')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Galeria de Fotos</h3>
        <p className="text-sm text-gray-600 mb-6">
          Adicione fotos do seu estabelecimento para exibir na página pública de agendamento
        </p>
      </div>

      {/* Botão Upload */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Enviar imagem
            </>
          )}
        </button>
        {images.length > 0 && (
          <button
            onClick={() => toast.info('Funcionalidade em desenvolvimento')}
            className="text-sm text-red-600 hover:text-red-700"
          >
            Excluir imagens
          </button>
        )}
      </div>

      {/* Grid de Imagens */}
      {images.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Nenhuma imagem adicionada</p>
          <p className="text-sm text-gray-500">
            Clique em "Enviar imagem" para adicionar fotos à galeria
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
            >
              <img
                src={image.image_url}
                alt="Galeria"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <button
                  onClick={() => handleDeleteImage(image.id!)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Nota */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Dica:</strong> Adicione fotos de qualidade do seu estabelecimento, equipe e serviços. Imagens atraentes aumentam a conversão de agendamentos.
        </p>
      </div>
    </div>
  )
}
