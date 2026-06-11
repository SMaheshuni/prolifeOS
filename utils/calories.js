import { ACTIVITY_FACTORS, KCAL_PER_KG_FAT } from './constants'

const toKg = (weight, unit) => {
  if (weight === null || weight === undefined || weight === '') return null
  const value = Number(weight)
  if (Number.isNaN(value)) return null
  return unit === 'lbs' ? value * 0.453592 : value
}

export const computeBmr = ({ sex, age, heightCm, weightKg }) => {
  if (!sex || !age || !heightCm || !weightKg) return null
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  if (sex === 'male') return base + 5
  if (sex === 'female') return base - 161
  return base - 78
}

export const computeMaintenance = ({ sex, age, heightCm, weightKg, activityLevel }) => {
  const bmr = computeBmr({ sex, age, heightCm, weightKg })
  if (bmr === null) return null
  const factor = ACTIVITY_FACTORS[activityLevel]
  if (!factor) return null
  return Math.round(bmr * factor)
}

export const computeMonthlyForecastKg = ({ dailyKcalGoal, maintenanceKcal }) => {
  if (!dailyKcalGoal || !maintenanceKcal) return null
  const dailyDelta = Number(dailyKcalGoal) - maintenanceKcal
  return (dailyDelta * 30) / KCAL_PER_KG_FAT
}

export const resolveWeightKg = (weight, unit) => toKg(weight, unit)
