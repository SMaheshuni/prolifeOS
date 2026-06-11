import { useEffect, useMemo, useState } from 'react'
import { challengeService, isDayPerfect } from './challenge.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'

export const useChallenge = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [challenge, setChallenge] = useState(null)
  const [days, setDays] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const active = await challengeService.getActive(user.id)
        setChallenge(active)
        if (active) {
          const challengeDays = await challengeService.getDaysFor(active.id)
          setDays(challengeDays)
        } else {
          setDays([])
        }
      } catch {
        showToast({ message: 'Could not load challenge', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  const startChallenge = async (type) => {
    try {
      const { challenge: created, days: createdDays } = await challengeService.start({
        userId: user.id,
        type,
      })
      setChallenge(created)
      setDays(createdDays)
      showToast({ message: 'Challenge started', type: 'success' })
    } catch (error) {
      showToast({ message: error.message || 'Could not start challenge', type: 'error' })
    }
  }

  const toggleRule = async (dayId, ruleId, on) => {
    try {
      const before = days.find((d) => d.id === dayId)
      const wasPerfect = before ? isDayPerfect(before) : false
      const updated = await challengeService.toggleRule(dayId, ruleId, on)
      if (!updated) return
      const nextDays = days.map((day) => (day.id === dayId ? updated : day))
      setDays(nextDays)

      const allPerfect = nextDays.length > 0 && nextDays.every(isDayPerfect)
      if (allPerfect && challenge && challenge.status === 'active') {
        const completedChallenge = await challengeService.complete(challenge.id)
        setChallenge(completedChallenge)
        showToast({ message: 'Challenge complete', type: 'success' })
      } else if (!wasPerfect && isDayPerfect(updated)) {
        showToast({
          message: `Day ${updated.day_number} — perfect day`,
          type: 'success',
        })
      }
    } catch {
      showToast({ message: 'Could not update rule', type: 'error' })
    }
  }

  const abandonChallenge = async () => {
    if (!challenge) return
    try {
      await challengeService.abandon(challenge.id)
      setChallenge(null)
      setDays([])
      showToast({ message: 'Challenge abandoned', type: 'success' })
    } catch {
      showToast({ message: 'Could not abandon challenge', type: 'error' })
    }
  }

  const streak = useMemo(() => challengeService.computeStreak(challenge, days), [challenge, days])
  const totalPoints = useMemo(() => challengeService.computeTotalPoints(days), [days])
  const perfectDayCount = useMemo(() => days.filter(isDayPerfect).length, [days])

  return {
    challenge,
    days,
    streak,
    totalPoints,
    perfectDayCount,
    isLoading,
    startChallenge,
    toggleRule,
    abandonChallenge,
  }
}
