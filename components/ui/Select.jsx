// Select that visually matches Input — same height, border, focus state.
// Tapping opens a BottomSheet with the option list (iOS/Android/desktop
// all look identical). Native <select> has been replaced because its
// system pickers don't match the rest of the UI.

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import BottomSheet from './BottomSheet'

export default function Select({
  id,
  label,
  value,
  onChange,
  options,
  error,
  required = false,
  disabled = false,
  placeholder = 'Select…',
}) {
  const [isOpen, setIsOpen] = useState(false)

  const selected = options.find((opt) => opt.value === value)
  const displayLabel = selected?.label ?? placeholder

  const borderClass = error
    ? 'border-danger'
    : isOpen
      ? 'border-accent ring-2 ring-accent/40'
      : 'border-border'

  const handlePick = (next) => {
    onChange(next)
    setIsOpen(false)
  }

  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label htmlFor={id} className="text-micro font-medium uppercase tracking-[0.16em] text-muted">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(true)}
        disabled={disabled}
        className={`flex h-12 w-full items-center justify-between gap-sm rounded-md border bg-surface px-md text-body outline-none transition disabled:opacity-50 ${borderClass} ${
          selected ? 'text-text' : 'text-muted'
        }`}
      >
        <span className="truncate text-left">{displayLabel}</span>
        <ChevronDown size={16} className="shrink-0 text-muted" />
      </button>
      {error && <p className="text-label text-danger">{error}</p>}

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={label || 'Choose'}>
        <ul className="flex flex-col gap-xs">
          {options.map((opt) => {
            const isSelected = opt.value === value
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handlePick(opt.value)}
                  className={`flex w-full items-center justify-between gap-md rounded-md px-md py-md text-body transition active:scale-[0.99] ${
                    isSelected
                      ? 'bg-accent text-accent-ink'
                      : 'text-text hover:bg-primary-light'
                  }`}
                >
                  <span className="text-left">{opt.label}</span>
                  {isSelected && <Check size={16} />}
                </button>
              </li>
            )
          })}
        </ul>
      </BottomSheet>
    </div>
  )
}
