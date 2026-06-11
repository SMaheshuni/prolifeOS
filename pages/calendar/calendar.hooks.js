import { useCallback, useEffect, useMemo, useState } from 'react'
import { calendarService } from './calendar.service'
import { tasksService } from '@/pages/tasks/tasks.service'
import { activityService } from '@/pages/activity/activity.service'
import { checkinService } from '@/pages/checkin/checkin.service'
import { mealsService } from '@/pages/meals/meals.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { toIsoDate } from '@/utils/dateHelpers'

const emptyDay = { tasks: [], meals: [], activities: [], checkin: null, goals: [] }

export const useCalendarDay = (date) => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [data, setData] = useState(emptyDay)
  const [isLoading, setIsLoading] = useState(true)

  const [frequentMeals, setFrequentMeals] = useState([])

  const reload = useCallback(async () => {
    if (!user?.id) return
    try {
      const [result, frequent] = await Promise.all([
        calendarService.getDay(user.id, date),
        mealsService.getFrequent(user.id, 8),
      ])
      setData(result)
      setFrequentMeals(frequent)
    } catch {
      showToast({ message: 'Could not load calendar', type: 'error' })
    }
  }, [user?.id, date])

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const [result, frequent] = await Promise.all([
          calendarService.getDay(user.id, date),
          mealsService.getFrequent(user.id, 8),
        ])
        if (cancelled) return
        setData(result)
        setFrequentMeals(frequent)
      } catch {
        if (!cancelled) showToast({ message: 'Could not load calendar', type: 'error' })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id, date.getTime(), lastSyncedAt])

  const addMeal = async ({ mealType, name, calories, notes }) => {
    if (!user?.id) return { error: true }
    if (!name || name.trim() === '') {
      showToast({ message: 'Add a meal name', type: 'error' })
      return { errors: { name: 'Required' } }
    }
    try {
      await mealsService.add({
        userId: user.id,
        date,
        mealType,
        name: name.trim(),
        calories,
        notes,
      })
      await reload()
      showToast({ message: 'Meal added', type: 'success' })
      return { ok: true }
    } catch {
      showToast({ message: 'Could not add meal', type: 'error' })
      return { error: true }
    }
  }

  const updateMeal = async (id, { name, calories, notes }) => {
    if (!name || name.trim() === '') {
      showToast({ message: 'Add a meal name', type: 'error' })
      return { errors: { name: 'Required' } }
    }
    try {
      await mealsService.update(id, {
        name: name.trim(),
        calories: calories === '' || calories === null ? null : Number(calories),
        notes: notes ?? '',
      })
      await reload()
      showToast({ message: 'Meal updated', type: 'success' })
      return { ok: true }
    } catch {
      showToast({ message: 'Could not update meal', type: 'error' })
      return { error: true }
    }
  }

  const deleteMeal = async (id) => {
    try {
      await mealsService.remove(id)
      await reload()
      showToast({ message: 'Meal deleted', type: 'success' })
    } catch {
      showToast({ message: 'Could not delete meal', type: 'error' })
    }
  }

  return { data, isLoading, frequentMeals, addMeal, updateMeal, deleteMeal }
}

export const useCalendarEvents = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const result = await calendarService.getEvents(user.id)
        if (!cancelled) setEvents(result)
      } catch {
        if (!cancelled) showToast({ message: 'Could not load calendar', type: 'error' })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id, lastSyncedAt])

  return { events, isLoading }
}

// All ISO dates that have ANY logged data for this user — used by MonthGrid
// to show a tiny dot under day numbers.
export const useCalendarDataDates = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [tasks, setTasks] = useState([])
  const [meals, setMeals] = useState([])
  const [activities, setActivities] = useState([])
  const [checkins, setCheckins] = useState([])

  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    const load = async () => {
      try {
        const [t, m, a, c] = await Promise.all([
          tasksService.getAll(user.id),
          mealsService.getForDateRange(user.id, new Date(2000, 0, 1), new Date(2100, 0, 1)),
          activityService.getAll(user.id),
          checkinService.getAll(user.id),
        ])
        if (cancelled) return
        setTasks(t)
        setMeals(m)
        setActivities(a)
        setCheckins(c)
      } catch {
        if (!cancelled) showToast({ message: 'Could not load calendar', type: 'error' })
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id, lastSyncedAt])

  return useMemo(() => {
    const set = new Set()
    tasks.forEach((task) => task.due_date && set.add(toIsoDate(task.due_date)))
    meals.forEach((meal) => meal.date && set.add(meal.date))
    activities.forEach((entry) => entry.date && set.add(entry.date))
    checkins.forEach((entry) => entry.date && set.add(entry.date))
    return set
  }, [tasks, meals, activities, checkins])
}

export const useCalendarWeek = (anchor) => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [data, setData] = useState({ tasks: [], meals: [], activities: [], checkins: [] })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    let cancelled = false
    const load = async () => {
      setIsLoading(true)
      try {
        const result = await calendarService.getWeek(user.id, anchor)
        if (!cancelled) setData(result)
      } catch {
        if (!cancelled) showToast({ message: 'Could not load calendar', type: 'error' })
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id, anchor.getTime(), lastSyncedAt])

  return { data, isLoading }
}
