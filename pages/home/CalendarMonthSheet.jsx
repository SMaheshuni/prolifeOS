// Calendar month-grid sheet, opened from Home's TopBar pill. Owns its
// own month-anchor state so Home doesn't need to. Tapping a date is
// reported to the parent which decides where to navigate.

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import MonthGrid from '@/pages/calendar/MonthGrid'
import { formatMonthFull } from '@/utils/formatters'

export default function CalendarMonthSheet({
  isOpen,
  onClose,
  today,
  hasDataIsoSet,
  onPickDate,
}) {
  const [anchor, setAnchor] = useState(today)

  // Reset to today's month every time the sheet opens.
  useEffect(() => {
    if (isOpen) setAnchor(today)
  }, [isOpen, today])

  const goPrev = () =>
    setAnchor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
  const goNext = () =>
    setAnchor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
  const goToday = () => setAnchor(today)

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={formatMonthFull(anchor)}
    >
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between gap-sm">
          <button
            type="button"
            aria-label="Previous month"
            onClick={goPrev}
            className="flex h-11 w-11 items-center justify-center rounded-full glass text-text active:scale-95"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="rounded-full glass px-md py-1 text-label text-text active:scale-[0.97] transition"
          >
            Today
          </button>
          <button
            type="button"
            aria-label="Next month"
            onClick={goNext}
            className="flex h-11 w-11 items-center justify-center rounded-full glass text-text active:scale-95"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <MonthGrid
          anchor={anchor}
          selectedDate={today}
          onSelectDate={onPickDate}
          hasDataIsoSet={hasDataIsoSet}
        />
      </div>
    </BottomSheet>
  )
}
