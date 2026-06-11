// Habit row with title + week-of-day checkboxes. Tapping any day box
// toggles that day's log. Edit/Delete on the right.

import { Pencil, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui'
import HabitWeekStrip from './HabitWeekStrip'

export default function HabitItem({
  habit,
  completedDates,
  onToggle,
  onEdit,
  onDelete,
}) {
  return (
    <Card>
      <div className="flex flex-col gap-md">
        <div className="flex items-center gap-sm">
          <span className="flex-1 text-body text-text">{habit.title}</span>
          <button
            type="button"
            aria-label={`Edit ${habit.title}`}
            onClick={() => onEdit(habit)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition hover:bg-primary-light hover:text-text active:scale-95"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            aria-label={`Delete ${habit.title}`}
            onClick={() => onDelete(habit)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition hover:bg-danger-light hover:text-danger active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        </div>
        <HabitWeekStrip
          habitId={habit.id}
          completedDates={completedDates}
          onToggle={onToggle}
        />
      </div>
    </Card>
  )
}
