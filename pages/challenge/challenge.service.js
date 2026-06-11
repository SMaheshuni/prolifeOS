import { db, generateId, nowIso } from '@/db/dexie.client'
import { queueUpsert, queueDelete } from '@/db/sync'
import { CHALLENGE_DURATIONS, CHALLENGE_RULES } from '@/utils/constants'
import { addDays, toIsoDate, daysBetween } from '@/utils/dateHelpers'

const CHALLENGES = 'challenges'
const DAYS = 'challenge_days'

const ALL_RULE_IDS = CHALLENGE_RULES.map((r) => r.id)
const TOTAL_RULES = ALL_RULE_IDS.length

// Normalize a day row so the rest of the app can rely on `rules_completed`.
// Legacy rows (written before the score migration) only have `completed`;
// treat completed=true as all five rules done, completed=false as none.
export const getRulesCompleted = (day) => {
  if (!day) return []
  if (Array.isArray(day.rules_completed)) return day.rules_completed
  return day.completed ? [...ALL_RULE_IDS] : []
}

export const isDayPerfect = (day) => getRulesCompleted(day).length === TOTAL_RULES

export const challengeService = {
  getActive: async (userId) => {
    const all = await db.table(CHALLENGES).where('user_id').equals(userId).toArray()
    return all.find((entry) => entry.status === 'active') || null
  },

  getDaysFor: async (challengeId) => {
    return db.table(DAYS).where('challenge_id').equals(challengeId).toArray()
  },

  start: async ({ userId, type }) => {
    const duration = CHALLENGE_DURATIONS[type]
    if (!duration) throw new Error('Invalid challenge type')
    const existing = await challengeService.getActive(userId)
    if (existing) throw new Error('Active challenge already exists')

    const now = nowIso()
    const startDate = toIsoDate(new Date())
    const challenge = {
      id: generateId(),
      user_id: userId,
      type,
      start_date: startDate,
      status: 'active',
      created_at: now,
      updated_at: now,
      synced_at: null,
    }
    await db.table(CHALLENGES).add(challenge)
    queueUpsert(CHALLENGES, challenge)

    const days = Array.from({ length: duration }, (_, index) => ({
      id: generateId(),
      challenge_id: challenge.id,
      user_id: userId,
      day_number: index + 1,
      date: toIsoDate(addDays(startDate, index)),
      rules_completed: [],
      notes: '',
      created_at: now,
      synced_at: null,
    }))
    await db.table(DAYS).bulkAdd(days)
    days.forEach((day) => queueUpsert(DAYS, day))

    return { challenge, days }
  },

  toggleRule: async (dayId, ruleId, on) => {
    const existing = await db.table(DAYS).get(dayId)
    if (!existing) return null
    const current = getRulesCompleted(existing)
    const next = on
      ? (current.includes(ruleId) ? current : [...current, ruleId])
      : current.filter((id) => id !== ruleId)
    const updates = {
      rules_completed: next,
      updated_at: nowIso(),
      synced_at: null,
    }
    await db.table(DAYS).update(dayId, updates)
    const updated = await db.table(DAYS).get(dayId)
    if (updated) queueUpsert(DAYS, updated)
    return updated
  },

  fail: async (challengeId) => {
    const updates = { status: 'failed', updated_at: nowIso(), synced_at: null }
    await db.table(CHALLENGES).update(challengeId, updates)
    const updated = await db.table(CHALLENGES).get(challengeId)
    if (updated) queueUpsert(CHALLENGES, updated)
    return updated
  },

  complete: async (challengeId) => {
    const updates = { status: 'completed', updated_at: nowIso(), synced_at: null }
    await db.table(CHALLENGES).update(challengeId, updates)
    const updated = await db.table(CHALLENGES).get(challengeId)
    if (updated) queueUpsert(CHALLENGES, updated)
    return updated
  },

  abandon: async (challengeId) => {
    const days = await db.table(DAYS).where('challenge_id').equals(challengeId).toArray()
    await db.table(DAYS).bulkDelete(days.map((day) => day.id))
    days.forEach((day) => queueDelete(DAYS, day.id))
    await db.table(CHALLENGES).delete(challengeId)
    queueDelete(CHALLENGES, challengeId)
  },

  // Streak = consecutive perfect days (all rules logged) starting from
  // day 1. Breaks the moment a past day was less than perfect — that's
  // the trade-off for an honest streak number.
  computeStreak: (challenge, days) => {
    if (!challenge) return 0
    const today = toIsoDate(new Date())
    const sorted = [...days].sort((a, b) => (a.day_number > b.day_number ? 1 : -1))
    let streak = 0
    for (const day of sorted) {
      if (day.date > today) break
      if (isDayPerfect(day)) streak += 1
      else streak = 0
    }
    return streak
  },

  // Total points = sum of rules logged across every day. Unlike the
  // streak this never resets — every rule logged is permanent credit.
  computeTotalPoints: (days) =>
    days.reduce((sum, day) => sum + getRulesCompleted(day).length, 0),

  daysElapsed: (challenge) => {
    if (!challenge) return 0
    return daysBetween(challenge.start_date, new Date()) + 1
  },
}
