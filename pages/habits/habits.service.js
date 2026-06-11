import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert, queueDelete } from '@/db/sync'
import { toIsoDate } from '@/utils/dateHelpers'

const HABITS = 'habits'
const LOGS = 'habit_logs'

export const habitsService = {
  getAll: async (userId) => {
    return db.table(HABITS).where('user_id').equals(userId).toArray()
  },

  getLogsForDate: async (userId, date) => {
    const iso = toIsoDate(date)
    const all = await db.table(LOGS).where('user_id').equals(userId).toArray()
    return all.filter((entry) => entry.date === iso)
  },

  getAllLogs: async (userId) => {
    return db.table(LOGS).where('user_id').equals(userId).toArray()
  },

  add: async ({ userId, title, icon = '' }) => {
    const now = nowIso()
    const habit = {
      id: generateId(),
      user_id: userId,
      title,
      icon,
      status: 'active',
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(HABITS).add(habit)
    queueUpsert(HABITS, habit)
    return habit
  },

  update: async (id, updates) => {
    const next = { ...updates, updated_at: nowIso(), synced_at: null }
    await db.table(HABITS).update(id, next)
    const updated = await db.table(HABITS).get(id)
    if (updated) queueUpsert(HABITS, updated)
    return updated
  },

  remove: async (id) => {
    const logs = await db.table(LOGS).where('habit_id').equals(id).toArray()
    await db.table(LOGS).bulkDelete(logs.map((log) => log.id))
    logs.forEach((log) => queueDelete(LOGS, log.id))
    await db.table(HABITS).delete(id)
    queueDelete(HABITS, id)
  },

  toggleForDate: async ({ userId, habitId, date, isDone }) => {
    const iso = toIsoDate(date)
    const all = await db.table(LOGS).where('habit_id').equals(habitId).toArray()
    const existing = all.find((entry) => entry.date === iso)

    if (isDone) {
      if (existing) return existing
      const log = {
        id: generateId(),
        habit_id: habitId,
        user_id: userId,
        date: iso,
        created_at: nowIso(),
        synced_at: null,
      }
      await db.table(LOGS).add(log)
      queueUpsert(LOGS, log)
      return log
    }

    if (existing) {
      await db.table(LOGS).delete(existing.id)
      queueDelete(LOGS, existing.id)
    }
    return null
  },
}
