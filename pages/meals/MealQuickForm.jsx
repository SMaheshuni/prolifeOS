// Focused inline meal form — name + kcal + notes only. Date and meal slot
// are passed in by the caller (calendar day, home meal slot) and locked,
// so the user never has to confirm them. Three visible fields total.

import { useState } from 'react'
import { Button, Input, Textarea } from '@/components/ui'

export default function MealQuickForm({ initialMeal, onSubmit, onCancel, isSubmitting = false }) {
  const [name, setName] = useState(initialMeal?.name || '')
  const [calories, setCalories] = useState(initialMeal?.calories ?? '')
  const [notes, setNotes] = useState(initialMeal?.notes || '')
  const [errors, setErrors] = useState({})

  const handleSubmit = async () => {
    const result = await onSubmit({ name, calories, notes })
    if (result?.errors) setErrors(result.errors)
  }

  return (
    <form
      className="flex flex-col gap-md"
      onSubmit={(e) => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Input
        id="name"
        label="What did you eat?"
        value={name}
        onChange={setName}
        error={errors.name}
        required
      />
      <Input
        id="calories"
        label="Calories"
        type="number"
        value={calories}
        onChange={setCalories}
        inputMode="numeric"
        placeholder="Optional"
      />
      <Textarea id="notes" label="Notes" value={notes} onChange={setNotes} rows={2} />
      <div className="mt-md flex flex-col gap-sm">
        <Button type="submit" isLoading={isSubmitting} fullWidth>
          {initialMeal ? 'Save' : 'Add'}
        </Button>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} fullWidth>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
