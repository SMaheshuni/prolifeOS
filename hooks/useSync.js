import { useEffect } from 'react'
import { db, nowIso } from '@/db/dexie.client'
import { TABLES } from '@/db/schema'
import { upsertToCloud, fetchFromCloud, isSupabaseConfigured } from '@/lib/supabase.client'
import { useSyncStore } from '@/store/syncStore'
import { useOnlineStatus } from './useOnlineStatus'
import { useAuth } from './useAuth'

const CONFLICT_TARGETS = {
  daily_checkins: 'user_id,date',
  user_settings: 'user_id',
  habit_logs: 'habit_id,date',
}

const conflictFor = (tableName) => CONFLICT_TARGETS[tableName] || 'id'

const pullTable = async (tableName, userId) => {
  const cloudRecords = await fetchFromCloud(tableName, userId)
  for (const record of cloudRecords) {
    const local = await db.table(tableName).get(record.id)
    const localTime = local?.updated_at || local?.created_at || ''
    const cloudTime = record.updated_at || record.created_at || ''
    if (!local || cloudTime > localTime) {
      await db.table(tableName).put({ ...record, synced_at: cloudTime || nowIso() })
    }
  }
}

const pushTable = async (tableName, userId) => {
  const pending = await db
    .table(tableName)
    .where('user_id')
    .equals(userId)
    .filter((record) => !record.synced_at)
    .toArray()

  let anyFailed = false
  for (const record of pending) {
    try {
      await upsertToCloud(tableName, record, conflictFor(tableName))
      await db.table(tableName).update(record.id, { synced_at: nowIso() })
    } catch {
      anyFailed = true
    }
  }
  return { anyFailed }
}

export const useSync = () => {
  const isOnline = useOnlineStatus()
  const { user } = useAuth()
  const setSyncing = useSyncStore((state) => state.setSyncing)
  const setInitialSync = useSyncStore((state) => state.setInitialSync)
  const setLastSyncedAt = useSyncStore((state) => state.setLastSyncedAt)
  const setPendingCount = useSyncStore((state) => state.setPendingCount)
  const setSyncError = useSyncStore((state) => state.setSyncError)

  useEffect(() => {
    if (!user?.id || !isOnline || !isSupabaseConfigured) return
    let cancelled = false
    let isFirstRun = true

    const flush = async () => {
      setSyncing(true)
      if (isFirstRun) setInitialSync(true)
      try {
        for (const tableName of Object.keys(TABLES)) {
          if (cancelled) return
          try {
            await pullTable(tableName, user.id)
          } catch {
            // continue with other tables
          }
        }

        let anyPushFailed = false
        for (const tableName of Object.keys(TABLES)) {
          if (cancelled) return
          const { anyFailed } = await pushTable(tableName, user.id)
          if (anyFailed) anyPushFailed = true
        }
        setSyncError(anyPushFailed)
        setLastSyncedAt(new Date().toISOString())

        let pendingCount = 0
        for (const tableName of Object.keys(TABLES)) {
          const count = await db
            .table(tableName)
            .where('user_id')
            .equals(user.id)
            .filter((record) => !record.synced_at)
            .count()
          pendingCount += count
        }
        setPendingCount(pendingCount)
      } finally {
        setSyncing(false)
        if (isFirstRun) {
          setInitialSync(false)
          isFirstRun = false
        }
      }
    }

    flush()

    const handleVisible = () => {
      if (document.visibilityState === 'visible') flush()
    }
    document.addEventListener('visibilitychange', handleVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', handleVisible)
    }
  }, [user?.id, isOnline, setSyncing, setInitialSync, setLastSyncedAt, setPendingCount, setSyncError])
}
