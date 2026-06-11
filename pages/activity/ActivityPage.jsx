// Activity page — Add via slide-up sheet (no inline form), bar chart of
// kcal per day in the active scope, and a list of today's sessions with
// edit + delete. Uses a hand-rolled SVG bar chart so this page doesn't
// pull in recharts (saves ~365 KB on this route's chunk).

import { useMemo, useState } from 'react'
import { Plus, Trash2, Pencil, Dumbbell } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, Skeleton, Tabs, EmptyState, Modal } from '@/components/ui'
import LogActivitySheet from './LogActivitySheet'
import { useActivities } from './activity.hooks'
import { useAuth } from '@/hooks/useAuth'
import {
  addDays,
  getWeekDays,
  startOfMonth,
  endOfMonth,
  toIsoDate,
} from '@/utils/dateHelpers'
import { titleCase } from '@/utils/formatters'
import { TYPE_META } from './activityTypes'

const SCOPE_TABS = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
]

const WEEKDAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

const ActivityRow = ({ activity, onEdit, onDelete }) => {
  const meta = TYPE_META[activity.type] || TYPE_META.custom
  const Icon = meta.Icon
  return (
    <li className="flex items-center justify-between gap-sm rounded-md py-1.5 transition hover:bg-primary-light/30">
      <button
        type="button"
        onClick={() => onEdit?.(activity)}
        className="flex flex-1 items-center gap-md text-left active:opacity-70"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-text">
          <Icon size={14} strokeWidth={1.75} />
        </span>
        <div className="flex flex-1 flex-col gap-0">
          <span className="text-body text-text">{meta.label}</span>
          <span className="text-micro text-muted">
            {activity.duration_minutes} min
            {activity.calories ? ` · ${activity.calories} kcal` : ''}
          </span>
        </div>
      </button>
      <button
        type="button"
        aria-label="Edit activity"
        onClick={() => onEdit?.(activity)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition hover:bg-primary-light hover:text-text active:scale-95"
      >
        <Pencil size={15} />
      </button>
      <button
        type="button"
        aria-label="Delete activity"
        onClick={() => onDelete?.(activity)}
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition hover:bg-danger-light hover:text-danger active:scale-95"
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}

const VIEW_W = 320
const VIEW_H = 100
const PAD_X = 6
const PAD_TOP = 8
const PAD_BOTTOM = 18

const KcalBarChart = ({ data, isToday }) => {
  if (!data?.length) return null
  const max = Math.max(...data.map((d) => d.kcal), 1)
  const slot = (VIEW_W - PAD_X * 2) / data.length
  const barW = Math.max(2, Math.min(18, slot * 0.7))
  const innerH = VIEW_H - PAD_TOP - PAD_BOTTOM

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      className="w-full h-28"
      preserveAspectRatio="none"
      aria-label="Calories burned per day"
    >
      <line
        x1={PAD_X}
        x2={VIEW_W - PAD_X}
        y1={VIEW_H - PAD_BOTTOM}
        y2={VIEW_H - PAD_BOTTOM}
        stroke="var(--lifeos-color-border)"
        strokeWidth="1"
      />
      {data.map((d, i) => {
        const x = PAD_X + slot * i + (slot - barW) / 2
        const h = d.kcal === 0 ? 2 : (d.kcal / max) * innerH
        const y = VIEW_H - PAD_BOTTOM - h
        const today = isToday(i)
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={h}
              rx={2}
              fill="var(--lifeos-color-accent)"
              opacity={d.kcal === 0 ? 0.18 : today ? 1 : 0.85}
            />
            <text
              x={x + barW / 2}
              y={VIEW_H - 4}
              textAnchor="middle"
              fontSize="10"
              fill={
                today
                  ? 'var(--lifeos-color-text)'
                  : 'var(--lifeos-color-muted)'
              }
              fontWeight={today ? 600 : 400}
            >
              {d.label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function ActivityPage() {
  const { user } = useAuth()
  const {
    activities,
    isLoading,
    addActivity,
    updateActivity,
    deleteActivity,
  } = useActivities()

  const [scope, setScope] = useState('week')
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const today = useMemo(() => new Date(), [])
  const todayIso = toIsoDate(today)

  const handleLog = async ({ type, durationMinutes, calories }) => {
    if (!user?.id) return
    setIsSubmitting(true)
    const result = await addActivity({
      userId: user.id,
      date: today,
      type,
      durationMinutes,
      calories,
    })
    setIsSubmitting(false)
    if (!result?.errors && !result?.error) setIsLogOpen(false)
  }

  const handleEditSubmit = async ({ type, durationMinutes, calories }) => {
    if (!editing) return
    setIsSubmitting(true)
    await updateActivity(editing.id, {
      type,
      duration_minutes: Number(durationMinutes),
      calories: calories === '' || calories === null ? null : Number(calories),
    })
    setIsSubmitting(false)
    setEditing(null)
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    await deleteActivity(pendingDelete.id)
    setPendingDelete(null)
  }

  const chartData = useMemo(() => {
    if (scope === 'week') {
      const days = getWeekDays(today)
      return days.map((day, i) => ({
        label: WEEKDAY_LETTERS[i],
        iso: toIsoDate(day),
        kcal: activities
          .filter((a) => a.date === toIsoDate(day))
          .reduce((sum, a) => sum + (Number(a.calories) || 0), 0),
      }))
    }
    const start = startOfMonth(today)
    const end = endOfMonth(today)
    const totalDays = Math.ceil((end - start) / 86400000) + 1
    return Array.from({ length: totalDays }, (_, i) => {
      const day = addDays(start, i)
      const isWeekStart = day.getDay() === 1
      return {
        label: isWeekStart || i === 0 ? String(day.getDate()) : '',
        iso: toIsoDate(day),
        kcal: activities
          .filter((a) => a.date === toIsoDate(day))
          .reduce((sum, a) => sum + (Number(a.calories) || 0), 0),
      }
    })
  }, [activities, scope, today])

  const summary = useMemo(() => {
    const inRange = activities.filter((a) =>
      chartData.some((d) => d.iso === a.date)
    )
    return {
      sessions: inRange.length,
      totalKcal: inRange.reduce((sum, a) => sum + (Number(a.calories) || 0), 0),
    }
  }, [activities, chartData])

  const todaysSessions = useMemo(
    () =>
      activities
        .filter((a) => a.date === todayIso)
        .sort((a, b) => (a.created_at < b.created_at ? -1 : 1)),
    [activities, todayIso]
  )

  return (
    <>
      <TopBar />
      <PageWrapper>
        <div className="flex flex-col gap-lg">
          <div className="flex items-end justify-between gap-md">
            <div className="flex flex-col gap-0.5">
              <h1 className="font-display text-heading font-bold text-text">
                Activity
              </h1>
              <span className="text-micro text-muted">
                {summary.sessions} session{summary.sessions === 1 ? '' : 's'}
                {summary.totalKcal > 0 ? ` · ${summary.totalKcal} kcal` : ''}
                {' · '}
                {SCOPE_TABS.find((t) => t.id === scope)?.label.toLowerCase()}
              </span>
            </div>
            <Button
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={() => setIsLogOpen(true)}
            >
              Add
            </Button>
          </div>

          <Tabs tabs={SCOPE_TABS} activeId={scope} onChange={setScope} />

          {isLoading ? (
            <Skeleton className="h-28 w-full" />
          ) : (
            <KcalBarChart
              data={chartData}
              isToday={(i) => chartData[i]?.iso === todayIso}
            />
          )}

          <div className="flex flex-col gap-sm">
            <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
              Today
            </span>
            {isLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : todaysSessions.length === 0 ? (
              <EmptyState
                icon={Dumbbell}
                title="Nothing logged today"
                description="Tap Add to log a session."
              />
            ) : (
              <ul className="flex flex-col">
                {todaysSessions.map((activity) => (
                  <ActivityRow
                    key={activity.id}
                    activity={activity}
                    onEdit={setEditing}
                    onDelete={setPendingDelete}
                  />
                ))}
              </ul>
            )}
          </div>
        </div>
      </PageWrapper>

      <LogActivitySheet
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        onSave={handleLog}
        isSubmitting={isSubmitting}
      />

      <LogActivitySheet
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        defaultType={editing?.type || 'gym'}
        defaultDuration={editing?.duration_minutes ?? ''}
        defaultCalories={editing?.calories ?? ''}
        title="Edit activity"
        onSave={handleEditSubmit}
        isSubmitting={isSubmitting}
      />

      <Modal
        isOpen={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        title="Delete activity?"
        description={
          pendingDelete
            ? `${TYPE_META[pendingDelete.type]?.label || titleCase(pendingDelete.type)} · ${pendingDelete.duration_minutes} min`
            : ''
        }
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
