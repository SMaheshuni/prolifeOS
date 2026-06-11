import { useEffect, useMemo, useState } from 'react'
import { checkinService } from './checkin.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { validateCheckin } from '@/utils/validators'
import { toIsoDate, daysBetween } from '@/utils/dateHelpers'

export const useCheckin = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [checkins, setCheckins] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const data = await checkinService.getAll(user.id)
        setCheckins(data)
      } catch {
        showToast({ message: 'Could not load check-ins', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  const today = toIsoDate(new Date())
  const todayCheckin = useMemo(
    () => checkins.find((entry) => entry.date === today) || null,
    [checkins, today]
  )

  const recentCheckins = useMemo(() => {
    return [...checkins]
      .filter((entry) => daysBetween(entry.date, new Date()) <= 7)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [checkins])

  const saveCheckin = async (input, { silent = false } = {}) => {
    const errors = validateCheckin(input)
    if (errors) {
      showToast({ message: 'Please fix check-in errors', type: 'error' })
      return { errors }
    }
    try {
      const saved = await checkinService.upsertForDate({ ...input, userId: user.id })
      setCheckins((prev) => {
        const others = prev.filter((entry) => entry.id !== saved.id)
        return [...others, saved]
      })
      if (!silent) showToast({ message: 'Check-in saved', type: 'success' })
      return { checkin: saved, ok: true }
    } catch {
      showToast({ message: 'Could not save check-in', type: 'error' })
      return { error: true }
    }
  }

  return { checkins, todayCheckin, recentCheckins, isLoading, saveCheckin }
}
