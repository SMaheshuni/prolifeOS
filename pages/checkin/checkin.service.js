import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert } from '@/db/sync'
import { toIsoDate } from '@/utils/dateHelpers'

const TABLE = 'daily_checkins'

export const checkinService = {
  getAll: async (userId) => {
    return db.table(TABLE).where('user_id').equals(userId).toArray()
  },

  getByDate: async (userId, date) => {
    const iso = toIsoDate(date)
    const all = await db.table(TABLE).where('user_id').equals(userId).toArray()
    return all.find((entry) => entry.date === iso) || null
  },

  upsertForDate: async ({ userId, date, weight, weightUnit, mood, thoughts }) => {
    const iso = toIsoDate(date)
    const existing = await checkinService.getByDate(userId, iso)
    const now = nowIso()
    if (existing) {
      const updates = {
        weight: weight === '' || weight === null || weight === undefined ? existing.weight : Number(weight),
        weight_unit: weightUnit || existing.weight_unit,
        mood: mood ?? existing.mood,
        thoughts: thoughts ?? existing.thoughts,
        updated_at: now,
        synced_at: null,
      }
      await db.table(TABLE).update(existing.id, updates)
      const updated = await db.table(TABLE).get(existing.id)
      if (updated) queueUpsert(TABLE, updated)
      return updated
    }
    const checkin = {
      id: generateId(),
      user_id: userId,
      date: iso,
      weight: weight === '' || weight === null || weight === undefined ? null : Number(weight),
      weight_unit: weightUnit || 'kg',
      mood: mood || null,
      thoughts: thoughts || '',
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(TABLE).add(checkin)
    queueUpsert(TABLE, checkin)
    return checkin
  },
}
