// Log-task slide-up sheet — owns its BottomSheet so the Save button
// sits in the sticky footer. Title + due-date chips + priority chips.

import { useEffect, useState } from 'react'
import { BottomSheet, Button } from '@/components/ui'
import { addDays, toIsoDate } from '@/utils/dateHelpers'

const DUE_OPTIONS = [
  { id: 'today',    label: 'Today',     offset: 0 },
  { id: 'tomorrow', label: 'Tomorrow',  offset: 1 },
  { id: 'week',     label: 'This week', offset: 6 },
  { id: 'someday',  label: 'Someday',   offset: null },
]

const PRIORITY_OPTIONS = [
  { id: 'low',    label: 'Low' },
  { id: 'medium', label: 'Medium' },
  { id: 'high',   label: 'High' },
]

export default function LogTaskSheet({
  isOpen,
  onClose,
  defaultDue = 'today',
  defaultPriority = 'medium',
  title = 'Add task',
  onSave,
  isSubmitting = false,
}) {
  const [taskTitle, setTaskTitle] = useState('')
  const [due, setDue] = useState(defaultDue)
  const [priority, setPriority] = useState(defaultPriority)

  useEffect(() => {
    if (isOpen) {
      setTaskTitle('')
      setDue(defaultDue)
      setPriority(defaultPriority)
    }
  }, [isOpen, defaultDue, defaultPriority])

  const trimmed = taskTitle.trim()
  const isValid = trimmed.length > 0

  const handleSave = () => {
    if (!isValid) return
    const opt = DUE_OPTIONS.find((o) => o.id === due)
    const dueDate =
      opt?.offset === null ? null : toIsoDate(addDays(new Date(), opt?.offset || 0))
    onSave({ title: trimmed, dueDate, priority })
  }

  const footer = (
    <Button
      variant="primary"
      onClick={handleSave}
      isLoading={isSubmitting}
      disabled={!isValid}
      fullWidth
    >
      Add task
    </Button>
  )

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <label htmlFor="task_title" className="text-micro font-medium uppercase tracking-[0.16em] text-muted">
            What's the task?
          </label>
          <div className="flex h-12 items-center gap-sm rounded-md border border-border bg-surface px-md focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
            <input
              id="task_title"
              type="text"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Add a quick task"
              className="flex-1 bg-transparent text-body text-text outline-none placeholder:text-muted"
            />
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <span className="text-micro font-medium uppercase tracking-[0.16em] text-muted">
            Due
          </span>
          <div className="grid grid-cols-4 gap-xs">
            {DUE_OPTIONS.map((opt) => {
              const isActive = opt.id === due
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setDue(opt.id)}
                  className={`rounded-full px-sm py-xs text-label transition active:scale-[0.97] ${
                    isActive
                      ? 'bg-accent text-accent-ink'
                      : 'glass text-muted hover:text-text'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-xs">
          <span className="text-micro font-medium uppercase tracking-[0.16em] text-muted">
            Priority
          </span>
          <div className="grid grid-cols-3 gap-xs">
            {PRIORITY_OPTIONS.map((opt) => {
              const isActive = opt.id === priority
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setPriority(opt.id)}
                  className={`rounded-full px-sm py-xs text-label transition active:scale-[0.97] ${
                    isActive
                      ? 'bg-accent text-accent-ink'
                      : 'glass text-muted hover:text-text'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
