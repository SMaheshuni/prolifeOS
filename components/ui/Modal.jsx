import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import Button from './Button'

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'primary',
  isLoading = false,
}) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-modal flex items-center justify-center p-md">
      <div
        className="absolute inset-0 bg-text/30 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-sm rounded-lg glass-solid p-lg animate-scale-in">
        <div className="flex items-start justify-between gap-md">
          <h2 className="font-display text-heading font-bold text-text">{title}</h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="-mr-xs -mt-xs rounded-full p-xs text-muted hover:bg-primary-light"
          >
            <X size={18} />
          </button>
        </div>
        {description && <p className="mt-sm text-body text-muted">{description}</p>}
        <div className="mt-lg flex flex-col gap-sm">
          {onConfirm && (
            <Button variant={variant} onClick={onConfirm} isLoading={isLoading} fullWidth>
              {confirmLabel}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} fullWidth>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  )
}
