import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert, queueDelete } from '@/db/sync'

const TABLE = 'meal_favourites'

const findByName = async (userId, name) => {
  const lower = name.trim().toLowerCase()
  return db
    .table(TABLE)
    .where('user_id')
    .equals(userId)
    .filter((entry) => (entry.name || '').toLowerCase() === lower)
    .first()
}

export const favouritesService = {
  getAll: async (userId) =>
    db.table(TABLE).where('user_id').equals(userId).toArray(),

  add: async ({ userId, name, calories = null }) => {
    const trimmed = (name || '').trim()
    if (!trimmed) return null
    const existing = await findByName(userId, trimmed)
    const cleanCalories =
      calories === '' || calories === null || calories === undefined
        ? null
        : Number(calories)
    if (existing) {
      const next = {
        ...existing,
        name: trimmed,
        calories: cleanCalories,
        updated_at: nowIso(),
        synced_at: null,
      }
      await db.table(TABLE).put(next)
      queueUpsert(TABLE, next)
      return next
    }
    const now = nowIso()
    const record = {
      id: generateId(),
      user_id: userId,
      name: trimmed,
      calories: cleanCalories,
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(TABLE).add(record)
    queueUpsert(TABLE, record)
    return record
  },

  removeByName: async (userId, name) => {
    const existing = await findByName(userId, name)
    if (!existing) return
    await db.table(TABLE).delete(existing.id)
    queueDelete(TABLE, existing.id)
  },
}
