'use client'

import { X } from 'lucide-react'
import { useDrawerStack } from './DrawerStackManager'

interface SubDrawerProps {
  title: string
  level: number
  children: React.ReactNode
  onClose?: () => void
  width?: 'narrow' | 'normal' | 'wide'
}

export function SubDrawer({ 
  title, 
  level, 
  children, 
  onClose,
  width = 'normal' 
}: SubDrawerProps) {
  const { closeDrawer } = useDrawerStack()

  const handleClose = () => {
    onClose?.()
    closeDrawer(level)
  }

  const widthClasses = {
    narrow: 'w-full max-w-md',
    normal: 'w-full max-w-2xl lg:w-[60%]',
    wide: 'w-full max-w-4xl lg:w-[70%]'
  }

  return (
    <div
      className={`fixed right-0 top-0 h-full ${widthClasses[width]} bg-white shadow-2xl transform transition-transform duration-300 ease-out translate-x-0 flex flex-col`}
      style={{ zIndex: 50 + level * 10 }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
