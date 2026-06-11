import { db, nowIso } from './dexie.client'
import { upsertToCloud, deleteFromCloud, isSupabaseConfigured } from '@/lib/supabase.client'
import { useSyncStore } from '@/store/syncStore'

const CONFLICT_TARGETS = {
  daily_checkins: 'user_id,date',
  user_settings: 'user_id',
  habit_logs: 'habit_id,date',
}

const conflictFor = (tableName) => CONFLICT_TARGETS[tableName] || 'id'

// Failures are surfaced via the BrandBar/TopBar sync dot + the menu drawer
// status line. No toast — the user gets a calm ambient signal instead of
// a demanding popup.
const markSyncFailure = () => {
  useSyncStore.getState().setSyncError(true)
}

export const queueUpsert = async (tableName, record) => {
  if (!isSupabaseConfigured) return
  try {
    await upsertToCloud(tableName, record, conflictFor(tableName))
    await db.table(tableName).update(record.id, { synced_at: nowIso() })
    useSyncStore.getState().setSyncError(false)
  } catch {
    markSyncFailure()
  }
}

export const queueDelete = async (tableName, id) => {
  if (!isSupabaseConfigured) return
  try {
    await deleteFromCloud(tableName, id)
    useSyncStore.getState().setSyncError(false)
  } catch {
    markSyncFailure()
  }
}
