import { Inbox } from 'lucide-react'
import Button from './Button'

export default function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-md rounded-lg border border-dashed border-border bg-surface p-xl text-center">
      <Icon size={32} className="text-muted" />
      <div className="flex flex-col gap-xs">
        <h3 className="text-subheading font-medium text-text">{title}</h3>
        {description && <p className="text-body text-muted">{description}</p>}
      </div>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
