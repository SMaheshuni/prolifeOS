import { useEffect, useState } from 'react'
import { settingsService } from './settings.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'

export const useSettings = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
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
        showToast({ message: 'Could not load settings', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  const updateSettings = async (updates) => {
    try {
      const updated = await settingsService.update(user.id, updates)
      setSettings(updated)
      showToast({ message: 'Settings saved', type: 'success' })
    } catch {
      showToast({ message: 'Could not save settings', type: 'error' })
    }
  }

  return { settings, isLoading, updateSettings }
}
