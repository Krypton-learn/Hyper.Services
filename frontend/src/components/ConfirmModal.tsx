import { AlertTriangle, XCircle } from 'lucide-react'
import Modal from './Modal'
import { Form, FormActions, Button } from './Form'

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  isLoading?: boolean
  variant?: 'danger' | 'warning'
}

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  isLoading = false,
  variant = 'danger'
}: ConfirmModalProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onConfirm()
  }

  const isDanger = variant === 'danger'
  const iconColor = isDanger ? 'text-red-500' : 'text-primary'
  const iconBg = isDanger ? 'bg-red-50 dark:bg-red-900/30' : 'bg-primary/10'

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <Form onSubmit={handleSubmit}>
        <div className="flex items-start gap-4 mb-6">
          <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            {isDanger ? (
              <XCircle className={`w-6 h-6 ${iconColor}`} />
            ) : (
              <AlertTriangle className={`w-6 h-6 ${iconColor}`} />
            )}
          </div>
          <p className="text-neutral/70 pt-2">{message}</p>
        </div>
        <FormActions>
          <Button type="submit" variant={variant} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmText}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        </FormActions>
      </Form>
    </Modal>
  )
}