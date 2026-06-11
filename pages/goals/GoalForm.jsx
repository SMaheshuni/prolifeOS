import { useState } from 'react'
import { Button, Input, Textarea, Select, DatePicker } from '@/components/ui'
import { GOAL_CATEGORIES } from '@/utils/constants'

const toOptions = (values) => values.map((value) => ({ value, label: value }))

export default function GoalForm({ initialGoal, onSubmit, onCancel, isSubmitting = false }) {
  const [title, setTitle] = useState(initialGoal?.title || '')
  const [description, setDescription] = useState(initialGoal?.description || '')
  const [category, setCategory] = useState(initialGoal?.category || 'personal')
  const [targetValue, setTargetValue] = useState(initialGoal?.target_value ?? '')
  const [unit, setUnit] = useState(initialGoal?.unit || '')
  const [deadline, setDeadline] = useState(initialGoal?.deadline || '')
  const [errors, setErrors] = useState({})

  const handleSubmit = async () => {
    const result = await onSubmit({
      title,
      description,
      category,
      targetValue,
      unit,
      deadline: deadline || null,
    })
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
      <Input id="title" label="Title" value={title} onChange={setTitle} error={errors.title} required />
      <Textarea id="description" label="Description" value={description} onChange={setDescription} rows={2} />
      <Select
        id="category"
        label="Category"
        value={category}
        onChange={setCategory}
        options={toOptions(GOAL_CATEGORIES)}
        required
      />
      <div className="grid grid-cols-2 gap-md">
        <Input
          id="target_value"
          label="Target"
          type="number"
          value={targetValue}
          onChange={setTargetValue}
          error={errors.target_value}
          inputMode="numeric"
        />
        <Input id="unit" label="Unit" value={unit} onChange={setUnit} placeholder="e.g. workouts" />
      </div>
      <DatePicker id="deadline" label="Deadline" value={deadline} onChange={setDeadline} />
      <div className="mt-md flex flex-col gap-sm">
        <Button type="submit" isLoading={isSubmitting} fullWidth>
          {initialGoal ? 'Save changes' : 'Add goal'}
        </Button>
        <Button variant="ghost" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </div>
    </form>
  )
}
