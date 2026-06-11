// Meals card for a calendar day. Header shows two entry points side by
// side: a camera icon (snap a photo → vision pre-fills the sheet) and
// "+ Add" (open the empty sheet). Per-slot add buttons would be
// redundant — LogMealSheet picks the meal type.
//
// Each meal row: tap the row to edit, trailing trash icon to delete.
// No nested-button anti-pattern (the icon and the row body are siblings).

import { Plus, Trash2, UtensilsCrossed } from 'lucide-react'
import { Card, EmptyState } from '@/components/ui'
import ScanMealButton from '@/pages/meals/ScanMealButton'
import { MEAL_SLOTS } from '@/pages/meals/mealSlots'

const SLOT_ORDER = MEAL_SLOTS.map((s) => s.type)

const nextEmptySlot = (meals) =>
  SLOT_ORDER.find((type) => !meals.some((m) => m.meal_type === type)) || 'snack'

export default function DayMealsCard({
  meals = [],
  onAddMeal,
  onScanMeal,
  onEditMeal,
  onDeleteMeal,
}) {
  const totalKcal = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0)
  const isEmpty = meals.length === 0

  const groups = MEAL_SLOTS.map((slot) => ({
    ...slot,
    items: meals.filter((m) => m.meal_type === slot.type),
  })).filter((g) => g.items.length > 0)

  const handleAdd = () => onAddMeal?.(nextEmptySlot(meals))

  return (
    <Card>
      <div className="flex items-center gap-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-text">
          <UtensilsCrossed size={16} strokeWidth={1.75} />
        </span>
        <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
          Meals
        </span>
        {totalKcal > 0 && (
          <span className="text-micro text-muted">· {totalKcal} kcal</span>
        )}
        <div className="flex-1" />
        <ScanMealButton
          variant="chip"
          onCapture={(file) => onScanMeal?.(file, nextEmptySlot(meals))}
        />
        <button
          type="button"
          onClick={handleAdd}
          aria-label="Add meal"
          className="flex h-8 items-center gap-1.5 rounded-full bg-primary-light px-md text-label font-medium text-text transition active:scale-[0.97] hover:bg-primary"
        >
          <Plus size={14} strokeWidth={2.4} />
          Add
        </button>
      </div>

      {isEmpty ? (
        <div className="mt-md">
          <EmptyState
            icon={UtensilsCrossed}
            title="No meals yet"
            description="Tap the camera or + Add above"
          />
        </div>
      ) : (
        <ul className="mt-md flex flex-col gap-md">
          {groups.map(({ type, label, Icon, items }) => {
            const slotKcal = items.reduce(
              (sum, m) => sum + (Number(m.calories) || 0),
              0
            )
            return (
              <li key={type}>
                <div className="flex items-baseline justify-between gap-sm">
                  <span className="flex items-center gap-1.5 text-micro font-medium uppercase tracking-[0.18em] text-text">
                    <Icon size={12} strokeWidth={2} className="text-muted" />
                    {label}
                  </span>
                  {slotKcal > 0 && (
                    <span className="text-micro text-muted">{slotKcal} kcal</span>
                  )}
                </div>
                <ul className="mt-xs flex flex-col">
                  {items.map((meal) => (
                    <li
                      key={meal.id}
                      className="flex items-center justify-between gap-sm rounded-md py-1 transition hover:bg-primary-light/30"
                    >
                      <button
                        type="button"
                        onClick={() => onEditMeal?.(meal)}
                        className="flex flex-1 flex-col items-start text-left active:opacity-70"
                      >
                        <span className="text-body text-text">{meal.name}</span>
                        {(meal.calories !== null && meal.calories !== undefined) || meal.notes ? (
                          <span className="text-micro text-muted">
                            {meal.calories !== null && meal.calories !== undefined
                              ? `${meal.calories} kcal`
                              : ''}
                            {meal.calories && meal.notes ? ' · ' : ''}
                            {meal.notes || ''}
                          </span>
                        ) : null}
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${meal.name}`}
                        onClick={() => onDeleteMeal?.(meal)}
                        className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition hover:bg-danger-light hover:text-danger active:scale-95"
                      >
                        <Trash2 size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
