import { toIsoDate } from '@/utils/dateHelpers'

export default function DatePicker({ id, label, value, onChange, error, required = false, disabled = false }) {
  const borderClass = error ? 'border-danger' : 'border-border focus:border-primary'
  const isoValue = value ? toIsoDate(value) : ''

  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label htmlFor={id} className="text-label font-medium text-text">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <input
        id={id}
        type="date"
        value={isoValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`h-11 w-full rounded-md border bg-surface px-md text-body text-text outline-none transition disabled:opacity-50 ${borderClass}`}
      />
      {error && <p className="text-label text-danger">{error}</p>}
    </div>
  )
}
