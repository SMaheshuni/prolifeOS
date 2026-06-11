import { useState } from 'react'
import { Button, Input, Textarea, Select, DatePicker } from '@/components/ui'
import { MEAL_TYPES } from '@/utils/constants'
import { toIsoDate } from '@/utils/dateHelpers'

const toOptions = (values) => values.map((value) => ({ value, label: value }))

export default function MealForm({ initialMeal, defaultDate, defaultMealType, onSubmit, onCancel, isSubmitting = false }) {
  const [name, setName] = useState(initialMeal?.name || '')
  const [calories, setCalories] = useState(initialMeal?.calories ?? '')
  const [notes, setNotes] = useState(initialMeal?.notes || '')
  const [date, setDate] = useState(initialMeal?.date || (defaultDate ? toIsoDate(defaultDate) : ''))
  const [mealType, setMealType] = useState(initialMeal?.meal_type || defaultMealType || 'breakfast')
  const [errors, setErrors] = useState({})

  const handleSubmit = async () => {
    const result = await onSubmit({ name, calories, notes, date, mealType })
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
      <Input id="name" label="Meal name" value={name} onChange={setName} error={errors.name} required />
      <Select
        id="meal_type"
        label="Type"
        value={mealType}
        onChange={setMealType}
        options={toOptions(MEAL_TYPES)}
        required
        error={errors.meal_type}
      />
      <DatePicker id="date" label="Date" value={date} onChange={setDate} required error={errors.date} />
      <Input
        id="calories"
        label="Calories"
        type="number"
        value={calories}
        onChange={setCalories}
        inputMode="numeric"
        placeholder="Optional"
      />
      <Textarea id="notes" label="Notes" value={notes} onChange={setNotes} rows={3} />
      <div className="mt-md flex flex-col gap-sm">
        <Button type="submit" isLoading={isSubmitting} fullWidth>
          {initialMeal ? 'Save changes' : 'Add meal'}
        </Button>
        <Button variant="ghost" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </div>
    </form>
  )
}
