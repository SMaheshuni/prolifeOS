import { useState } from 'react'
import { Button, Input } from '@/components/ui'

export default function HabitForm({ initialHabit, onSubmit, onCancel, isSubmitting = false }) {
  const [title, setTitle] = useState(initialHabit?.title || '')
  const [errors, setErrors] = useState({})

  const handleSubmit = async () => {
    const result = await onSubmit({ title })
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
        id="title"
        label="Habit"
        value={title}
        onChange={setTitle}
        error={errors.title}
        placeholder="e.g. Read 30 minutes"
        required
      />
      <div className="mt-md flex flex-col gap-sm">
        <Button type="submit" isLoading={isSubmitting} fullWidth>
          {initialHabit ? 'Save changes' : 'Add habit'}
        </Button>
        <Button variant="ghost" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </div>
    </form>
  )
}
