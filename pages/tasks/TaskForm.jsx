import { useState } from 'react'
import { Button, Input, Textarea, Select, DatePicker } from '@/components/ui'
import { TASK_PRIORITIES, TASK_TYPES, RECURRENCE_OPTIONS } from '@/utils/constants'

const toOptions = (values) => values.map((value) => ({ value, label: value }))

export default function TaskForm({ initialTask, onSubmit, onCancel, isSubmitting = false }) {
  const [title, setTitle] = useState(initialTask?.title || '')
  const [description, setDescription] = useState(initialTask?.description || '')
  const [type, setType] = useState(initialTask?.type || 'one-time')
  const [recurrence, setRecurrence] = useState(initialTask?.recurrence || '')
  const [priority, setPriority] = useState(initialTask?.priority || 'medium')
  const [dueDate, setDueDate] = useState(initialTask?.due_date || '')
  const [errors, setErrors] = useState({})

  const handleSubmit = async () => {
    const result = await onSubmit({
      title,
      description,
      type,
      recurrence: type === 'recurring' ? recurrence || null : null,
      priority,
      dueDate: dueDate || null,
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
      <Textarea id="description" label="Description" value={description} onChange={setDescription} rows={3} />
      <Select
        id="priority"
        label="Priority"
        value={priority}
        onChange={setPriority}
        options={toOptions(TASK_PRIORITIES)}
        required
      />
      <Select id="type" label="Type" value={type} onChange={setType} options={toOptions(TASK_TYPES)} required />
      {type === 'recurring' && (
        <Select
          id="recurrence"
          label="Recurrence"
          value={recurrence}
          onChange={setRecurrence}
          options={toOptions(RECURRENCE_OPTIONS)}
          required
        />
      )}
      <DatePicker id="due_date" label="Due date" value={dueDate} onChange={setDueDate} />
      <div className="mt-md flex flex-col gap-sm">
        <Button type="submit" isLoading={isSubmitting} fullWidth>
          {initialTask ? 'Save changes' : 'Add task'}
        </Button>
        <Button variant="ghost" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </div>
    </form>
  )
}
