export const CHALLENGE_TYPES = { THIRTY: '30-hard', SEVENTY_FIVE: '75-hard' }
export const CHALLENGE_DURATIONS = { '30-hard': 30, '75-hard': 75 }

export const CHALLENGE_RULES = [
  { id: 'clean_day', title: 'Clean Day', description: 'No alcohol, no outside food' },
  { id: 'activity', title: 'Activity', description: '5 km workout or movement' },
  { id: 'deep_work', title: 'Deep Work', description: '3 hours of focused work' },
  { id: 'hydration', title: 'Hydration', description: 'Drink 3 litres of water' },
  { id: 'daily_proof', title: 'Daily Proof', description: 'Log a photo of your day' },
]

export const MOOD_OPTIONS = ['great', 'good', 'okay', 'bad', 'terrible']
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
export const TASK_PRIORITIES = ['low', 'medium', 'high']
export const TASK_STATUSES = ['pending', 'in_progress', 'completed']
export const TASK_TYPES = ['one-time', 'recurring']
export const RECURRENCE_OPTIONS = ['daily', 'weekly', 'monthly']
export const GOAL_CATEGORIES = ['health', 'fitness', 'habit', 'personal', 'other']
export const GOAL_STATUSES = ['active', 'completed', 'paused']
export const WEIGHT_UNITS = ['kg', 'lbs']
export const DISTANCE_UNITS = ['km', 'miles']
export const THEME_OPTIONS = ['light', 'dark']
export const SEX_OPTIONS = ['male', 'female', 'other']
export const ACTIVITY_LEVELS = ['sedentary', 'light', 'moderate', 'active', 'very_active']
export const ACTIVITY_FACTORS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}
export const KCAL_PER_KG_FAT = 7700

export const DEFAULT_USER_SETTINGS = {
  weight_unit: 'kg',
  distance_unit: 'km',
  theme: 'light',
  sex: null,
  age: null,
  height_cm: null,
  activity_level: null,
  daily_kcal_goal: null,
}

export const SYNC_RETRY_DELAYS_MS = [1000, 5000, 15000, 60000]
export const TOAST_DURATION_SUCCESS_MS = 2000
export const TOAST_DURATION_ERROR_MS = 3000
