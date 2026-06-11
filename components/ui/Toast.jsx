import { CheckCircle2, AlertTriangle } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

const VARIANT_STYLES = {
  success: 'bg-success-light text-success',
  error: 'bg-danger-light text-danger',
}

export default function Toast() {
  const toasts = useToastStore((state) => state.toasts)

  if (!toasts.length) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 top-md z-toast flex flex-col items-center gap-sm px-md">
      {toasts.map((toast) => {
        const Icon = toast.type === 'error' ? AlertTriangle : CheckCircle2
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-sm rounded-md px-md py-sm text-label font-medium shadow-md animate-toast-in ${VARIANT_STYLES[toast.type] || VARIANT_STYLES.success}`}
          >
            <Icon size={18} />
            <span>{toast.message}</span>
          </div>
        )
      })}
    </div>
  )
}
