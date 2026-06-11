import { useEffect, useState } from 'react'
import { tasksService } from './tasks.service'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { validateTask } from '@/utils/validators'
import { celebrate } from '@/utils/celebrate'

export const useTasks = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    const load = async () => {
      try {
        const data = await tasksService.getAll(user.id)
        setTasks(data)
      } catch {
        showToast({ message: 'Could not load tasks', type: 'error' })
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [user?.id, lastSyncedAt])

  const addTask = async (input) => {
    const errors = validateTask(input)
    if (errors) {
      showToast({ message: 'Please fix task errors', type: 'error' })
      return { errors }
    }
    try {
      const created = await tasksService.add({ ...input, userId: user.id })
      setTasks((prev) => [...prev, created])
      showToast({ message: 'Task added', type: 'success' })
      return { task: created }
    } catch {
      showToast({ message: 'Could not add task', type: 'error' })
      return { error: true }
    }
  }

  const updateTask = async (id, updates) => {
    try {
      const updated = await tasksService.update(id, updates)
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)))
      showToast({ message: 'Task updated', type: 'success' })
    } catch {
      showToast({ message: 'Could not update task', type: 'error' })
    }
  }

  const toggleTask = async (id, isComplete) => {
    try {
      const updated = await tasksService.toggleComplete(id, isComplete)
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)))
      if (isComplete) celebrate()
    } catch {
      showToast({ message: 'Could not update task', type: 'error' })
    }
  }

  // Cycle through todo (pending) → progress (in_progress) → done
  // (completed) → todo. Triggered by tapping the status circle.
  const cycleTaskStatus = async (id) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const nextStatus =
      task.status === 'pending'
        ? 'in_progress'
        : task.status === 'in_progress'
          ? 'completed'
          : 'pending'
    try {
      const updated = await tasksService.setStatus(id, nextStatus)
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
      if (nextStatus === 'completed') celebrate()
    } catch {
      showToast({ message: 'Could not update task', type: 'error' })
    }
  }

  const deleteTask = async (id) => {
    try {
      await tasksService.remove(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
      showToast({ message: 'Task deleted', type: 'success' })
    } catch {
      showToast({ message: 'Could not delete task', type: 'error' })
    }
  }

  return { tasks, isLoading, addTask, updateTask, toggleTask, cycleTaskStatus, deleteTask }
}
