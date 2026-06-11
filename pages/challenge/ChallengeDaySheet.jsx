// Bottom sheet for editing a single challenge day. One toggle per rule.
// Auto-saves on every toggle (per LifeOS form rule: toggles save inline)
// so there's no Save button — close to dismiss.

import {
  Flame,
  Utensils,
  Activity as ActivityIcon,
  Brain,
  Droplet,
  Camera,
} from 'lucide-react'
import { BottomSheet, Toggle } from '@/components/ui'
import { CHALLENGE_RULES } from '@/utils/constants'
import { getRulesCompleted } from './challenge.service'
import { formatDate } from '@/utils/formatters'

const RULE_ICONS = {
  clean_day: Utensils,
  activity: ActivityIcon,
  deep_work: Brain,
  hydration: Droplet,
  daily_proof: Camera,
}

const TOTAL_RULES = CHALLENGE_RULES.length

export default function ChallengeDaySheet({ day, isOpen, onClose, onToggleRule }) {
  if (!day) return null
  const rulesDone = getRulesCompleted(day)
  const score = rulesDone.length

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={`Day ${day.day_number}`}
    >
      <div className="flex flex-col gap-md">
        <div className="flex items-center justify-between gap-md">
          <span className="text-micro text-muted">{formatDate(day.date)}</span>
          <span className="inline-flex items-center gap-xs text-label text-text">
            <Flame size={14} className="text-warning" />
            <span className="font-display font-medium">
              {score} / {TOTAL_RULES}
            </span>
          </span>
        </div>

        <ul className="flex flex-col gap-sm">
          {CHALLENGE_RULES.map((rule) => {
            const Icon = RULE_ICONS[rule.id] || Flame
            const checked = rulesDone.includes(rule.id)
            return (
              <li
                key={rule.id}
                className="glass flex items-center gap-md rounded-md px-md py-sm"
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    checked ? 'bg-success text-white' : 'bg-primary-light text-text'
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-label font-medium text-text">{rule.title}</span>
                  <span className="text-micro text-muted">{rule.description}</span>
                </div>
                <Toggle
                  checked={checked}
                  onChange={(next) => onToggleRule(day.id, rule.id, next)}
                />
              </li>
            )
          })}
        </ul>
      </div>
    </BottomSheet>
  )
}
