import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert } from '@/db/sync'
import { DEFAULT_USER_SETTINGS } from '@/utils/constants'

const TABLE = 'user_settings'

export const settingsService = {
  get: async (userId) => {
    const all = await db.table(TABLE).where('user_id').equals(userId).toArray()
    return all[0] || null
  },

  ensure: async (userId) => {
    const existing = await settingsService.get(userId)
    if (existing) return existing
    const now = nowIso()
    const settings = {
      id: generateId(),
      user_id: userId,
      ...DEFAULT_USER_SETTINGS,
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(TABLE).add(settings)
    queueUpsert(TABLE, settings)
    return settings
  },

  update: async (userId, updates) => {
    const existing = await settingsService.ensure(userId)
    const next = { ...updates, updated_at: nowIso(), synced_at: null }
    await db.table(TABLE).update(existing.id, next)
    const updated = await db.table(TABLE).get(existing.id)
    if (updated) queueUpsert(TABLE, updated)
    return updated
  },
}
