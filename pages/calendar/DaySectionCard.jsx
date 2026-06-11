// Glass card per category for the selected calendar day.
// Title row: icon + label. Body: list of items, OR a CTA when empty.

import { Plus, ArrowUpRight } from 'lucide-react'
import { Card } from '@/components/ui'

export default function DaySectionCard({
  icon: Icon,
  label,
  items = [],
  renderItem,
  emptyText,
  onAdd,
  onOpen,
}) {
  const isEmpty = items.length === 0

  return (
    <Card className="!p-md">
      <div className="flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-text">
            <Icon size={16} strokeWidth={1.75} />
          </span>
          <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
            {label}
          </span>
        </div>
        <div className="flex items-center gap-xs">
          {onAdd && (
            <button
              type="button"
              aria-label={`Add ${label}`}
              onClick={onAdd}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-ink hover:scale-105"
            >
              <Plus size={14} strokeWidth={2} />
            </button>
          )}
          {onOpen && (
            <button
              type="button"
              aria-label={`Open ${label}`}
              onClick={onOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full glass text-text hover:scale-105"
            >
              <ArrowUpRight size={14} strokeWidth={2} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-sm">
        {isEmpty ? (
          <p className="text-label italic text-muted">{emptyText}</p>
        ) : (
          <ul className="flex flex-col gap-xs">
            {items.map((item, index) => (
              <li key={item.id ?? index} className="text-body text-text">
                {renderItem(item)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  )
}
