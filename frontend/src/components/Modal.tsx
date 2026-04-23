import type { ReactNode } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className = '' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      <div
        className={`relative bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-lg max-h-[90vh] overflow-y-auto ${className}`}
      >
        <div className="sticky top-0 flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold truncate pr-2">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  )
}
