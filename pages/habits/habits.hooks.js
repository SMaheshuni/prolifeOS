import { useEffect, useMemo, useState } from 'react'
import { habitsService } from './habits.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { toIsoDate } from '@/utils/dateHelpers'
import { celebrate } from '@/utils/celebrate'

export const useHabits = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const [allHabits, allLogs] = await Promise.all([
          habitsService.getAll(user.id),
          habitsService.getAllLogs(user.id),
        ])
        setHabits(allHabits)
        setLogs(allLogs)
      } catch {
        showToast({ message: 'Could not load habits', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  const todayIso = toIsoDate(new Date())
  const doneTodayIds = useMemo(
    () => new Set(logs.filter((log) => log.date === todayIso).map((log) => log.habit_id)),
    [logs, todayIso]
  )

  // Map: habit_id -> Set<dateIso> — used by the HabitItem week strip
  // so each habit can render its 7 day-checkboxes.
  const completedDatesByHabit = useMemo(() => {
    const map = new Map()
    for (const log of logs) {
      if (!map.has(log.habit_id)) map.set(log.habit_id, new Set())
      map.get(log.habit_id).add(log.date)
    }
    return map
  }, [logs])

  const sortedHabits = useMemo(
    () => [...habits].sort((a, b) => (a.created_at < b.created_at ? -1 : 1)),
    [habits]
  )

  const addHabit = async (input) => {
    if (!input.title || !input.title.trim()) {
      showToast({ message: 'Habit title required', type: 'error' })
      return { error: true }
    }
    try {
      const created = await habitsService.add({ ...input, userId: user.id })
      setHabits((prev) => [...prev, created])
      showToast({ message: 'Habit added', type: 'success' })
      return { habit: created }
    } catch {
      showToast({ message: 'Could not add habit', type: 'error' })
      return { error: true }
    }
  }

  const updateHabit = async (id, updates) => {
    try {
      const updated = await habitsService.update(id, updates)
      setHabits((prev) => prev.map((habit) => (habit.id === id ? updated : habit)))
      showToast({ message: 'Habit updated', type: 'success' })
    } catch {
      showToast({ message: 'Could not update habit', type: 'error' })
    }
  }

  const deleteHabit = async (id) => {
    try {
      await habitsService.remove(id)
      setHabits((prev) => prev.filter((habit) => habit.id !== id))
      setLogs((prev) => prev.filter((log) => log.habit_id !== id))
      showToast({ message: 'Habit deleted', type: 'success' })
    } catch {
      showToast({ message: 'Could not delete habit', type: 'error' })
    }
  }

  const toggleHabitOnDate = async (habitId, dateIso, isDone) => {
    try {
      const result = await habitsService.toggleForDate({
        userId: user.id,
        habitId,
        date: dateIso,
        isDone,
      })
      if (isDone && result) {
        setLogs((prev) => [...prev, result])
        if (dateIso === todayIso) celebrate()
      } else {
        setLogs((prev) =>
          prev.filter((log) => !(log.habit_id === habitId && log.date === dateIso))
        )
      }
    } catch {
      showToast({ message: 'Could not update habit', type: 'error' })
    }
  }

  return {
    habits: sortedHabits,
    doneTodayIds,
    completedDatesByHabit,
    isLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitOnDate,
  }
}
