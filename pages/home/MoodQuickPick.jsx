// Tiny popover that opens when the mascot is tapped. Lets the user set
// today's mood in one tap without opening the full check-in sheet.
// Anchored as an absolutely-positioned card beneath the mascot; parent
// owns the open/close state via a wrapping `relative` container.

import { useEffect, useRef } from 'react'
import { MOOD_ORDER, MOOD_BG } from './mood'

export default function MoodQuickPick({ isOpen, selected, onPick, onClose }) {
  const ref = useRef(null)

  // Dismiss on outside click + escape — popover is non-modal, never traps.
  useEffect(() => {
    if (!isOpen) return
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose?.()
    }
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('mousedown', onDown)
    window.addEventListener('touchstart', onDown, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('touchstart', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Quick mood"
      className="absolute right-0 top-full z-[60] mt-xs glass rounded-lg p-sm shadow-lg"
    >
      <div className="flex items-center gap-xs">
        {MOOD_ORDER.map((option) => {
          const isActive = option === selected
          return (
            <button
              key={option}
              type="button"
              onClick={() => onPick(option)}
              aria-label={option}
              className={`flex flex-col items-center gap-0.5 rounded-md px-1.5 py-1 transition active:scale-95 ${
                isActive ? 'bg-surface' : 'hover:bg-surface/60'
              }`}
            >
              <span
                aria-hidden="true"
                className={`block h-3 w-3 rounded-full ${MOOD_BG[option]}`}
              />
              <span className="text-[10px] capitalize text-muted">
                {option}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
