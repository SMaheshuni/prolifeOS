import { tasksService } from '@/pages/tasks/tasks.service'
import { mealsService } from '@/pages/meals/meals.service'
import { goalsService } from '@/pages/goals/goals.service'
import { activityService } from '@/pages/activity/activity.service'
import { checkinService } from '@/pages/checkin/checkin.service'
import { startOfWeek, endOfWeek, toIsoDate } from '@/utils/dateHelpers'

const parseLocalDate = (iso) => {
  if (!iso) return null
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const buildAllDayEvent = ({ id, type, title, dateIso, payload }) => {
  const start = parseLocalDate(dateIso)
  if (!start) return null
  const end = new Date(start)
  return { id: `${type}:${id}`, type, title, start, end, allDay: true, resource: payload }
}

export const calendarService = {
  getDay: async (userId, date) => {
    const iso = toIsoDate(date)
    const [tasks, meals, activities, checkin, goals] = await Promise.all([
      tasksService.getAll(userId),
      mealsService.getForDateRange(userId, date, date),
      activityService.getAll(userId),
      checkinService.getByDate(userId, date),
      goalsService.getAll(userId),
    ])

    return {
      tasks: tasks.filter((task) => task.due_date && toIsoDate(task.due_date) === iso),
      meals,
      activities: activities.filter((entry) => entry.date === iso),
      checkin,
      goals: goals.filter((goal) => goal.deadline && toIsoDate(goal.deadline) === iso),
    }
  },

  getWeek: async (userId, anchor) => {
    const start = startOfWeek(anchor)
    const end = endOfWeek(anchor)
    const startIso = toIsoDate(start)
    const endIso = toIsoDate(end)

    const [tasks, meals, activities, checkins] = await Promise.all([
      tasksService.getAll(userId),
      mealsService.getForDateRange(userId, start, end),
      activityService.getAll(userId),
      checkinService.getAll(userId),
    ])

    const filteredTasks = tasks.filter((task) => {
      if (!task.due_date) return false
      const due = toIsoDate(task.due_date)
      return due >= startIso && due <= endIso
    })
    const filteredActivities = activities.filter(
      (entry) => entry.date >= startIso && entry.date <= endIso
    )
    const filteredCheckins = checkins.filter(
      (entry) => entry.date >= startIso && entry.date <= endIso
    )

    return { tasks: filteredTasks, meals, activities: filteredActivities, checkins: filteredCheckins }
  },

  getEvents: async (userId) => {
    const [tasks, meals, activities, checkins, goals] = await Promise.all([
      tasksService.getAll(userId),
      mealsService.getForDateRange(
        userId,
        new Date(2000, 0, 1),
        new Date(2100, 0, 1)
      ),
      activityService.getAll(userId),
      checkinService.getAll(userId),
      goalsService.getAll(userId),
    ])

    const events = []

    for (const task of tasks) {
      if (!task.due_date) continue
      const event = buildAllDayEvent({
        id: task.id,
        type: 'task',
        title: task.title,
        dateIso: toIsoDate(task.due_date),
        payload: task,
      })
      if (event) events.push(event)
    }

    for (const meal of meals) {
      const event = buildAllDayEvent({
        id: meal.id,
        type: 'meal',
        title: `${meal.meal_type}: ${meal.name}`,
        dateIso: meal.date,
        payload: meal,
      })
      if (event) events.push(event)
    }

    for (const entry of activities) {
      const event = buildAllDayEvent({
        id: entry.id,
        type: 'activity',
        title: `${entry.type} (${entry.duration_minutes}m)`,
        dateIso: entry.date,
        payload: entry,
      })
      if (event) events.push(event)
    }

    for (const entry of checkins) {
      const event = buildAllDayEvent({
        id: entry.id,
        type: 'checkin',
        title: `Check-in${entry.weight ? ` · ${entry.weight} ${entry.weight_unit || ''}` : ''}`,
        dateIso: entry.date,
        payload: entry,
      })
      if (event) events.push(event)
    }

    for (const goal of goals) {
      if (!goal.deadline) continue
      const event = buildAllDayEvent({
        id: goal.id,
        type: 'goal',
        title: `🎯 ${goal.title}`,
        dateIso: toIsoDate(goal.deadline),
        payload: goal,
      })
      if (event) events.push(event)
    }

    return events
  },
}
