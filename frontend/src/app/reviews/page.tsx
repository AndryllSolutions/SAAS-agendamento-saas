'use client'

import { useState, useEffect } from 'react'
import { reviewService } from '@/services/api'
import { Star, MessageSquare, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import DashboardLayout from '@/components/DashboardLayout'

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      const response = await reviewService.list()
      setReviews(response.data)
    } catch (error) {
      toast.error('Erro ao carregar avaliações')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
      : 0

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Avaliações</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliação Média</p>
                <div className="flex items-center gap-2 mt-2">
                  <p className="text-3xl font-bold">{averageRating.toFixed(1)}</p>
                  <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Avaliações</p>
                <p className="text-3xl font-bold mt-2">{reviews.length}</p>
              </div>
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avaliações 5 Estrelas</p>
                <p className="text-3xl font-bold mt-2">
                  {reviews.filter((r: any) => r.rating === 5).length}
                </p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhuma avaliação encontrada</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: any) => (
              <div key={review.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">
                        {review.client?.full_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{review.client?.full_name}</h3>
                      <p className="text-sm text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  {renderStars(review.rating)}
                </div>

                {review.comment && (
                  <p className="text-gray-700 mb-4">{review.comment}</p>
                )}

                {review.professional && (
                  <div className="text-sm text-gray-500">
                    Profissional: <span className="font-medium">{review.professional.full_name}</span>
                  </div>
                )}

                {review.response && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Resposta:</p>
                    <p className="text-sm text-gray-600">{review.response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
