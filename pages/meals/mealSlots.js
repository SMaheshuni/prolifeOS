// Single source of truth for the meal-slot list (type + display label +
// icon). Anything that renders breakfast/lunch/dinner/snack in the UI
// imports from here so the order, labels, and icons stay in lockstep.

import { Coffee, Sun, Moon, Cookie } from 'lucide-react'

export const MEAL_SLOTS = [
  { type: 'breakfast', label: 'Breakfast', Icon: Coffee },
  { type: 'lunch', label: 'Lunch', Icon: Sun },
  { type: 'dinner', label: 'Dinner', Icon: Moon },
  { type: 'snack', label: 'Snack', Icon: Cookie },
]
