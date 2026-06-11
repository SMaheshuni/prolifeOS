import { useEffect, useState } from 'react'
import { goalsService } from './goals.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { validateGoal } from '@/utils/validators'

export const useGoals = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [goals, setGoals] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const data = await goalsService.getAll(user.id)
        setGoals(data)
      } catch {
        showToast({ message: 'Could not load goals', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  const addGoal = async (input) => {
    const errors = validateGoal(input)
    if (errors) {
      showToast({ message: 'Please fix goal errors', type: 'error' })
      return { errors }
    }
    try {
      const created = await goalsService.add({ ...input, userId: user.id })
      setGoals((prev) => [...prev, created])
      showToast({ message: 'Goal added', type: 'success' })
      return { goal: created }
    } catch {
      showToast({ message: 'Could not add goal', type: 'error' })
      return { error: true }
    }
  }

  const updateGoal = async (id, updates) => {
    try {
      const updated = await goalsService.update(id, updates)
      setGoals((prev) => prev.map((goal) => (goal.id === id ? updated : goal)))
      showToast({ message: 'Goal updated', type: 'success' })
    } catch {
      showToast({ message: 'Could not update goal', type: 'error' })
    }
  }

  const incrementGoal = async (id, delta) => {
    try {
      const updated = await goalsService.incrementProgress(id, delta)
      if (updated) setGoals((prev) => prev.map((goal) => (goal.id === id ? updated : goal)))
    } catch {
      showToast({ message: 'Could not update progress', type: 'error' })
    }
  }

  const setGoalProgress = async (id, value) => {
    // Optimistic local update for snappy drag UX, then persist.
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id ? { ...goal, current_value: Math.max(0, Math.min(goal.target_value, value)) } : goal
      )
    )
    try {
      const updated = await goalsService.setProgress(id, value)
      if (updated) setGoals((prev) => prev.map((goal) => (goal.id === id ? updated : goal)))
    } catch {
      showToast({ message: 'Could not update progress', type: 'error' })
    }
  }

  const deleteGoal = async (id) => {
    try {
      await goalsService.remove(id)
      setGoals((prev) => prev.filter((goal) => goal.id !== id))
      showToast({ message: 'Goal deleted', type: 'success' })
    } catch {
      showToast({ message: 'Could not delete goal', type: 'error' })
    }
  }

  return { goals, isLoading, addGoal, updateGoal, incrementGoal, setGoalProgress, deleteGoal }
}
