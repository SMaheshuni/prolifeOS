// Slim meal-slot row inside a day card. Matches PDF design — small bullet,
// meal type label, status text, tertiary "+ Add" coral pill on the right.
// Tap an existing meal to edit; tap trash to delete.

import { Plus, Pencil, Trash2 } from 'lucide-react'
import { titleCase } from '@/utils/formatters'

const SLOT_OPACITY_CLASS = {
  breakfast: 'opacity-100',
  lunch: 'opacity-80',
  dinner: 'opacity-60',
  snack: 'opacity-40',
}

export default function MealSlot({ mealType, meals = [], onAdd, onEdit, onDelete }) {
  const label = titleCase(mealType)
  const isEmpty = meals.length === 0
  const totalKcal = meals.reduce((sum, m) => sum + (Number(m.calories) || 0), 0)

  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-center gap-sm">
        <span
          aria-hidden="true"
          className={`h-1.5 w-1.5 rounded-full bg-accent ${SLOT_OPACITY_CLASS[mealType] ?? 'opacity-60'}`}
        />
        <span className="text-label text-text">{label}</span>
        <span className="flex-1 truncate text-micro text-muted">
          {isEmpty
            ? 'Not planned'
            : `${meals.length} item${meals.length === 1 ? '' : 's'}${
                totalKcal > 0 ? ` · ${totalKcal} kcal` : ''
              }`}
        </span>
        <button
          type="button"
          aria-label={`Add ${label}`}
          onClick={() => onAdd(mealType)}
          className="flex items-center gap-1 rounded-full bg-accent-light px-md py-1 text-label text-accent active:scale-[0.97] transition"
        >
          <Plus size={14} strokeWidth={2} />
          <span>Add</span>
        </button>
      </div>

      {!isEmpty && (
        <ul className="ml-md flex flex-col gap-xs">
          {meals.map((meal) => (
            <li key={meal.id} className="flex items-center justify-between gap-sm">
              <button
                type="button"
                onClick={() => onEdit(meal)}
                className="flex flex-1 flex-col items-start gap-0.5 text-left active:opacity-70"
              >
                <span className="text-label text-text">{meal.name}</span>
                {meal.calories !== null && meal.calories !== undefined && (
                  <span className="text-micro text-muted">{meal.calories} kcal</span>
                )}
              </button>
              <button
                type="button"
                aria-label="Edit"
                onClick={() => onEdit(meal)}
                className="flex h-11 w-11 items-center justify-center rounded-md text-muted hover:bg-primary-light hover:text-text"
              >
                <Pencil size={16} />
              </button>
              <button
                type="button"
                aria-label="Delete"
                onClick={() => onDelete(meal)}
                className="flex h-11 w-11 items-center justify-center rounded-md text-danger hover:bg-danger-light"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
