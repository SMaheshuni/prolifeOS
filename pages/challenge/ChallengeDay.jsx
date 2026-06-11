// One tile in the challenge day grid. Shows the day number above five
// tiny pips, one per rule. Filled pips = rules logged that day. Color
// state distinguishes future / today / past and perfect / partial / missed
// so the user can read their score at a glance without opening the sheet.

import { isToday } from '@/utils/dateHelpers'
import { CHALLENGE_RULES } from '@/utils/constants'
import { getRulesCompleted } from './challenge.service'

const TOTAL_RULES = CHALLENGE_RULES.length

export default function ChallengeDay({ day, onTap }) {
  const startOfToday = new Date(new Date().setHours(0, 0, 0, 0))
  const dayDate = new Date(day.date)
  const isPast = dayDate < startOfToday
  const today = isToday(day.date)
  const isFuture = !today && !isPast

  const rulesDone = getRulesCompleted(day)
  const score = rulesDone.length
  const isPerfect = score === TOTAL_RULES

  let tileClass = 'flex h-12 w-full flex-col items-center justify-center gap-0.5 rounded-md text-[11px] font-medium leading-none transition'
  let pipFilled = 'bg-current'
  let pipEmpty = 'bg-current/25'
  if (isFuture) {
    tileClass += ' border border-border text-muted opacity-50 cursor-not-allowed'
  } else if (isPerfect) {
    tileClass += ' bg-success text-white active:scale-[0.97]'
    pipFilled = 'bg-white'
    pipEmpty = 'bg-white/40'
  } else if (today) {
    tileClass += ' border-2 border-primary text-primary active:scale-[0.97]'
  } else if (score > 0) {
    tileClass += ' border border-warning text-warning active:scale-[0.97]'
  } else {
    tileClass += ' border border-danger-light text-danger active:scale-[0.97]'
  }

  return (
    <button
      type="button"
      aria-label={`Day ${day.day_number} — ${score} of ${TOTAL_RULES} rules`}
      onClick={() => !isFuture && onTap(day)}
      disabled={isFuture}
      className={tileClass}
    >
      <span>{day.day_number}</span>
      {!isFuture && (
        <span className="flex items-center gap-[2px]" aria-hidden="true">
          {CHALLENGE_RULES.map((rule) => (
            <span
              key={rule.id}
              className={`h-1 w-1 rounded-full ${
                rulesDone.includes(rule.id) ? pipFilled : pipEmpty
              }`}
            />
          ))}
        </span>
      )}
    </button>
  )
}
