// Seven day-circle checkboxes for a habit, current week (Mon → Sun).
// Layout per cell: weekday letter on top, circular checkbox below.
//
// Circle states:
//   - Done           coral fill + check icon
//   - Today, not done  coral border (2px)
//   - Past, not done   muted border
//   - Future           dimmed, disabled
//
// Outer button is 44×44 for the touch target; the visible circle is
// 36×36 inside it.

import { Check } from 'lucide-react'
import { getWeekDays, isToday, toIsoDate, startOfDay } from '@/utils/dateHelpers'

const WEEK_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function HabitWeekStrip({ habitId, completedDates, onToggle }) {
  const today = startOfDay(new Date())
  const days = getWeekDays(today)

  return (
    <div className="grid grid-cols-7 gap-xs">
      {days.map((day, index) => {
        const iso = toIsoDate(day)
        const isCompleted = completedDates?.has(iso) ?? false
        const isCurrent = isToday(day)
        const isFuture = startOfDay(day).getTime() > today.getTime()

        let circleClass =
          'flex h-9 w-9 items-center justify-center rounded-full transition '
        if (isCompleted && isCurrent) {
          circleClass += 'bg-accent text-accent-ink ring-2 ring-accent ring-offset-2 ring-offset-background'
        } else if (isCompleted) {
          circleClass += 'bg-accent text-accent-ink'
        } else if (isCurrent) {
          circleClass += 'border-2 border-accent text-accent'
        } else if (isFuture) {
          circleClass += 'border border-border text-muted opacity-40'
        } else {
          circleClass += 'border border-border text-muted'
        }

        const letterClass = `text-micro font-medium uppercase tracking-wider ${
          isCurrent && !isCompleted ? 'text-accent' : 'text-muted'
        }`

        return (
          <button
            key={iso}
            type="button"
            disabled={isFuture}
            aria-label={`${WEEK_LETTERS[index]} ${day.getDate()} — ${
              isCompleted ? 'done' : 'not done'
            }`}
            aria-pressed={isCompleted}
            onClick={() => onToggle(habitId, iso, !isCompleted)}
            className={`flex flex-col items-center justify-center gap-1 py-1 ${
              isFuture ? 'cursor-not-allowed' : 'active:scale-95'
            }`}
          >
            <span className={letterClass}>{WEEK_LETTERS[index]}</span>
            <span aria-hidden="true" className={circleClass}>
              {isCompleted ? (
                <Check size={14} strokeWidth={2.6} />
              ) : (
                <span className="text-micro">{day.getDate()}</span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
