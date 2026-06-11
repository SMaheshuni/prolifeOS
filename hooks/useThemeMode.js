import { useEffect } from 'react'
import { useAuth } from './useAuth'
import { useSyncStore } from '@/store/syncStore'
import { useThemeStore } from '@/store/themeStore'
import { settingsService } from '@/pages/settings/settings.service'

export const useThemeMode = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const setMode = useThemeStore((state) => state.setMode)

  useEffect(() => {
    if (!user?.id) {
      setMode('light')
      return
    }
    let cancelled = false
    const load = async () => {
      try {
        const settings = await settingsService.ensure(user.id)
        if (!cancelled) setMode(settings.theme === 'dark' ? 'dark' : 'light')
      } catch {
        if (!cancelled) setMode('light')
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [user?.id, lastSyncedAt, setMode])
}
