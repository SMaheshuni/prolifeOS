import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStore } from '@/store/syncStore'
import { showToast } from '@/store/toastStore'
import { tasksService } from '@/pages/tasks/tasks.service'
import { checkinService } from '@/pages/checkin/checkin.service'
import { challengeService } from '@/pages/challenge/challenge.service'
import { mealsService } from '@/pages/meals/meals.service'
import { activityService } from '@/pages/activity/activity.service'
import { habitsService } from '@/pages/habits/habits.service'
import { settingsService } from '@/pages/settings/settings.service'
import { isToday, toIsoDate } from '@/utils/dateHelpers'

export const useHomeData = () => {
  const { user } = useAuth()
  const lastSyncedAt = useSyncStore((state) => state.lastSyncedAt)
  const [tasks, setTasks] = useState([])
  const [todayCheckin, setTodayCheckin] = useState(null)
  const [latestCheckin, setLatestCheckin] = useState(null)
  const [weightHistory, setWeightHistory] = useState([])
  const [activeChallenge, setActiveChallenge] = useState(null)
  const [challengeStreak, setChallengeStreak] = useState(0)
  const [eatenCalories, setEatenCalories] = useState(0)
  const [burnedCalories, setBurnedCalories] = useState(0)
  const [todayActivitySessions, setTodayActivitySessions] = useState(0)
  const [todayActivityTypes, setTodayActivityTypes] = useState([])
  const [habitsTotal, setHabitsTotal] = useState(0)
  const [habitsDone, setHabitsDone] = useState(0)
  const [mealsByType, setMealsByType] = useState([])
  const [frequentMeals, setFrequentMeals] = useState([])
  const [dailyKcalGoal, setDailyKcalGoal] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  // Bumped each time a tracked count increases between loads. Wired
  // to BlobMascot so the mascot reacts to the user's progress without
  // every action site needing to know about the mascot.
  const [actionTick, setActionTick] = useState(0)
  const prevActionCountsRef = useRef(null)

  const load = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }
    try {
      const today = new Date()
      const todayIso = toIsoDate(today)
      const [
        allTasks,
        todayEntry,
        allCheckins,
        challenge,
        todayMeals,
        frequent,
        allActivities,
        allHabits,
        todayHabitLogs,
        settings,
      ] = await Promise.all([
        tasksService.getAll(user.id),
        checkinService.getByDate(user.id, today),
        checkinService.getAll(user.id),
        challengeService.getActive(user.id),
        mealsService.getForDateRange(user.id, today, today),
        mealsService.getFrequent(user.id, 8),
        activityService.getAll(user.id),
        habitsService.getAll(user.id),
        habitsService.getLogsForDate(user.id, today),
        settingsService.ensure(user.id),
      ])
        setFrequentMeals(frequent)

        setTasks(allTasks)
        setTodayCheckin(todayEntry)

        const sortedCheckins = [...allCheckins]
          .filter((entry) => entry.weight !== null && entry.weight !== undefined)
          .sort((a, b) => (a.date < b.date ? 1 : -1))
        setLatestCheckin(sortedCheckins[0] || null)
        setWeightHistory(
          sortedCheckins
            .slice(0, 7)
            .map((entry) => Number(entry.weight))
            .reverse()
        )

        setActiveChallenge(challenge)
        if (challenge) {
          const days = await challengeService.getDaysFor(challenge.id)
          setChallengeStreak(challengeService.computeStreak(challenge, days))
        } else {
          setChallengeStreak(0)
        }

        const eaten = todayMeals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0)
        const todayActivities = allActivities.filter((entry) => entry.date === todayIso)
        const burned = todayActivities.reduce(
          (sum, entry) => sum + (Number(entry.calories) || 0),
          0
        )
        setEatenCalories(eaten)
        setBurnedCalories(burned)
        setTodayActivitySessions(todayActivities.length)
        setTodayActivityTypes([...new Set(todayActivities.map((entry) => entry.type))])

        const activeHabits = allHabits.filter((h) => h.status === 'active')
        const activeHabitIds = new Set(activeHabits.map((h) => h.id))
        const doneCount = todayHabitLogs.filter((log) => activeHabitIds.has(log.habit_id)).length
        setHabitsTotal(activeHabits.length)
        setHabitsDone(doneCount)
        const MEAL_ORDER = ['breakfast', 'lunch', 'dinner', 'snack']
        const grouped = MEAL_ORDER
          .map((type) => ({
            type,
            calories: todayMeals
              .filter((m) => m.meal_type === type)
              .reduce((sum, m) => sum + (Number(m.calories) || 0), 0),
          }))
          .filter((seg) => seg.calories > 0)
        setMealsByType(grouped)
        setDailyKcalGoal(settings?.daily_kcal_goal ?? null)

        // Mascot action-reaction — bump the tick if any tracked count
        // grew since the previous load. Skipped on first load so the
        // initial mount doesn't trigger a reaction.
        const tasksDoneCount = allTasks.filter(
          (t) => t.due_date && toIsoDate(t.due_date) === todayIso && t.status === 'completed'
        ).length
        const currentCounts = {
          eaten,
          burned,
          sessions: todayActivities.length,
          habitsDone: doneCount,
          tasksDone: tasksDoneCount,
        }
        const prev = prevActionCountsRef.current
        if (prev) {
          const grew =
            currentCounts.eaten > prev.eaten ||
            currentCounts.burned > prev.burned ||
            currentCounts.sessions > prev.sessions ||
            currentCounts.habitsDone > prev.habitsDone ||
            currentCounts.tasksDone > prev.tasksDone
          if (grew) setActionTick((t) => t + 1)
        }
        prevActionCountsRef.current = currentCounts
    } catch {
      showToast({ message: 'Could not load home', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    load()
  }, [load, lastSyncedAt])

  const todayIso = toIsoDate(new Date())
  const todaysTasks = tasks.filter((task) => task.due_date && toIsoDate(task.due_date) === todayIso)
  const todoCount = todaysTasks.filter((task) => task.status === 'pending').length
  const completedToday = todaysTasks.filter((task) => task.status === 'completed').length
  const totalToday = todaysTasks.length

  const mascotState = computeMascotState({
    todayCheckin,
    todayActivitySessions,
  })

  return {
    isLoading,
    todoCount,
    completedToday,
    totalToday,
    todayCheckin,
    latestCheckin,
    weightHistory,
    activeChallenge,
    challengeStreak,
    isCheckedInToday: Boolean(todayCheckin),
    eatenCalories,
    burnedCalories,
    todayActivitySessions,
    todayActivityTypes,
    habitsTotal,
    habitsDone,
    mealsByType,
    frequentMeals,
    dailyKcalGoal,
    mascotState,
    actionTick,
    reload: load,
  }
}

// State machine for the mascot — driven by check-in + activity + mood,
// not calories (the calorie ring already shows that more precisely).
// The mascot reflects whether the user is engaging with their day.
// Five states:
//   snoozing     no check-in and no activity logged today
//   calm         one signal — checked in OR has activity, but not both
//   alert        engaged — checked in AND has activity
//   wired        engaged + good mood, OR multiple activity sessions
//   celebrating  engaged + great mood
// Bad/terrible moods stay observational — no judgment, no catastrophizing.
const computeMascotState = ({ todayCheckin, todayActivitySessions = 0 }) => {
  const hasCheckin = Boolean(todayCheckin)
  const hasActivity = todayActivitySessions > 0
  const mood = todayCheckin?.mood

  if (!hasCheckin && !hasActivity) return 'snoozing'
  if (hasCheckin && hasActivity && mood === 'great') return 'celebrating'
  if (hasCheckin && hasActivity && (mood === 'good' || todayActivitySessions >= 2))
    return 'wired'
  if (hasCheckin && hasActivity) return 'alert'
  return 'calm'
}

export const greetingForNow = (date = new Date()) => {
  const hour = date.getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const isTodayHelper = isToday
