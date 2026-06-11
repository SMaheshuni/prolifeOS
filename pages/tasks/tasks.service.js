import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert, queueDelete } from '@/db/sync'

const TABLE = 'tasks'

export const tasksService = {
  getAll: async (userId) => {
    return db.table(TABLE).where('user_id').equals(userId).toArray()
  },

  add: async ({ userId, title, description = '', type = 'one-time', recurrence = null, priority = 'medium', dueDate = null }) => {
    const now = nowIso()
    const task = {
      id: generateId(),
      user_id: userId,
      title,
      description,
      type,
      recurrence,
      priority,
      status: 'pending',
      due_date: dueDate,
      completed_at: null,
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(TABLE).add(task)
    queueUpsert(TABLE, task)
    return task
  },

  update: async (id, updates) => {
    const next = { ...updates, updated_at: nowIso(), synced_at: null }
    await db.table(TABLE).update(id, next)
    const updated = await db.table(TABLE).get(id)
    if (updated) queueUpsert(TABLE, updated)
    return updated
  },

  toggleComplete: async (id, isComplete) => {
    return tasksService.update(id, {
      status: isComplete ? 'completed' : 'pending',
      completed_at: isComplete ? nowIso() : null,
    })
  },

  setStatus: async (id, status) => {
    return tasksService.update(id, {
      status,
      completed_at: status === 'completed' ? nowIso() : null,
    })
  },

  remove: async (id) => {
    await db.table(TABLE).delete(id)
    queueDelete(TABLE, id)
  },
}
