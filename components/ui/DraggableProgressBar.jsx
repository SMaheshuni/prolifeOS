// Draggable progress bar — replaces +/- buttons on goals.
// Tap or drag along the track to set the value; the fill, handle, and
// readout follow your finger. On release, the final value is committed.
//
// Touch + mouse via Pointer Events. Snaps to integer steps. Emits
// onChange continuously while dragging (for live readout) and onCommit
// once on release (so the caller can persist).

import { useRef, useState } from 'react'

export default function DraggableProgressBar({
  value = 0,
  max = 100,
  unit = '',
  label = 'Progress',
  onChange,
  onCommit,
  disabled = false,
}) {
  const trackRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [draftValue, setDraftValue] = useState(null)

  const displayValue = draftValue ?? value
  const fraction =
    max > 0 ? Math.max(0, Math.min(1, displayValue / max)) : 0
  const pct = fraction * 100

  const valueFromClientX = (clientX) => {
    if (!trackRef.current) return value
    const rect = trackRef.current.getBoundingClientRect()
    const f = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    return Math.round(f * max)
  }

  const handlePointerDown = (event) => {
    if (disabled) return
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDragging(true)
    const next = valueFromClientX(event.clientX)
    setDraftValue(next)
    onChange?.(next)
  }

  const handlePointerMove = (event) => {
    if (!isDragging) return
    const next = valueFromClientX(event.clientX)
    setDraftValue(next)
    onChange?.(next)
  }

  const handlePointerUp = (event) => {
    if (!isDragging) return
    event.currentTarget.releasePointerCapture(event.pointerId)
    setIsDragging(false)
    if (draftValue !== null) {
      onCommit?.(draftValue)
      setDraftValue(null)
    }
  }

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-baseline justify-between text-label">
        <span className="text-muted">{label}</span>
        <span className="font-medium text-text">
          {displayValue}
          <span className="text-muted">/{max}</span>
          {unit && <span className="ml-1 text-muted">{unit}</span>}
        </span>
      </div>

      <div
        ref={trackRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        role="slider"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={displayValue}
        aria-label={`${label} slider`}
        tabIndex={disabled ? -1 : 0}
        className={`relative h-3 w-full select-none touch-none rounded-full bg-border ${
          disabled ? 'opacity-50' : 'cursor-pointer'
        }`}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 rounded-full bg-accent ${
            isDragging ? '' : 'transition-[width] duration-200'
          }`}
          style={{ width: `${pct}%` }}
        />
        <div
          aria-hidden="true"
          className={`absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-background ${
            isDragging ? 'scale-125' : 'transition-[left] duration-200'
          }`}
          style={{ left: `${pct}%` }}
        />
      </div>

      <span className="text-micro text-muted">
        {disabled ? 'Goal complete' : 'Drag to update'}
      </span>
    </div>
  )
}
