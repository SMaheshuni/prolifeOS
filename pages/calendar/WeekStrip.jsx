// Horizontal week strip — 7 days as glass pills.
// Active day: coral fill. Today: tiny accent ring. Days with data: dot under number.

import { isToday, getWeekDays, toIsoDate } from '@/utils/dateHelpers'

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function WeekStrip({ anchor, selectedDate, onSelectDate, hasDataIsoSet }) {
  const days = getWeekDays(anchor)

  return (
    <div className="grid grid-cols-7 gap-xs">
      {days.map((day, index) => {
        const iso = toIsoDate(day)
        const isSelected = toIsoDate(selectedDate) === iso
        const isCurrent = isToday(day)
        const hasData = hasDataIsoSet?.has(iso)

        let cellClass = 'flex flex-col items-center gap-xs rounded-md py-sm transition '
        if (isSelected) cellClass += 'bg-accent text-accent-ink'
        else if (isCurrent) cellClass += 'border border-accent text-text'
        else cellClass += 'glass text-text hover:scale-[1.03]'

        return (
          <button
            key={iso}
            type="button"
            aria-label={day.toDateString()}
            aria-pressed={isSelected}
            onClick={() => onSelectDate(day)}
            className={cellClass}
          >
            <span
              className={`text-micro font-medium uppercase tracking-wider ${
                isSelected ? 'text-accent-ink/70' : 'text-muted'
              }`}
            >
              {WEEKDAY_LETTERS[index]}
            </span>
            <span className="font-display text-subheading font-medium leading-none">
              {day.getDate()}
            </span>
            <span className="h-1 w-1">
              {hasData && (
                <span
                  aria-hidden="true"
                  className={`block h-1 w-1 rounded-full ${
                    isSelected ? 'bg-accent-ink/60' : 'bg-accent'
                  }`}
                />
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
