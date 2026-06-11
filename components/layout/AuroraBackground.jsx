// Three colored orbs that drift slowly behind every screen. Live in z-aurora (0)
// so glass surfaces above them blur and saturate the colors. Colors come from
// CSS variables; light/dark differ. Animations defined in tailwind.config.js.

const Orb = ({ className, animation, style }) => (
  <div
    aria-hidden="true"
    className={`absolute rounded-full blur-3xl will-change-transform ${animation} ${className}`}
    style={style}
  />
)

export default function AuroraBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-aurora overflow-hidden">
      <Orb
        animation="animate-orb-1"
        className="h-[60vw] w-[60vw] -left-[10vw] -top-[10vw]"
        style={{ backgroundColor: 'var(--lifeos-orb-1)', opacity: 'var(--lifeos-orb-1-alpha)' }}
      />
      <Orb
        animation="animate-orb-2"
        className="h-[55vw] w-[55vw] -right-[12vw] top-[10vh]"
        style={{ backgroundColor: 'var(--lifeos-orb-2)', opacity: 'var(--lifeos-orb-2-alpha)' }}
      />
      <Orb
        animation="animate-orb-3"
        className="h-[70vw] w-[70vw] left-[5vw] top-[55vh]"
        style={{ backgroundColor: 'var(--lifeos-orb-3)', opacity: 'var(--lifeos-orb-3-alpha)' }}
      />
    </div>
  )
}
