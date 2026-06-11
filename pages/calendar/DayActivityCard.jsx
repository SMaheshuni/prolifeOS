// Activity card for a calendar day, showing each logged session.
// Slim glass row per session: type + duration + calories. Tap to edit
// (BottomSheet from caller), tap trash to delete. Mirrors DayMealsCard.

import { Plus, Pencil, Trash2, Activity as ActivityIcon } from 'lucide-react'
import { Card } from '@/components/ui'
import { formatDuration, titleCase } from '@/utils/formatters'

export default function DayActivityCard({
  activities = [],
  onAdd,
  onEdit,
  onDelete,
}) {
  const totalKcal = activities.reduce(
    (sum, a) => sum + (Number(a.calories) || 0),
    0
  )

  return (
    <Card>
      <div className="flex items-center justify-between gap-md">
        <div className="flex items-center gap-sm">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-text">
            <ActivityIcon size={16} strokeWidth={1.75} />
          </span>
          <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
            Activity
          </span>
          {totalKcal > 0 && (
            <span className="text-micro text-muted">· {totalKcal} kcal</span>
          )}
        </div>
        <button
          type="button"
          aria-label="Add activity"
          onClick={onAdd}
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-text active:scale-95"
        >
          <Plus size={18} strokeWidth={2} />
        </button>
      </div>

      <ul className="mt-sm flex flex-col gap-xs">
        {activities.map((entry) => (
          <li
            key={entry.id}
            className="flex items-center justify-between gap-sm"
          >
            <button
              type="button"
              onClick={() => onEdit?.(entry)}
              className="flex flex-1 flex-col items-start gap-0.5 text-left active:opacity-70"
            >
              <span className="text-body text-text capitalize">{entry.type}</span>
              <span className="text-micro text-muted">
                {formatDuration(entry.duration_minutes)}
                {entry.calories ? ` · ${entry.calories} kcal` : ''}
              </span>
            </button>
            <button
              type="button"
              aria-label="Edit"
              onClick={() => onEdit?.(entry)}
              className="flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-primary-light hover:text-text"
            >
              <Pencil size={16} />
            </button>
            <button
              type="button"
              aria-label="Delete"
              onClick={() => onDelete?.(entry)}
              className="flex h-11 w-11 items-center justify-center rounded-md text-danger hover:bg-danger-light"
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>
    </Card>
  )
}
