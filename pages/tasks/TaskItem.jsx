// Task row — 3-state status circle + tappable body + trailing trash.
// Tap the circle to cycle todo → progress → done → todo. Tap the body
// to edit. Tap the trash to delete (parent shows the confirm modal).
// Overdue tasks (due in the past, not done) get a small danger dot on
// the date.

import { Check } from 'lucide-react'
import { Card } from '@/components/ui'
import { Trash2 } from 'lucide-react'
import { formatDate, formatTime } from '@/utils/formatters'
import { startOfDay } from '@/utils/dateHelpers'

const taskTime = (task) => {
  if (task.due_time) return formatTime(task.due_time)
  if (task.due_date) return formatDate(task.due_date)
  return ''
}

const isOverdue = (task) => {
  if (!task.due_date || task.status === 'completed') return false
  return startOfDay(task.due_date).getTime() < startOfDay(new Date()).getTime()
}

const PRIORITY_STYLES = {
  high: 'text-danger',
  medium: 'text-accent',
  low: 'text-muted',
}

const PRIORITY_LABEL = {
  high: 'High',
  medium: 'Med',
  low: 'Low',
}

const StatusCircle = ({ status }) => {
  if (status === 'completed') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-success bg-success text-white">
        <Check size={14} strokeWidth={2.4} />
      </span>
    )
  }
  if (status === 'in_progress') {
    return (
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-accent">
        <span className="h-2 w-2 rounded-full bg-accent" />
      </span>
    )
  }
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border" />
  )
}

export default function TaskItem({ task, onCycle, onEdit, onDelete }) {
  const isComplete = task.status === 'completed'
  const overdue = isOverdue(task)
  const priorityClass = isComplete
    ? 'text-muted/70'
    : PRIORITY_STYLES[task.priority] || 'text-muted'
  const priorityLabel = PRIORITY_LABEL[task.priority]
  const time = taskTime(task)

  return (
    <Card className="!p-md">
      <div className="flex items-center gap-sm">
        <button
          type="button"
          aria-label="Cycle status"
          onClick={() => onCycle?.(task.id)}
          className="flex h-11 w-11 shrink-0 items-center justify-center active:scale-95 transition"
        >
          <StatusCircle status={task.status} />
        </button>
        <button
          type="button"
          onClick={() => onEdit?.(task)}
          className="flex flex-1 items-center gap-md text-left transition active:translate-y-0 hover:translate-y-[-1px]"
        >
          <div className="flex flex-1 flex-col gap-0.5">
            <span
              className={`text-body ${
                isComplete ? 'text-muted line-through' : 'text-text'
              }`}
            >
              {task.title}
            </span>
            {priorityLabel && (
              <span className={`text-micro font-medium ${priorityClass}`}>
                {priorityLabel}
              </span>
            )}
          </div>
          {time && (
            <span
              className={`flex shrink-0 items-center gap-1 text-micro ${
                overdue ? 'text-danger font-medium' : 'text-muted'
              }`}
            >
              {overdue && (
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-danger" />
              )}
              {time}
            </span>
          )}
        </button>
        {onDelete && (
          <button
            type="button"
            aria-label={`Delete ${task.title}`}
            onClick={() => onDelete(task)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted transition hover:bg-danger-light hover:text-danger active:scale-95"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
    </Card>
  )
}
