import { Pencil, Trash2 } from 'lucide-react'
import { Badge, Card, DraggableProgressBar, ProgressBar } from '@/components/ui'
import { formatDate } from '@/utils/formatters'

// Status reads off the bar (draggable for active, static otherwise) +
// the muted "paused"/"done" inline tag. No separate status badge — the
// visual cue carries the meaning, the badge was redundant.
const STATUS_INLINE = {
  paused: 'paused',
  completed: 'done',
}

export default function GoalCard({ goal, onSetProgress, onEdit, onDelete }) {
  const isActive = goal.status === 'active'
  const statusTag = STATUS_INLINE[goal.status]

  return (
    <Card>
      <div className="flex flex-col gap-md">
        <div className="flex items-start justify-between gap-sm">
          <div className="flex flex-1 flex-col gap-xs">
            <div className="flex items-center gap-xs">
              <h3 className="text-subheading font-medium text-text">{goal.title}</h3>
              {statusTag && (
                <span className="text-micro uppercase tracking-[0.16em] text-muted">
                  · {statusTag}
                </span>
              )}
            </div>
            {goal.description && (
              <p className="text-label text-muted">{goal.description}</p>
            )}
            {goal.category && (
              <Badge variant="muted">{goal.category}</Badge>
            )}
          </div>
          <div className="flex items-center">
            <button
              type="button"
              aria-label="Edit goal"
              onClick={() => onEdit(goal)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition hover:bg-primary-light hover:text-text active:scale-95"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              aria-label="Delete goal"
              onClick={() => onDelete(goal)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted transition hover:bg-danger-light hover:text-danger active:scale-95"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {isActive ? (
          <DraggableProgressBar
            value={goal.current_value}
            max={goal.target_value}
            unit={goal.unit || ''}
            label="Progress"
            onCommit={(next) => onSetProgress(goal.id, next)}
          />
        ) : (
          <ProgressBar
            value={goal.current_value}
            max={goal.target_value}
            label={goal.unit || 'Progress'}
          />
        )}

        {goal.deadline && (
          <p className="text-micro text-muted">Deadline {formatDate(goal.deadline)}</p>
        )}
      </div>
    </Card>
  )
}
