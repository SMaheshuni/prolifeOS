import { useEffect, useState } from 'react'
import { create } from 'zustand'
import { useAuth } from '@/hooks/useAuth'
import { settingsService } from '@/pages/settings/settings.service'
import { showToast } from '@/store/toastStore'
import { computeMaintenance } from '@/utils/calories'

const PROFILE_FIELDS = ['sex', 'age', 'height_cm', 'activity_level', 'daily_kcal_goal']

export const isOnboardingComplete = (settings) => {
  if (!settings) return false
  return PROFILE_FIELDS.some((field) => settings[field] !== null && settings[field] !== undefined && settings[field] !== '')
}

const useOnboardingGateStore = create((set) => ({
  completedUserId: null,
  markComplete: (userId) => set({ completedUserId: userId }),
}))

export const markOnboardingComplete = (userId) =>
  useOnboardingGateStore.getState().markComplete(userId)

export const useOnboardingGate = (userId) => {
  const [isChecking, setIsChecking] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const completedUserId = useOnboardingGateStore((s) => s.completedUserId)

  useEffect(() => {
    if (!userId) {
      setIsChecking(false)
      setNeedsOnboarding(false)
      return
    }
    let cancelled = false
    const check = async () => {
      setIsChecking(true)
      try {
        const settings = await settingsService.ensure(userId)
        if (cancelled) return
        setNeedsOnboarding(!isOnboardingComplete(settings))
      } catch {
        if (!cancelled) setNeedsOnboarding(false)
      } finally {
        if (!cancelled) setIsChecking(false)
      }
    }
    check()
    return () => {
      cancelled = true
    }
  }, [userId])

  return {
    isChecking,
    needsOnboarding: needsOnboarding && completedUserId !== userId,
  }
}

export const useOnboarding = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const data = await settingsService.ensure(user.id)
        setSettings(data)
      } catch {
        showToast({ message: 'Could not start onboarding', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id])

  const saveStep = async (updates) => {
    try {
      const updated = await settingsService.update(user.id, updates)
      setSettings(updated)
      return updated
    } catch {
      showToast({ message: 'Could not save', type: 'error' })
      return null
    }
  }

  const suggestKcalGoal = (next) => {
    const merged = { ...settings, ...next }
    const maintenance = computeMaintenance({
      sex: merged.sex,
      age: merged.age,
      heightCm: merged.height_cm,
      weightKg: null,
      activityLevel: merged.activity_level,
    })
    if (!maintenance) return null
    return Math.max(0, maintenance - 500)
  }

  return { settings, isLoading, saveStep, suggestKcalGoal }
}
