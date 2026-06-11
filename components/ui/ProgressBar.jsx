export default function ProgressBar({ value = 0, max = 100, label }) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div className="flex flex-col gap-xs">
      {label && (
        <div className="flex items-center justify-between text-label text-muted">
          <span>{label}</span>
          <span className="font-medium text-text">
            {Math.round(value)}/{max}
          </span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-background">
        <div
          className="h-full rounded-full bg-primary transition-[width]"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
