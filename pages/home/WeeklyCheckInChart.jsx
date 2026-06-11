// Minimal 7-day weight line graph for Home. Eyebrow + latest weight on
// top, line graph below. No mood strip, no day labels, no min/max
// labels — that detail lives on the Charts page; Home just shows the
// trend at a glance.

import { useMemo } from 'react'
import { useCheckin } from '@/pages/checkin/checkin.hooks'
import { toIsoDate } from '@/utils/dateHelpers'

const buildDays = (checkins) => {
  const today = new Date()
  const days = []
  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(today)
    d.setDate(today.getDate() - offset)
    const iso = toIsoDate(d)
    const entry = checkins.find((c) => c.date === iso) || null
    days.push({
      iso,
      isToday: offset === 0,
      weight: entry?.weight ?? null,
      unit: entry?.weight_unit || 'kg',
    })
  }
  return days
}

const VIEW_W = 280
const VIEW_H = 64
const PAD_X = 8
const PAD_Y = 8

export default function WeeklyCheckInChart() {
  const { checkins, isLoading } = useCheckin()

  const { points, latestWeight, latestUnit } = useMemo(() => {
    const days = buildDays(checkins)
    const weighted = days
      .map((d, i) => ({ ...d, idx: i }))
      .filter((d) => d.weight !== null && d.weight !== undefined)
    const min = weighted.length ? Math.min(...weighted.map((d) => d.weight)) : 0
    const max = weighted.length ? Math.max(...weighted.map((d) => d.weight)) : 0
    const range = max - min || 1
    const stepX = (VIEW_W - PAD_X * 2) / 6
    const points = weighted.map((d) => {
      const x = PAD_X + d.idx * stepX
      const norm = max === min ? 0.5 : (d.weight - min) / range
      const y = PAD_Y + (1 - norm) * (VIEW_H - PAD_Y * 2)
      return { x, y, weight: d.weight, isToday: d.isToday }
    })
    const latest = weighted.slice(-1)[0]
    return {
      points,
      latestWeight: latest?.weight ?? null,
      latestUnit: latest?.unit || 'kg',
    }
  }, [checkins])

  if (isLoading) return null

  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ')

  return (
    <div className="glass rounded-lg p-md">
      <div className="flex items-baseline justify-between">
        <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
          last 7 days
        </span>
        {latestWeight !== null && (
          <span className="font-display text-subheading font-medium text-text leading-none">
            {latestWeight}
            <span className="text-micro font-medium text-muted ml-1">{latestUnit}</span>
          </span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-sm h-16 w-full"
        preserveAspectRatio="none"
        aria-label="weight last 7 days"
      >
        {points.length >= 2 && (
          <path
            d={linePath}
            fill="none"
            stroke="var(--lifeos-color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={p.isToday ? 4 : 3}
            fill="var(--lifeos-color-accent)"
            stroke="var(--lifeos-color-background)"
            strokeWidth={p.isToday ? 2 : 1}
          />
        ))}

        {points.length === 0 && (
          <text
            x={VIEW_W / 2}
            y={VIEW_H / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="var(--lifeos-color-muted)"
            fontSize="11"
          >
            no weight logged yet
          </text>
        )}
      </svg>
    </div>
  )
}
