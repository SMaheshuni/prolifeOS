// Apple-Watch-style month grid. 7 cols × 6 rows, day numbers, today highlighted,
// days with any data marked with a tiny dot. Tap a cell to select it.

import { isToday, toIsoDate } from '@/utils/dateHelpers'

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Returns the Monday at or before the 1st of the month, then 41 more days,
// to fill a 6×7 grid that always covers the month.
const buildMonthCells = (anchor) => {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1)
  const dayOfWeek = first.getDay() // 0 = Sun, 1 = Mon, ...
  const offsetToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const start = new Date(year, month, 1 - offsetToMonday)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function MonthGrid({ anchor, selectedDate, onSelectDate, hasDataIsoSet }) {
  const cells = buildMonthCells(anchor)
  const month = anchor.getMonth()

  return (
    <div className="flex flex-col gap-sm">
      <div className="grid grid-cols-7 gap-xs px-xs">
        {WEEKDAY_LETTERS.map((letter, i) => (
          <span
            key={i}
            className="text-center text-micro font-medium uppercase tracking-wider text-muted"
          >
            {letter}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-xs">
        {cells.map((day) => {
          const iso = toIsoDate(day)
          const inMonth = day.getMonth() === month
          const isSelected = toIsoDate(selectedDate) === iso
          const isCurrent = isToday(day)
          const hasData = hasDataIsoSet?.has(iso)

          let className = 'flex aspect-square items-center justify-center rounded-full text-label transition relative '
          if (isSelected) {
            className += 'bg-accent text-accent-ink font-medium'
          } else if (isCurrent) {
            className += 'border border-accent text-accent font-medium'
          } else if (inMonth) {
            className += 'text-text hover:bg-primary-light'
          } else {
            className += 'text-muted/50 hover:bg-primary-light'
          }

          return (
            <button
              key={iso}
              type="button"
              aria-label={day.toDateString()}
              aria-pressed={isSelected}
              onClick={() => onSelectDate(day)}
              className={className}
            >
              <span>{day.getDate()}</span>
              {hasData && (
                <span
                  aria-hidden="true"
                  className={`absolute bottom-1 h-1 w-1 rounded-full ${
                    isSelected ? 'bg-accent-ink/60' : 'bg-accent'
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
