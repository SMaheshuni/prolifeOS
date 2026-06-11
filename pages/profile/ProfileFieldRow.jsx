// Glass field row for the Profile page — label on the left, value on
// the right. Each row is its own micro-form: numbers commit on blur,
// selects commit instantly. Silent save with a tiny inline `saved`
// indicator that fades after 1.5 s.

import { useEffect, useRef, useState } from 'react'
import { Check } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'

const SAVED_INDICATOR_MS = 1500

const useSavedFlag = () => {
  const [isSaved, setIsSaved] = useState(false)
  const timerRef = useRef(null)
  const flag = () => {
    setIsSaved(true)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setIsSaved(false), SAVED_INDICATOR_MS)
  }
  useEffect(() => () => timerRef.current && clearTimeout(timerRef.current), [])
  return { isSaved, flag }
}

const SavedTag = ({ visible }) => (
  <span
    aria-hidden="true"
    className={`flex items-center gap-1 text-micro text-success transition-opacity duration-300 ${
      visible ? 'opacity-100' : 'opacity-0'
    }`}
  >
    <Check size={12} strokeWidth={2.4} />
    saved
  </span>
)

export function NumberRow({ label, value, suffix, placeholder = '—', onCommit }) {
  const [draft, setDraft] = useState(value ?? '')
  const { isSaved, flag } = useSavedFlag()

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  const handleBlur = async () => {
    const next = draft === '' ? null : Number(draft)
    if (next === (value ?? null)) return
    const result = await onCommit(next)
    if (result?.ok !== false) flag()
  }

  return (
    <div className="glass flex items-center gap-md rounded-md px-md py-sm">
      <span className="flex-1 text-label text-muted">{label}</span>
      <SavedTag visible={isSaved} />
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-20 bg-transparent text-right text-body text-text outline-none placeholder:text-muted"
      />
      {suffix && <span className="text-label text-muted">{suffix}</span>}
    </div>
  )
}

export function SelectRow({ label, value, options, onCommit }) {
  const [isOpen, setIsOpen] = useState(false)
  const { isSaved, flag } = useSavedFlag()

  const selected = options.find((o) => o.value === value)
  const displayLabel = selected?.label || '—'

  const handlePick = async (next) => {
    setIsOpen(false)
    if (next === value) return
    const result = await onCommit(next)
    if (result?.ok !== false) flag()
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="glass flex w-full items-center gap-md rounded-md px-md py-sm text-left transition active:scale-[0.99]"
      >
        <span className="flex-1 text-label text-muted">{label}</span>
        <SavedTag visible={isSaved} />
        <span className="text-body capitalize text-text">{displayLabel}</span>
      </button>

      <BottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} title={label}>
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
                  <span className="capitalize">{opt.label}</span>
                  {isSelected && <Check size={16} />}
                </button>
              </li>
            )
          })}
        </ul>
      </BottomSheet>
    </>
  )
}

// Compact vertical cell — label (with unit suffix in parens) on top,
// input below. Used inside paired rows where horizontal label+input
// doesn't fit on a phone width.
function StackedNumberCell({ label, value, suffix, placeholder = '—', onCommit }) {
  const [draft, setDraft] = useState(value ?? '')
  const { isSaved, flag } = useSavedFlag()

  useEffect(() => {
    setDraft(value ?? '')
  }, [value])

  const handleBlur = async () => {
    const next = draft === '' ? null : Number(draft)
    if (next === (value ?? null)) return
    const result = await onCommit(next)
    if (result?.ok !== false) flag()
  }

  return (
    <div className="glass flex flex-col gap-xs rounded-md px-md py-sm">
      <div className="flex items-center justify-between gap-sm">
        <span className="text-label text-muted">
          {label}
          {suffix && <span className="ml-1 text-muted/70">({suffix})</span>}
        </span>
        <SavedTag visible={isSaved} />
      </div>
      <input
        type="number"
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder}
        className="w-full bg-transparent text-body text-text outline-none placeholder:text-muted"
      />
    </div>
  )
}

export function PairedNumberRow({ left, right }) {
  return (
    <div className="grid grid-cols-2 gap-sm">
      <StackedNumberCell {...left} />
      <StackedNumberCell {...right} />
    </div>
  )
}
