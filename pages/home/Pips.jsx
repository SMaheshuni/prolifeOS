// Segmented progress indicator — N pips, K filled. Used in the Home
// bento tiles for habit and task progress so status reads at a glance.

export default function Pips({ total, done, active = false }) {
  if (total <= 0) return null
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`h-1.5 flex-1 rounded-full ${
            i < done
              ? active
                ? 'bg-accent'
                : 'bg-accent'
              : active
                ? 'bg-accent/30'
                : 'bg-border'
          }`}
        />
      ))}
    </div>
  )
}
