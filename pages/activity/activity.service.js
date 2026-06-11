import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert, queueDelete } from '@/db/sync'
import { toIsoDate } from '@/utils/dateHelpers'

const TABLE = 'activities'

export const activityService = {
  getAll: async (userId) => {
    return db.table(TABLE).where('user_id').equals(userId).toArray()
  },

  add: async ({
    userId,
    date,
    type,
    durationMinutes,
    distance = null,
    distanceUnit = null,
    calories = null,
    notes = '',
  }) => {
    const now = nowIso()
    const activity = {
      id: generateId(),
      user_id: userId,
      date: toIsoDate(date),
      type,
      duration_minutes: Number(durationMinutes),
      distance: distance === '' || distance === null ? null : Number(distance),
      distance_unit: distance ? distanceUnit : null,
      calories: calories === '' || calories === null ? null : Number(calories),
      notes,
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(TABLE).add(activity)
    queueUpsert(TABLE, activity)
    return activity
  },

  update: async (id, updates) => {
    const next = { ...updates, updated_at: nowIso(), synced_at: null }
    await db.table(TABLE).update(id, next)
    const updated = await db.table(TABLE).get(id)
    if (updated) queueUpsert(TABLE, updated)
    return updated
  },

  remove: async (id) => {
    await db.table(TABLE).delete(id)
    queueDelete(TABLE, id)
  },
}
