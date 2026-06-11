import Dexie from 'dexie'
import { DB_NAME, TABLES } from './schema'

export const db = new Dexie(DB_NAME)

// Each version() must be a frozen historical snapshot — never reference
// the live TABLES export from a past version, or a future schema change
// will retroactively rewrite history and break in-place migrations.

// v1 — initial schema (pre-habits)
db.version(1).stores({
  tasks: 'id, user_id, status, due_date, type, synced_at, updated_at',
  meals: 'id, user_id, date, meal_type, synced_at, updated_at',
  goals: 'id, user_id, status, category, deadline, synced_at, updated_at',
  daily_checkins: 'id, user_id, date, synced_at, updated_at, [user_id+date]',
  activities: 'id, user_id, date, type, synced_at, updated_at',
  challenges: 'id, user_id, status, type, synced_at, updated_at',
  challenge_days: 'id, challenge_id, user_id, day_number, date, synced_at',
  user_settings: 'id, user_id, synced_at, updated_at',
})

// v2 — add habits + habit_logs
db.version(2).stores({
  tasks: 'id, user_id, status, due_date, type, synced_at, updated_at',
  meals: 'id, user_id, date, meal_type, synced_at, updated_at',
  goals: 'id, user_id, status, category, deadline, synced_at, updated_at',
  daily_checkins: 'id, user_id, date, synced_at, updated_at, [user_id+date]',
  activities: 'id, user_id, date, type, synced_at, updated_at',
  challenges: 'id, user_id, status, type, synced_at, updated_at',
  challenge_days: 'id, challenge_id, user_id, day_number, date, synced_at',
  user_settings: 'id, user_id, synced_at, updated_at',
  habits: 'id, user_id, status, synced_at, updated_at',
  habit_logs: 'id, habit_id, user_id, date, synced_at, [habit_id+date]',
})

// v3 — add meal_favourites
db.version(3).stores(TABLES)

export const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const nowIso = () => new Date().toISOString()

export const clearLocalDataForUser = async (userId) => {
  if (!userId) return
  const tableNames = Object.keys(TABLES)
  await db.transaction('rw', tableNames, async () => {
    for (const tableName of tableNames) {
      const table = db.table(tableName)
      await table.where('user_id').equals(userId).delete()
    }
  })
}
