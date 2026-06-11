// Status filter chips with counts — All / To do / In progress / Done.
// Coral fill when active; glass-bordered pill when inactive. Counts
// appended in parentheses.

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'todo', label: 'To do' },
  { id: 'in_progress', label: 'In progress' },
  { id: 'done', label: 'Done' },
]

export default function TaskFilterChips({ counts = {}, active, onChange }) {
  return (
    <div className="flex flex-wrap items-center gap-xs">
      {FILTERS.map((filter) => {
        const isActive = filter.id === active
        const count = counts[filter.id] ?? 0
        return (
          <button
            key={filter.id}
            type="button"
            onClick={() => onChange(filter.id)}
            className={`flex items-center gap-1 rounded-full px-md py-xs text-label transition active:scale-[0.97] ${
              isActive
                ? 'bg-accent text-accent-ink'
                : 'glass text-muted hover:text-text'
            }`}
          >
            <span>{filter.label}</span>
            <span
              className={`text-micro ${
                isActive ? 'text-accent-ink/80' : 'text-muted'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export const TASK_FILTER_IDS = FILTERS.map((f) => f.id)
