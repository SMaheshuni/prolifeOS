import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { settingsService } from '@/pages/settings/settings.service'
import { checkinService } from '@/pages/checkin/checkin.service'
import { computeMaintenance, computeMonthlyForecastKg, resolveWeightKg } from '@/utils/calories'
import { toIsoDate } from '@/utils/dateHelpers'

export const useProfile = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [settings, setSettings] = useState(null)
  const [latestWeight, setLatestWeight] = useState(null)
  const [latestWeightUnit, setLatestWeightUnit] = useState('kg')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const [profileSettings, allCheckins] = await Promise.all([
          settingsService.ensure(user.id),
          checkinService.getAll(user.id),
        ])
        setSettings(profileSettings)
        const sorted = [...allCheckins]
          .filter((entry) => entry.weight !== null && entry.weight !== undefined)
          .sort((a, b) => (a.date < b.date ? 1 : -1))
        if (sorted[0]) {
          setLatestWeight(sorted[0].weight)
          setLatestWeightUnit(sorted[0].weight_unit || profileSettings?.weight_unit || 'kg')
        } else {
          setLatestWeight(null)
          setLatestWeightUnit(profileSettings?.weight_unit || 'kg')
        }
      } catch {
        showToast({ message: 'Could not load profile', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  // Per-field auto-save: silent commit, no toast. Errors still toast.
  const saveProfile = async ({ profile, weight, weightUnit }) => {
    try {
      const hasWeight = weight !== '' && weight !== null && weight !== undefined
      const weightChanged =
        hasWeight &&
        (String(weight) !== String(latestWeight ?? '') ||
          weightUnit !== latestWeightUnit)

      const tasks = [settingsService.update(user.id, profile)]
      if (weightChanged) {
        tasks.push(
          checkinService.upsertForDate({
            userId: user.id,
            date: toIsoDate(new Date()),
            weight,
            weightUnit,
            mood: null,
            thoughts: null,
          })
        )
      }
      const [updatedSettings, savedCheckin] = await Promise.all(tasks)
      setSettings(updatedSettings)
      if (savedCheckin) {
        setLatestWeight(savedCheckin.weight)
        setLatestWeightUnit(savedCheckin.weight_unit || weightUnit || 'kg')
      }
      return { ok: true }
    } catch {
      showToast({ message: 'Could not save profile', type: 'error' })
      return { error: true }
    }
  }

  const computed = useMemo(() => {
    if (!settings) return { maintenance: null, monthlyForecastKg: null }
    const weightKg = resolveWeightKg(latestWeight, latestWeightUnit)
    const maintenance = computeMaintenance({
      sex: settings.sex,
      age: settings.age,
      heightCm: settings.height_cm,
      weightKg,
      activityLevel: settings.activity_level,
    })
    const monthlyForecastKg = computeMonthlyForecastKg({
      dailyKcalGoal: settings.daily_kcal_goal,
      maintenanceKcal: maintenance,
    })
    return { maintenance, monthlyForecastKg }
  }, [settings, latestWeight, latestWeightUnit])

  return {
    settings,
    isLoading,
    saveProfile,
    latestWeight,
    latestWeightUnit,
    maintenanceKcal: computed.maintenance,
    monthlyForecastKg: computed.monthlyForecastKg,
  }
}
