// Slide-up sheet — flex column with sticky header and (optional) sticky
// footer. The middle scrolls. Pass `footer` to keep action buttons
// pinned at the bottom while content scrolls above.
//
// Rendered via a portal to document.body so it escapes any parent
// stacking context (the AppShell outlet wrapper sets its own z-index,
// which would otherwise trap the sheet below the BottomNav).

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export default function BottomSheet({ isOpen, onClose, title, children, footer }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div className="fixed inset-0 z-bottom-sheet">
      <div
        className="absolute inset-0 bg-text/30 animate-fade-in backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88vh] flex-col rounded-t-xl glass-solid animate-slide-up">
        <div className="shrink-0 px-md pt-md">
          <div className="mx-auto mb-sm h-1 w-10 rounded-full bg-border" aria-hidden="true" />
          <div className="flex items-center justify-between gap-md">
            {title ? (
              <h2 className="font-display text-heading font-bold text-text leading-[1.1]">{title}</h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="-mr-xs flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-text"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-md py-md">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-border bg-surface-solid px-md py-md safe-bottom">
            {footer}
          </div>
        ) : (
          <div className="shrink-0 safe-bottom" aria-hidden="true" />
        )}
      </div>
    </div>,
    document.body
  )
}
