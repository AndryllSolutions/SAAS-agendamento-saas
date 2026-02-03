'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'

interface DrawerState {
  level: number
  component: ReactNode
  onClose?: () => void
}

interface DrawerStackContextType {
  drawers: DrawerState[]
  openDrawer: (level: number, component: ReactNode, onClose?: () => void) => void
  closeDrawer: (level: number) => void
  closeAllDrawers: () => void
  currentLevel: number
  updateURL: (professionalId?: number, section?: string, overlay?: string) => void
}

const DrawerStackContext = createContext<DrawerStackContextType | null>(null)

export function useDrawerStack() {
  const context = useContext(DrawerStackContext)
  if (!context) {
    throw new Error('useDrawerStack must be used within DrawerStackProvider')
  }
  return context
}

interface DrawerStackProviderProps {
  children: ReactNode
}

export function DrawerStackProvider({ children }: DrawerStackProviderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [drawers, setDrawers] = useState<DrawerState[]>([])

  const updateURL = useCallback((professionalId?: number, section?: string, overlay?: string) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    
    // Clear existing drawer params
    params.delete('drawerProfessionalId')
    params.delete('section')
    params.delete('overlay')
    
    // Add new params
    if (professionalId) params.set('drawerProfessionalId', professionalId.toString())
    if (section) params.set('section', section)
    if (overlay) params.set('overlay', overlay)
    
    const newURL = params.toString() ? `?${params.toString()}` : ''
    router.replace(newURL, { scroll: false })
  }, [router, searchParams])

  const openDrawer = useCallback((level: number, component: ReactNode, onClose?: () => void) => {
    setDrawers(prev => {
      // Remove drawers with level >= current level to prevent stacking issues
      const filtered = prev.filter(d => d.level < level)
      return [...filtered, { level, component, onClose }]
    })
  }, [])

  const closeDrawer = useCallback((level: number) => {
    setDrawers(prev => {
      const drawer = prev.find(d => d.level === level)
      if (drawer?.onClose) {
        drawer.onClose()
      }
      // Remove this level and any higher levels
      return prev.filter(d => d.level < level)
    })
  }, [])

  const closeAllDrawers = useCallback(() => {
    setDrawers(prev => {
      prev.forEach(drawer => {
        if (drawer.onClose) {
          drawer.onClose()
        }
      })
      return []
    })
  }, [])

  const currentLevel = drawers.length > 0 ? Math.max(...drawers.map(d => d.level)) : 0

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawers.length > 0) {
        const highestLevel = Math.max(...drawers.map(d => d.level))
        closeDrawer(highestLevel)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [drawers, closeDrawer])

  // Lock body scroll when drawers are open
  useEffect(() => {
    if (drawers.length > 0) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [drawers.length])

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      if (drawers.length > 0) {
        const highestLevel = Math.max(...drawers.map(d => d.level))
        closeDrawer(highestLevel)
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [drawers, closeDrawer])

  return (
    <DrawerStackContext.Provider value={{
      drawers,
      openDrawer,
      closeDrawer,
      closeAllDrawers,
      currentLevel,
      updateURL
    }}>
      {children}
      {drawers.map((drawer) => (
        <DrawerOverlay
          key={drawer.level}
          level={drawer.level}
          isHighest={drawer.level === currentLevel}
          onClose={() => closeDrawer(drawer.level)}
        >
          {drawer.component}
        </DrawerOverlay>
      ))}
    </DrawerStackContext.Provider>
  )
}

interface DrawerOverlayProps {
  level: number
  isHighest: boolean
  onClose: () => void
  children: ReactNode
}

function DrawerOverlay({ level, isHighest, onClose, children }: DrawerOverlayProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const zIndex = 40 + level * 10 // z-40, z-50, z-60, etc.
  const overlayOpacity = isHighest ? 'bg-black/50' : 'bg-black/20'

  return createPortal(
    <div
      className={`fixed inset-0 ${overlayOpacity} transition-opacity duration-200 ease-out`}
      style={{ zIndex }}
    >
      {/* Focus trap container */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      {children}
    </div>,
    document.body
  )
}

interface DrawerProps {
  title: string
  onClose?: () => void
  width?: 'narrow' | 'normal' | 'wide'
  children: ReactNode
  className?: string
}

export function Drawer({ 
  title, 
  onClose, 
  width = 'normal', 
  children, 
  className = '' 
}: DrawerProps) {
  const widthClasses = {
    narrow: 'w-full max-w-md',
    normal: 'w-full max-w-2xl lg:w-[70%]',
    wide: 'w-full max-w-4xl lg:w-[80%]'
  }

  return (
    <div
      className={`fixed right-0 top-0 h-full ${widthClasses[width]} bg-white shadow-2xl transform transition-transform duration-280 ease-out translate-x-0 flex flex-col ${className}`}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}
