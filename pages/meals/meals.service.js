import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert, queueDelete } from '@/db/sync'
import { toIsoDate } from '@/utils/dateHelpers'

const TABLE = 'meals'

export const mealsService = {
  getForDateRange: async (userId, startDate, endDate) => {
    const start = toIsoDate(startDate)
    const end = toIsoDate(endDate)
    const all = await db.table(TABLE).where('user_id').equals(userId).toArray()
    return all.filter((meal) => meal.date >= start && meal.date <= end)
  },

  add: async ({ userId, date, mealType, name, calories = null, notes = '' }) => {
    const now = nowIso()
    const meal = {
      id: generateId(),
      user_id: userId,
      date: toIsoDate(date),
      meal_type: mealType,
      name,
      calories: calories === '' || calories === null ? null : Number(calories),
      notes,
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(TABLE).add(meal)
    queueUpsert(TABLE, meal)
    return meal
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

  // Returns the user's most-used meal names with average calories.
  getFrequent: async (userId, limit = 5) => {
    const all = await db.table(TABLE).where('user_id').equals(userId).toArray()
    const map = new Map()
    for (const meal of all) {
      const name = (meal.name || '').trim()
      if (!name) continue
      const key = name.toLowerCase()
      if (!map.has(key)) {
        map.set(key, { name, count: 0, totalKcal: 0, kcalSamples: 0 })
      }
      const entry = map.get(key)
      entry.count += 1
      const kcal = Number(meal.calories)
      if (Number.isFinite(kcal) && kcal > 0) {
        entry.totalKcal += kcal
        entry.kcalSamples += 1
      }
    }
    return [...map.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((entry) => ({
        name: entry.name,
        count: entry.count,
        avgCalories: entry.kcalSamples > 0 ? Math.round(entry.totalKcal / entry.kcalSamples) : null,
      }))
  },
}
