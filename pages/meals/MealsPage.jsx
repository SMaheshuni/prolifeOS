import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { BottomSheet, Modal, Card, Skeleton } from '@/components/ui'
import MealSlot from './MealSlot'
import MealForm from './MealForm'
import { useMeals } from './meals.hooks'
import { getWeekDays, toIsoDate } from '@/utils/dateHelpers'
import { MEAL_TYPES } from '@/utils/constants'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const formatRange = (start, end) => {
  const sameMonth = start.getMonth() === end.getMonth()
  if (sameMonth) {
    return `${SHORT_MONTHS[start.getMonth()]} ${start.getDate()} – ${end.getDate()}`
  }
  return `${SHORT_MONTHS[start.getMonth()]} ${start.getDate()} – ${SHORT_MONTHS[end.getMonth()]} ${end.getDate()}`
}

export default function MealsPage() {
  const {
    weekStart,
    meals,
    isLoading,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    addMeal,
    updateMeal,
    deleteMeal,
  } = useMeals()

  const [formContext, setFormContext] = useState(null)
  const [editingMeal, setEditingMeal] = useState(null)
  const [mealPendingDelete, setMealPendingDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])
  const weekRangeLabel = formatRange(weekDays[0], weekDays[6])

  const mealsByDayAndType = useMemo(() => {
    const map = {}
    for (const meal of meals) {
      if (!map[meal.date]) map[meal.date] = {}
      if (!map[meal.date][meal.meal_type]) map[meal.date][meal.meal_type] = []
      map[meal.date][meal.meal_type].push(meal)
    }
    return map
  }, [meals])

  const handleAdd = async (input) => {
    setIsSubmitting(true)
    const result = await addMeal(input)
    setIsSubmitting(false)
    if (!result?.errors && !result?.error) setFormContext(null)
    return result
  }

  const handleEditSubmit = async (input) => {
    setIsSubmitting(true)
    await updateMeal(editingMeal.id, {
      name: input.name,
      calories:
        input.calories === '' || input.calories === null || input.calories === undefined
          ? null
          : Number(input.calories),
      notes: input.notes,
      date: input.date,
      meal_type: input.mealType,
    })
    setIsSubmitting(false)
    setEditingMeal(null)
  }

  const handleConfirmDelete = async () => {
    if (!mealPendingDelete) return
    await deleteMeal(mealPendingDelete.id)
    setMealPendingDelete(null)
  }

  return (
    <>
      <TopBar
        pageName="Meals"
        contextPill={weekRangeLabel}
        onPillClick={goToCurrentWeek}
      />
      <PageWrapper>
        <div className="mb-md flex items-center justify-between gap-md">
          <h1 className="font-display text-heading font-bold text-text">Meals</h1>
          <div className="flex items-center gap-xs">
            <button
              type="button"
              aria-label="Previous week"
              onClick={goToPreviousWeek}
              className="flex h-11 w-11 items-center justify-center rounded-full glass text-text active:scale-95"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next week"
              onClick={goToNextWeek}
              className="flex h-11 w-11 items-center justify-center rounded-full glass text-text active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-md">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-md">
            {weekDays.map((day) => {
              const iso = toIsoDate(day)
              const dayMeals = mealsByDayAndType[iso] || {}
              const dayName = day.toLocaleDateString('en-US', { weekday: 'long' })
              const dayDate = `${SHORT_MONTHS[day.getMonth()]} ${day.getDate()}`
              return (
                <Card key={iso}>
                  <div className="mb-md flex items-baseline gap-sm">
                    <h3 className="text-subheading font-medium text-text">{dayName}</h3>
                    <span className="text-label text-muted">{dayDate}</span>
                  </div>
                  <div className="flex flex-col gap-sm">
                    {MEAL_TYPES.map((mealType) => (
                      <MealSlot
                        key={mealType}
                        mealType={mealType}
                        meals={dayMeals[mealType] || []}
                        onAdd={(type) => setFormContext({ date: iso, mealType: type })}
                        onEdit={setEditingMeal}
                        onDelete={setMealPendingDelete}
                      />
                    ))}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </PageWrapper>

      <BottomSheet isOpen={Boolean(formContext)} onClose={() => setFormContext(null)} title="New meal">
        {formContext && (
          <MealForm
            defaultDate={formContext.date}
            defaultMealType={formContext.mealType}
            onSubmit={handleAdd}
            onCancel={() => setFormContext(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </BottomSheet>

      <BottomSheet isOpen={Boolean(editingMeal)} onClose={() => setEditingMeal(null)} title="Edit meal">
        {editingMeal && (
          <MealForm
            initialMeal={editingMeal}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingMeal(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </BottomSheet>

      <Modal
        isOpen={Boolean(mealPendingDelete)}
        onClose={() => setMealPendingDelete(null)}
        title="Delete meal?"
        description={mealPendingDelete?.name}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
