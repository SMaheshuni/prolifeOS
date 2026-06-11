import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Flame,
  Star,
  Utensils,
  Activity as ActivityIcon,
  Brain,
  Droplet,
  Camera,
} from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, Card, Modal, ProgressBar, Skeleton } from '@/components/ui'
import ChallengeDay from './ChallengeDay'
import ChallengeDaySheet from './ChallengeDaySheet'
import RuleFrequencyList from './RuleFrequencyList'
import { useChallenge } from './challenge.hooks'
import { CHALLENGE_TYPES, CHALLENGE_DURATIONS, CHALLENGE_RULES } from '@/utils/constants'
import { formatDate } from '@/utils/formatters'
import { isToday } from '@/utils/dateHelpers'

const RULE_ICONS = {
  clean_day: Utensils,
  activity: ActivityIcon,
  deep_work: Brain,
  hydration: Droplet,
  daily_proof: Camera,
}

const DURATION_OPTIONS = [
  { id: CHALLENGE_TYPES.THIRTY, label: '30 days' },
  { id: CHALLENGE_TYPES.SEVENTY_FIVE, label: '75 days' },
]

const RuleRow = ({ rule }) => {
  const Icon = RULE_ICONS[rule.id] || Flame
  return (
    <div className="glass flex items-start gap-md rounded-md px-md py-sm">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-light text-text">
        <Icon size={16} strokeWidth={1.75} />
      </span>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-label font-medium text-text">{rule.title}</span>
        <span className="text-micro text-muted">{rule.description}</span>
      </div>
    </div>
  )
}

export default function ChallengePage() {
  const {
    challenge,
    days,
    streak,
    totalPoints,
    perfectDayCount,
    isLoading,
    startChallenge,
    toggleRule,
    abandonChallenge,
  } = useChallenge()
  const [pendingDuration, setPendingDuration] = useState(CHALLENGE_TYPES.THIRTY)
  const [isAbandonOpen, setIsAbandonOpen] = useState(false)
  const [openDayId, setOpenDayId] = useState(null)
  const todayTileRef = useRef(null)
  const hasScrolledToTodayRef = useRef(false)

  // Center today's tile on first load when there's a challenge in
  // progress — matters most for the 75-day grid where today might
  // otherwise sit below the fold.
  useEffect(() => {
    if (hasScrolledToTodayRef.current) return
    if (!challenge || days.length === 0) return
    if (!todayTileRef.current) return
    hasScrolledToTodayRef.current = true
    requestAnimationFrame(() => {
      todayTileRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    })
  }, [challenge, days.length])

  const sortedDays = useMemo(
    () => [...days].sort((a, b) => a.day_number - b.day_number),
    [days]
  )
  const totalDays = challenge ? CHALLENGE_DURATIONS[challenge.type] : 0
  const totalPossiblePoints = totalDays * CHALLENGE_RULES.length
  const openDay = useMemo(
    () => days.find((d) => d.id === openDayId) || null,
    [days, openDayId]
  )

  const titleForType = (type) =>
    type === CHALLENGE_TYPES.SEVENTY_FIVE ? '75-day challenge' : '30-day challenge'
  const subtitleForType = (type) =>
    type === CHALLENGE_TYPES.SEVENTY_FIVE
      ? '5 daily rules. 75 days. The version of yourself that doesn’t flinch.'
      : '5 daily rules. 30 days. Build the version of yourself you keep talking about.'

  return (
    <>
      <TopBar pageName="Challenge" />
      <PageWrapper>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : !challenge ? (
          <div className="flex flex-col items-center gap-lg text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-light text-accent">
              <Flame size={28} strokeWidth={1.75} />
            </span>

            <div className="flex flex-col items-center gap-xs">
              <h1 className="font-display text-display font-bold text-text leading-[1.05]">
                {titleForType(pendingDuration)}
              </h1>
              <p className="text-body text-muted">{subtitleForType(pendingDuration)}</p>
            </div>

            <div className="flex w-full items-center gap-xs">
              {DURATION_OPTIONS.map((opt) => {
                const isActive = opt.id === pendingDuration
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPendingDuration(opt.id)}
                    className={`flex-1 rounded-full py-sm text-label transition active:scale-[0.97] ${
                      isActive
                        ? 'bg-accent text-accent-ink'
                        : 'glass text-muted hover:text-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>

            <ul className="flex w-full flex-col gap-sm">
              {CHALLENGE_RULES.map((rule) => (
                <li key={rule.id}>
                  <RuleRow rule={rule} />
                </li>
              ))}
            </ul>

            <Button
              variant="primary"
              fullWidth
              onClick={() => startChallenge(pendingDuration)}
            >
              Begin challenge
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-lg">
            <Card>
              <div className="flex flex-col gap-md">
                <div className="flex items-start justify-between gap-md">
                  <div className="flex flex-col gap-xs">
                    <h1 className="font-display text-heading font-bold text-text leading-none">
                      {titleForType(challenge.type)}
                    </h1>
                    <p className="text-micro text-muted">
                      Started {formatDate(challenge.start_date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-xs">
                    <div className="inline-flex items-center gap-xs text-warning">
                      <Flame size={18} />
                      <span className="font-display text-subheading font-medium leading-none">
                        {streak}
                      </span>
                      <span className="text-micro text-muted">streak</span>
                    </div>
                    <div className="inline-flex items-baseline gap-xs">
                      <span className="font-display text-subheading font-medium leading-none text-text">
                        {totalPoints}
                      </span>
                      <span className="text-micro text-muted">
                        / {totalPossiblePoints} pts
                      </span>
                    </div>
                  </div>
                </div>
                <ProgressBar
                  value={perfectDayCount}
                  max={totalDays}
                  label="Perfect days"
                />
              </div>
            </Card>

            <div className="grid grid-cols-7 gap-xs">
              {sortedDays.map((day) => (
                <ChallengeDay
                  key={day.id}
                  day={day}
                  onTap={(d) => setOpenDayId(d.id)}
                />
              ))}
            </div>

            <ul className="flex flex-col gap-sm">
              {CHALLENGE_RULES.map((rule) => (
                <li key={rule.id}>
                  <RuleRow rule={rule} />
                </li>
              ))}
            </ul>

            <Button variant="ghost" onClick={() => setIsAbandonOpen(true)} fullWidth>
              Abandon challenge
            </Button>
          </div>
        )}
      </PageWrapper>

      <ChallengeDaySheet
        day={openDay}
        isOpen={Boolean(openDay)}
        onClose={() => setOpenDayId(null)}
        onToggleRule={toggleRule}
      />

      <Modal
        isOpen={isAbandonOpen}
        onClose={() => setIsAbandonOpen(false)}
        title="Abandon challenge?"
        description="This will delete the current challenge and all of its day records."
        confirmLabel="Abandon"
        variant="danger"
        onConfirm={async () => {
          await abandonChallenge()
          setIsAbandonOpen(false)
        }}
      />
    </>
  )
}
