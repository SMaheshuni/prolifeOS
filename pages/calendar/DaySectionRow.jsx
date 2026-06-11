// Slim section row for a calendar day — design-locked. Glass row with
// icon + label + summary text on the left, "+ Add" pill on the right.
// Used when the section has nothing logged for the day.

import { Plus } from 'lucide-react'

export default function DaySectionRow({
  icon: Icon,
  label,
  summary,
  onAdd,
}) {
  return (
    <div className="glass flex items-center gap-md rounded-md px-md py-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-text">
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-label font-medium text-text">{label}</span>
        <span className="text-micro text-muted">{summary}</span>
      </div>
      {onAdd && (
        <button
          type="button"
          aria-label={`Add ${label}`}
          onClick={onAdd}
          className="flex items-center gap-1 rounded-full bg-accent px-md py-1 text-label text-accent-ink active:scale-[0.97] transition"
        >
          <Plus size={14} strokeWidth={2} />
          <span>Add</span>
        </button>
      )}
    </div>
  )
}
