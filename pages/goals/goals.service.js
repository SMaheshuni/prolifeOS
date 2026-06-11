import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert, queueDelete } from '@/db/sync'

const TABLE = 'goals'

export const goalsService = {
  getAll: async (userId) => {
    return db.table(TABLE).where('user_id').equals(userId).toArray()
  },

  add: async ({
    userId,
    title,
    description = '',
    category = 'personal',
    targetValue = 1,
    unit = '',
    deadline = null,
  }) => {
    const now = nowIso()
    const goal = {
      id: generateId(),
      user_id: userId,
      title,
      description,
      category,
      target_value: Number(targetValue),
      current_value: 0,
      unit,
      deadline,
      status: 'active',
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(TABLE).add(goal)
    queueUpsert(TABLE, goal)
    return goal
  },

  update: async (id, updates) => {
    const next = { ...updates, updated_at: nowIso(), synced_at: null }
    await db.table(TABLE).update(id, next)
    const updated = await db.table(TABLE).get(id)
    if (updated) queueUpsert(TABLE, updated)
    return updated
  },

  incrementProgress: async (id, delta = 1) => {
    const current = await db.table(TABLE).get(id)
    if (!current) return null
    const nextValue = Math.max(0, current.current_value + delta)
    const isCompleted = nextValue >= current.target_value
    return goalsService.update(id, {
      current_value: nextValue,
      status: isCompleted ? 'completed' : current.status,
    })
  },

  setProgress: async (id, value) => {
    const current = await db.table(TABLE).get(id)
    if (!current) return null
    const clamped = Math.max(0, Math.min(current.target_value, Number(value) || 0))
    const isCompleted = clamped >= current.target_value
    const wasCompleted = current.status === 'completed'
    return goalsService.update(id, {
      current_value: clamped,
      status: isCompleted ? 'completed' : wasCompleted ? 'active' : current.status,
    })
  },

  remove: async (id) => {
    await db.table(TABLE).delete(id)
    queueDelete(TABLE, id)
  },
}
