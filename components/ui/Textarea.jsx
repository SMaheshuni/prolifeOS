export default function Textarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  disabled = false,
  rows = 4,
}) {
  const borderClass = error
    ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/30'
    : 'border-border focus:border-accent focus:ring-2 focus:ring-accent/40'

  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <label htmlFor={id} className="text-micro font-medium uppercase tracking-[0.16em] text-muted">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <textarea
        id={id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full rounded-md border bg-surface p-md text-body text-text outline-none transition placeholder:text-muted disabled:opacity-50 ${borderClass}`}
      />
      {error && <p className="text-label text-danger">{error}</p>}
    </div>
  )
}
