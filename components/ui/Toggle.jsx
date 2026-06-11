export default function Toggle({ checked, onChange, label, disabled = false }) {
  const trackClass = checked ? 'bg-accent' : 'bg-border'
  const thumbClass = checked ? 'translate-x-5' : 'translate-x-0'

  return (
    <label className="flex cursor-pointer items-center justify-between gap-md">
      {label && <span className="text-body text-text">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${trackClass}`}
      >
        <span
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-surface-solid shadow-sm transition ${thumbClass}`}
        />
      </button>
    </label>
  )
}
