export const DB_NAME = 'lifeos'
export const DB_VERSION = 3

export const TABLES = {
  tasks: 'id, user_id, status, due_date, type, synced_at, updated_at',
  meals: 'id, user_id, date, meal_type, synced_at, updated_at',
  meal_favourites: 'id, user_id, name, synced_at, updated_at',
  goals: 'id, user_id, status, category, deadline, synced_at, updated_at',
  daily_checkins: 'id, user_id, date, synced_at, updated_at, [user_id+date]',
  activities: 'id, user_id, date, type, synced_at, updated_at',
  challenges: 'id, user_id, status, type, synced_at, updated_at',
  challenge_days: 'id, challenge_id, user_id, day_number, date, synced_at',
  user_settings: 'id, user_id, synced_at, updated_at',
  habits: 'id, user_id, status, synced_at, updated_at',
  habit_logs: 'id, habit_id, user_id, date, synced_at, [habit_id+date]',
}
