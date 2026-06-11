// Rule legend + frequency tracker. Doubles as the pip decoder beneath
// the day grid (icons appear left-to-right in the same order as pips)
// and as a "where you're consistent" view so the user can see at a
// glance which rules they hit most. Observational only — no shaming
// of low-count rules.

import {
  Flame,
  Utensils,
  Activity as ActivityIcon,
  Brain,
  Droplet,
  Camera,
} from 'lucide-react'
import { CHALLENGE_RULES } from '@/utils/constants'
import { getRulesCompleted } from './challenge.service'

const RULE_ICONS = {
  clean_day: Utensils,
  activity: ActivityIcon,
  deep_work: Brain,
  hydration: Droplet,
  daily_proof: Camera,
}

export default function RuleFrequencyList({ days, totalDays }) {
  return (
    <ul className="flex flex-col gap-sm">
      {CHALLENGE_RULES.map((rule) => {
        const Icon = RULE_ICONS[rule.id] || Flame
        const count = days.filter((d) => getRulesCompleted(d).includes(rule.id)).length
        const pct = totalDays > 0 ? Math.min(1, count / totalDays) : 0
        return (
          <li
            key={rule.id}
            className="glass flex items-center gap-md rounded-md px-md py-sm"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-text">
              <Icon size={16} strokeWidth={1.75} />
            </span>
            <div className="flex flex-1 flex-col gap-1">
              <div className="flex items-baseline justify-between gap-md">
                <span className="text-label font-medium text-text">{rule.title}</span>
                <span className="text-micro text-muted tabular-nums">
                  {count} / {totalDays}
                </span>
              </div>
              <div
                className="h-1 w-full overflow-hidden rounded-full bg-border/40"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-accent transition-all"
                  style={{ width: `${pct * 100}%` }}
                />
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
