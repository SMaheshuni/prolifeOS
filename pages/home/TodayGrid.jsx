// Bento grid for Home's "today" domain summaries — check-in, activity,
// habits, tasks. Each tile is a tappable button with icon + eyebrow +
// punchy primary value + small secondary line. 2-column grid on mobile;
// each tile owns its own visual real-estate so domains read as peers
// instead of nested rows.

const Tile = ({
  icon: Icon,
  label,
  primary,
  secondary,
  visual,
  onClick,
  active = false,
  ariaLabel,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={ariaLabel || label}
    className={`flex h-24 w-full flex-col justify-between gap-xs rounded-lg p-md text-left transition active:scale-[0.99] ${
      active
        ? 'bg-accent-light text-accent'
        : 'glass text-text hover:bg-primary-light/40'
    }`}
  >
    <span className="flex items-center gap-xs">
      <Icon
        size={16}
        strokeWidth={1.75}
        className={active ? 'text-accent' : 'text-muted'}
      />
      <span
        className={`text-micro font-medium uppercase tracking-[0.16em] ${
          active ? 'text-accent' : 'text-muted'
        }`}
      >
        {label}
      </span>
    </span>
    {visual ? (
      <div className="flex flex-col gap-xs">
        {visual}
        <span
          className={`truncate text-micro capitalize ${
            active ? 'text-accent' : 'text-muted'
          }`}
        >
          {primary}
        </span>
      </div>
    ) : (
      <div className="flex flex-col gap-0.5">
        <span
          className={`truncate font-display text-subheading font-bold leading-none ${
            active ? 'text-accent' : 'text-text'
          }`}
        >
          {primary}
        </span>
        {secondary && (
          <span
            className={`truncate text-micro capitalize ${
              active ? 'text-accent' : 'text-muted'
            }`}
          >
            {secondary}
          </span>
        )}
      </div>
    )}
  </button>
)

export default function TodayGrid({ items = [] }) {
  return (
    <div className="grid grid-cols-2 gap-sm">
      {items.map((item) => (
        <Tile key={item.label} {...item} />
      ))}
    </div>
  )
}
