import { useCallback, useEffect, useState } from 'react'
import { mealsService } from './meals.service'
import { favouritesService } from './favourites.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { startOfWeek, endOfWeek, addDays } from '@/utils/dateHelpers'
import { validateMeal } from '@/utils/validators'

export const useMeals = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [meals, setMeals] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      setIsLoading(true)
      try {
        const data = await mealsService.getForDateRange(user.id, weekStart, endOfWeek(weekStart))
        setMeals(data)
      } catch {
        showToast({ message: 'Could not load meals', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, weekStart, lastSyncedAt])

  const goToPreviousWeek = () => setWeekStart((prev) => addDays(prev, -7))
  const goToNextWeek = () => setWeekStart((prev) => addDays(prev, 7))
  const goToCurrentWeek = () => setWeekStart(startOfWeek(new Date()))

  const addMeal = async (input) => {
    const errors = validateMeal({ ...input, meal_type: input.mealType })
    if (errors) {
      showToast({ message: 'Please fix meal errors', type: 'error' })
      return { errors }
    }
    try {
      const created = await mealsService.add({ ...input, userId: user.id })
      setMeals((prev) => [...prev, created])
      showToast({ message: 'Meal added', type: 'success' })
      return { meal: created }
    } catch {
      showToast({ message: 'Could not add meal', type: 'error' })
      return { error: true }
    }
  }

  const updateMeal = async (id, updates) => {
    try {
      const updated = await mealsService.update(id, updates)
      setMeals((prev) => prev.map((meal) => (meal.id === id ? updated : meal)))
      showToast({ message: 'Meal updated', type: 'success' })
    } catch {
      showToast({ message: 'Could not update meal', type: 'error' })
    }
  }

  const deleteMeal = async (id) => {
    try {
      await mealsService.remove(id)
      setMeals((prev) => prev.filter((meal) => meal.id !== id))
      showToast({ message: 'Meal deleted', type: 'success' })
    } catch {
      showToast({ message: 'Could not delete meal', type: 'error' })
    }
  }

  return {
    weekStart,
    meals,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    addMeal,
    updateMeal,
    deleteMeal,
  }
}

export const useFavourites = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [favourites, setFavourites] = useState([])

  const reload = useCallback(async () => {
    if (!user?.id) return
    try {
      const data = await favouritesService.getAll(user.id)
      setFavourites(data)
    } catch {
      // Favourites failure shouldn't block meal logging — silent.
    }
  }, [user?.id])

  useEffect(() => {
    reload()
  }, [reload, lastSyncedAt])

  const isFavourite = useCallback(
    (name) => {
      if (!name) return false
      const lower = name.trim().toLowerCase()
      return favourites.some((f) => (f.name || '').toLowerCase() === lower)
    },
    [favourites]
  )

  const toggleFavourite = useCallback(
    async ({ name, calories }) => {
      if (!user?.id || !name) return
      const trimmed = name.trim()
      if (!trimmed) return
      try {
        if (isFavourite(trimmed)) {
          await favouritesService.removeByName(user.id, trimmed)
          showToast({ message: 'Removed from favourites', type: 'success' })
        } else {
          await favouritesService.add({ userId: user.id, name: trimmed, calories })
          showToast({ message: 'Added to favourites', type: 'success' })
        }
        await reload()
      } catch {
        showToast({ message: 'Could not update favourites', type: 'error' })
      }
    },
    [user?.id, isFavourite, reload]
  )

  return { favourites, isFavourite, toggleFavourite }
}
