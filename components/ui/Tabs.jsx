export default function Tabs({ tabs, activeId, onChange }) {
  return (
    <div className="flex items-center gap-xs rounded-md bg-background p-xs">
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        const className = isActive
          ? 'bg-surface text-text shadow-sm'
          : 'text-muted hover:text-text'
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex-1 rounded-md px-md py-sm text-label font-medium transition ${className}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
