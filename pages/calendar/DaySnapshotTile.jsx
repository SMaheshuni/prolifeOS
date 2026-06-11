// Slim snapshot tile for the day's headline metrics — Check-in, Calories.
// Tappable card; falls back to a coral "+ {ctaLabel}" line when empty.

import { Card } from '@/components/ui'

export default function DaySnapshotTile({
  icon: Icon,
  label,
  value,
  emptyCta,
  onClick,
}) {
  const hasValue = value !== null && value !== undefined && value !== ''

  return (
    <Card onClick={onClick} className="!p-md flex-1">
      <div className="flex items-center gap-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-text">
          <Icon size={16} strokeWidth={1.75} />
        </span>
        <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
          {label}
        </span>
      </div>
      <div className="mt-sm">
        {hasValue ? (
          <span className="font-display text-heading font-bold text-text leading-none">
            {value}
          </span>
        ) : (
          <span className="text-label text-accent">+ {emptyCta}</span>
        )}
      </div>
    </Card>
  )
}
