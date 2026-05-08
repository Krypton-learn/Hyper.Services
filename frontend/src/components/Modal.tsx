import { X } from 'lucide-react'
import { useEffect } from 'react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-neutral/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-[var(--background-secondary)] rounded-2xl shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-neutral/10 dark:border-neutral/20">
            <h2 className="text-xl font-semibold text-neutral">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral/5 dark:hover:bg-neutral/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral/60" />
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}