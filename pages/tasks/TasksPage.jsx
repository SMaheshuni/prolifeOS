import { useMemo, useState } from 'react'
import { Plus, ListChecks } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, BottomSheet, Modal, Tabs, EmptyState, Skeleton } from '@/components/ui'
import TaskItem from './TaskItem'
import TaskForm from './TaskForm'
import TaskFilterChips from './TaskFilterChips'
import LogTaskSheet from './LogTaskSheet'
import { useTasks } from './tasks.hooks'
import {
  isToday,
  startOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from '@/utils/dateHelpers'

const SCOPE_TABS = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
]

const inScope = (task, scope) => {
  if (!task.due_date) return scope === 'all'
  const due = startOfDay(task.due_date).getTime()
  if (scope === 'today') return isToday(task.due_date)
  if (scope === 'week') {
    return due >= startOfWeek(new Date()).getTime() && due <= endOfWeek(new Date()).getTime()
  }
  if (scope === 'month') {
    return due >= startOfMonth(new Date()).getTime() && due <= endOfMonth(new Date()).getTime()
  }
  return true
}

const statusOf = (task) => {
  if (task.status === 'completed') return 'done'
  if (task.status === 'in_progress') return 'in_progress'
  return 'todo'
}

const matchesStatus = (task, filter) => {
  if (filter === 'all') return true
  return statusOf(task) === filter
}

const SCOPE_EMPTY_LINE = {
  today: "That's everything for today. Tap Add to plan ahead.",
  week: 'No tasks this week.',
  month: 'No tasks this month.',
}

export default function TasksPage() {
  const { tasks, isLoading, addTask, updateTask, cycleTaskStatus, deleteTask } = useTasks()
  const [scope, setScope] = useState('today')
  const [filter, setFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [taskPendingDelete, setTaskPendingDelete] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const scopedTasks = useMemo(
    () => tasks.filter((task) => inScope(task, scope)),
    [tasks, scope]
  )

  const counts = useMemo(() => {
    const result = { all: scopedTasks.length, todo: 0, in_progress: 0, done: 0 }
    for (const task of scopedTasks) result[statusOf(task)] += 1
    return result
  }, [scopedTasks])

  const visibleTasks = useMemo(
    () => scopedTasks.filter((task) => matchesStatus(task, filter)),
    [scopedTasks, filter]
  )

  const handleAdd = async ({ title, dueDate, priority }) => {
    setIsSubmitting(true)
    const result = await addTask({
      title,
      type: 'one-time',
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
    })
    setIsSubmitting(false)
    if (!result?.errors && !result?.error) setIsFormOpen(false)
  }

  const handleEditSubmit = async (input) => {
    setIsSubmitting(true)
    await updateTask(editingTask.id, {
      title: input.title,
      description: input.description,
      type: input.type,
      recurrence: input.recurrence,
      priority: input.priority,
      due_date: input.dueDate,
    })
    setIsSubmitting(false)
    setEditingTask(null)
  }

  const handleConfirmDelete = async () => {
    if (!taskPendingDelete) return
    await deleteTask(taskPendingDelete.id)
    setTaskPendingDelete(null)
  }

  return (
    <>
      <TopBar />
      <PageWrapper>
        <div className="flex flex-col gap-md">
          <div className="flex items-end justify-between gap-md">
            <div className="flex flex-col gap-0.5">
              <h1 className="font-display text-heading font-bold text-text">Tasks</h1>
              {counts.all > 0 && (
                <span className="text-micro text-muted">
                  {counts.done} of {counts.all} done · {SCOPE_TABS.find((t) => t.id === scope)?.label.toLowerCase()}
                </span>
              )}
            </div>
            <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsFormOpen(true)}>
              Add
            </Button>
          </div>

          <Tabs tabs={SCOPE_TABS} activeId={scope} onChange={setScope} />
          <TaskFilterChips counts={counts} active={filter} onChange={setFilter} />

          {isLoading ? (
            <div className="flex flex-col gap-sm">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          ) : scopedTasks.length === 0 ? (
            <EmptyState
              icon={ListChecks}
              title="No tasks here"
              description={SCOPE_EMPTY_LINE[scope]}
            />
          ) : (
            <ul className="flex flex-col gap-sm">
              {visibleTasks.map((task) => (
                <li key={task.id}>
                  <TaskItem
                    task={task}
                    onCycle={cycleTaskStatus}
                    onEdit={setEditingTask}
                    onDelete={setTaskPendingDelete}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </PageWrapper>

      <LogTaskSheet
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleAdd}
        isSubmitting={isSubmitting}
      />

      <BottomSheet isOpen={Boolean(editingTask)} onClose={() => setEditingTask(null)} title="Edit task">
        {editingTask && (
          <TaskForm
            initialTask={editingTask}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingTask(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </BottomSheet>

      <Modal
        isOpen={Boolean(taskPendingDelete)}
        onClose={() => setTaskPendingDelete(null)}
        title="Delete task?"
        description={taskPendingDelete?.title}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
