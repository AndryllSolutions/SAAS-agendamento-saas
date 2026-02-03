'use client'

import { X } from 'lucide-react'

interface PaywallModalProps {
  isOpen: boolean
  onClose: () => void
  onContract: () => void
}

export function PaywallModal({ isOpen, onClose, onContract }: PaywallModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Você ainda não possui essa funcionalidade contratada
          </h2>
          
          <div className="flex gap-3 justify-center mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Fechar
            </button>
            <button
              onClick={onContract}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Contratar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
