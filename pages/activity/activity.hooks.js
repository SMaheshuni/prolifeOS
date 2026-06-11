import { useEffect, useState } from 'react'
import { activityService } from './activity.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { validateActivity } from '@/utils/validators'

export const useActivities = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const data = await activityService.getAll(user.id)
        setActivities(data)
      } catch {
        showToast({ message: 'Could not load activities', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  const addActivity = async (input) => {
    const errors = validateActivity({
      ...input,
      duration_minutes: input.durationMinutes,
    })
    if (errors) {
      showToast({ message: 'Please fix activity errors', type: 'error' })
      return { errors }
    }
    try {
      const created = await activityService.add({ ...input, userId: user.id })
      setActivities((prev) => [...prev, created])
      showToast({ message: 'Activity logged', type: 'success' })
      return { activity: created }
    } catch {
      showToast({ message: 'Could not log activity', type: 'error' })
      return { error: true }
    }
  }

  const updateActivity = async (id, updates) => {
    try {
      const updated = await activityService.update(id, updates)
      setActivities((prev) => prev.map((entry) => (entry.id === id ? updated : entry)))
      showToast({ message: 'Activity updated', type: 'success' })
    } catch {
      showToast({ message: 'Could not update activity', type: 'error' })
    }
  }

  const deleteActivity = async (id) => {
    try {
      await activityService.remove(id)
      setActivities((prev) => prev.filter((entry) => entry.id !== id))
      showToast({ message: 'Activity deleted', type: 'success' })
    } catch {
      showToast({ message: 'Could not delete activity', type: 'error' })
    }
  }

  return { activities, isLoading, addActivity, updateActivity, deleteActivity }
}
