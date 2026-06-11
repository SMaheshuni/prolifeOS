import { useMemo, useState } from 'react'
import AnimatedNumber from './AnimatedNumber'

const SIZE = 208
const STROKE = 14
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP_PX = 4

// Coral accent at varying opacities so segments read as distinct meals
// while keeping brand cohesion.
const SEGMENT_OPACITIES = {
  breakfast: 1,
  lunch: 0.85,
  dinner: 0.7,
  snack: 0.55,
}

const METRICS = ['remaining', 'eaten', 'burned']

export default function CalorieRing({ goal, eaten = 0, burned = 0, segments = [] }) {
  const [metric, setMetric] = useState('remaining')
  const [pulse, setPulse] = useState(false)

  const remaining = goal ? Math.max(0, goal - eaten) : null
  const consumed = goal ? Math.min(eaten, goal) : eaten
  const fraction = goal && goal > 0 ? Math.max(0, Math.min(1, consumed / goal)) : 0

  const arcSegments = useMemo(() => {
    if (!goal || goal <= 0) return []
    const totalEatenWithSegs = segments.reduce((s, x) => s + x.calories, 0)
    if (totalEatenWithSegs <= 0) return []
    const filledLength = CIRCUMFERENCE * fraction
    let cursor = 0
    return segments.map((seg) => {
      const portion = seg.calories / totalEatenWithSegs
      const length = Math.max(0, filledLength * portion - GAP_PX)
      const offset = -cursor
      cursor += filledLength * portion
      return {
        type: seg.type,
        length,
        offset,
        opacity: SEGMENT_OPACITIES[seg.type] ?? 0.7,
      }
    })
  }, [segments, fraction])

  const dashOffset = CIRCUMFERENCE * (1 - fraction)
  const showSegments = arcSegments.length > 0

  const value =
    metric === 'remaining'
      ? goal !== null
        ? remaining
        : eaten
      : metric === 'eaten'
        ? eaten
        : burned

  const handleCycle = () => {
    setPulse(true)
    setTimeout(() => setPulse(false), 320)
    setMetric((m) => METRICS[(METRICS.indexOf(m) + 1) % METRICS.length])
  }

  return (
    <div className="flex flex-col items-center gap-md">
      <button
        type="button"
        onClick={handleCycle}
        aria-label={`Calorie ring — showing ${metric}, tap to cycle`}
        className={`relative h-52 w-52 rounded-full transition-transform duration-300 ${
          pulse ? 'scale-[1.04]' : 'scale-100'
        }`}
      >
        <svg width={SIZE} height={SIZE} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke="var(--lifeos-color-border)"
            strokeWidth={STROKE}
            fill="none"
          />

          {showSegments ? (
            arcSegments.map((seg, i) => (
              <circle
                key={`${seg.type}-${i}`}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke="var(--lifeos-color-accent)"
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={`${seg.length} ${CIRCUMFERENCE}`}
                strokeDashoffset={seg.offset}
                strokeLinecap="round"
                opacity={seg.opacity}
                style={{
                  transition:
                    'stroke-dasharray 700ms cubic-bezier(0.32,0.72,0,1), stroke-dashoffset 700ms cubic-bezier(0.32,0.72,0,1), opacity 300ms',
                }}
              />
            ))
          ) : (
            <circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke="var(--lifeos-color-accent)"
              strokeWidth={STROKE}
              fill="none"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              style={{
                transition: 'stroke-dashoffset 700ms cubic-bezier(0.32, 0.72, 0, 1)',
              }}
            />
          )}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-micro font-medium uppercase tracking-[0.22em] text-muted">
            {metric}
          </span>
          <span className="font-display text-display font-bold text-text leading-none mt-xs">
            <AnimatedNumber value={value} />
          </span>
          <span className="text-micro text-muted mt-xs">kcal</span>
          <span className="mt-sm flex items-center gap-1.5">
            {METRICS.map((m) => (
              <span
                key={m}
                aria-hidden="true"
                className={`h-1 w-1 rounded-full transition-all ${
                  m === metric ? 'bg-accent w-3' : 'bg-border'
                }`}
              />
            ))}
          </span>
        </div>
      </button>
    </div>
  )
}
