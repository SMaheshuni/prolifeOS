import {
  TASK_PRIORITIES,
  TASK_TYPES,
  RECURRENCE_OPTIONS,
  MEAL_TYPES,
  MOOD_OPTIONS,
  GOAL_CATEGORIES,
} from './constants'

export const validateEmail = (email) => {
  if (!email) return 'Email is required'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Enter a valid email'
  return null
}

export const validatePassword = (password) => {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

export const validateWeight = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const num = Number(value)
  if (Number.isNaN(num)) return 'Weight must be a number'
  if (num <= 0) return 'Weight must be greater than zero'
  if (num > 1000) return 'Weight is too large'
  return null
}

export const validateTask = (task) => {
  const errors = {}
  if (!task.title || !task.title.trim()) errors.title = 'Title is required'
  if (task.priority && !TASK_PRIORITIES.includes(task.priority)) errors.priority = 'Invalid priority'
  if (task.type && !TASK_TYPES.includes(task.type)) errors.type = 'Invalid type'
  if (task.recurrence && !RECURRENCE_OPTIONS.includes(task.recurrence)) errors.recurrence = 'Invalid recurrence'
  return Object.keys(errors).length ? errors : null
}

export const validateMeal = (meal) => {
  const errors = {}
  if (!meal.name || !meal.name.trim()) errors.name = 'Meal name is required'
  if (!meal.date) errors.date = 'Date is required'
  if (!meal.meal_type || !MEAL_TYPES.includes(meal.meal_type)) errors.meal_type = 'Invalid meal type'
  return Object.keys(errors).length ? errors : null
}

export const validateGoal = (goal) => {
  const errors = {}
  if (!goal.title || !goal.title.trim()) errors.title = 'Title is required'
  if (goal.category && !GOAL_CATEGORIES.includes(goal.category)) errors.category = 'Invalid category'
  if (goal.target_value !== undefined && goal.target_value !== null) {
    const target = Number(goal.target_value)
    if (Number.isNaN(target) || target <= 0) errors.target_value = 'Target must be a positive number'
  }
  return Object.keys(errors).length ? errors : null
}

export const validateCheckin = (checkin) => {
  const errors = {}
  if (!checkin.date) errors.date = 'Date is required'
  if (checkin.weight !== '' && checkin.weight !== null && checkin.weight !== undefined) {
    const weightError = validateWeight(checkin.weight)
    if (weightError) errors.weight = weightError
  }
  if (checkin.mood && !MOOD_OPTIONS.includes(checkin.mood)) errors.mood = 'Invalid mood'
  return Object.keys(errors).length ? errors : null
}

export const validateActivity = (activity) => {
  const errors = {}
  if (!activity.date) errors.date = 'Date is required'
  if (!activity.type || !activity.type.trim()) errors.type = 'Activity type is required'
  const duration = Number(activity.duration_minutes)
  if (Number.isNaN(duration) || duration <= 0) errors.duration_minutes = 'Duration must be a positive number'
  return Object.keys(errors).length ? errors : null
}
