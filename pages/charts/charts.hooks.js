import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { checkinService } from '@/pages/checkin/checkin.service'
import { tasksService } from '@/pages/tasks/tasks.service'
import { activityService } from '@/pages/activity/activity.service'
import { goalsService } from '@/pages/goals/goals.service'
import { addDays, toIsoDate } from '@/utils/dateHelpers'

const MOOD_SCORE = { terrible: 1, bad: 2, okay: 3, good: 4, great: 5 }

export const useChartsData = (rangeDays = 30) => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [checkins, setCheckins] = useState([])
  const [tasks, setTasks] = useState([])
  const [activities, setActivities] = useState([])
  const [goals, setGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const [checkinsData, tasksData, activitiesData, goalsData] = await Promise.all([
          checkinService.getAll(user.id),
          tasksService.getAll(user.id),
          activityService.getAll(user.id),
          goalsService.getAll(user.id),
        ])
        setCheckins(checkinsData)
        setTasks(tasksData)
        setActivities(activitiesData)
        setGoals(goalsData)
      } catch {
        showToast({ message: 'Could not load chart data', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  const dateLabels = useMemo(() => {
    const today = new Date()
    return Array.from({ length: rangeDays }, (_, i) => toIsoDate(addDays(today, -(rangeDays - 1 - i))))
  }, [rangeDays])

  const weightSeries = useMemo(() => {
    const map = new Map(checkins.map((entry) => [entry.date, entry.weight]))
    return dateLabels
      .map((date) => ({ date, value: map.get(date) ?? null }))
      .filter((point) => point.value !== null && point.value !== undefined)
  }, [checkins, dateLabels])

  const moodSeries = useMemo(() => {
    const map = new Map(checkins.map((entry) => [entry.date, MOOD_SCORE[entry.mood] ?? null]))
    return dateLabels
      .map((date) => ({ date, value: map.get(date) ?? null }))
      .filter((point) => point.value !== null && point.value !== undefined)
  }, [checkins, dateLabels])

  const taskCompletion = useMemo(() => {
    const rangeSet = new Set(dateLabels)
    const isInRange = (isoOrNull) => Boolean(isoOrNull) && rangeSet.has(isoOrNull.slice(0, 10))
    const inRange = tasks.filter(
      (task) => isInRange(task.due_date) || isInRange(task.created_at)
    )
    const total = inRange.length
    const completed = inRange.filter((task) => task.status === 'completed').length
    return { total, completed, rate: total === 0 ? 0 : (completed / total) * 100 }
  }, [tasks, dateLabels])

  const activitySeries = useMemo(() => {
    const map = new Map()
    for (const entry of activities) {
      map.set(entry.date, (map.get(entry.date) || 0) + (entry.duration_minutes || 0))
    }
    return dateLabels.map((date) => ({ date, value: map.get(date) || 0 }))
  }, [activities, dateLabels])

  const goalProgress = useMemo(
    () =>
      goals.map((goal) => ({
        title: goal.title,
        current: goal.current_value,
        target: goal.target_value,
        rate: goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0,
      })),
    [goals]
  )

  return {
    isLoading,
    weightSeries,
    moodSeries,
    taskCompletion,
    activitySeries,
    goalProgress,
  }
}
