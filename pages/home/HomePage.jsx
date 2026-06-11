import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Target,
  Activity as ActivityIcon,
  Repeat,
  CheckSquare,
  ClipboardList,
  Calendar as CalendarIcon,
} from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import {
  BlobMascot,
  Button,
  CalorieRing,
  EmptyState,
  Skeleton,
} from '@/components/ui'
import LogMealSheet from '@/pages/meals/LogMealSheet'
import ScanMealButton from '@/pages/meals/ScanMealButton'
import CheckInSheet from './CheckInSheet'
import CalendarMonthSheet from './CalendarMonthSheet'
import MoodQuickPick from './MoodQuickPick'
import TodayGrid from './TodayGrid'
import Pips from './Pips'
import MoodDot from './MoodDot'
import { useCalendarDataDates } from '@/pages/calendar/calendar.hooks'
import { TYPE_META } from '@/pages/activity/activityTypes'
import { formatWeight, formatMonthShort, formatFullDate } from '@/utils/formatters'
import WeeklyCheckInChart from './WeeklyCheckInChart'
import { useHomeData, greetingForNow } from './home.hooks'
import { useFavourites } from '@/pages/meals/meals.hooks'
import { useAuth } from '@/hooks/useAuth'
import { mealsService } from '@/pages/meals/meals.service'
import { checkinService } from '@/pages/checkin/checkin.service'
import { showToast } from '@/store/toastStore'
import { getMealTypeForTime } from '@/utils/dateHelpers'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    isLoading,
    eatenCalories,
    burnedCalories,
    mealsByType,
    frequentMeals,
    dailyKcalGoal,
    mascotState,
    todayCheckin,
    todayActivitySessions,
    todayActivityTypes,
    habitsTotal,
    habitsDone,
    completedToday,
    totalToday,
    actionTick,
    reload,
  } = useHomeData()
  const [isLogMealOpen, setIsLogMealOpen] = useState(false)
  const [mealPendingPhoto, setMealPendingPhoto] = useState(null)
  const [isMealSubmitting, setIsMealSubmitting] = useState(false)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [isMoodPickOpen, setIsMoodPickOpen] = useState(false)
  const { favourites, toggleFavourite } = useFavourites()
  const dataDates = useCalendarDataDates()

  const handleCaptureMeal = (file) => {
    setMealPendingPhoto(file)
    setIsLogMealOpen(true)
  }

  const greeting = greetingForNow()
  const today = useMemo(() => new Date(), [])

  const handlePickDate = (date) => {
    setIsCalendarOpen(false)
    navigate('/calendar', { state: { selectedDate: date } })
  }

  const handleMoodPick = async (mood) => {
    if (!user?.id) return
    setIsMoodPickOpen(false)
    try {
      await checkinService.upsertForDate({
        userId: user.id,
        date: new Date(),
        mood,
      })
      await reload()
    } catch {
      showToast({ message: 'Could not save mood', type: 'error' })
    }
  }

  const handleLogMeal = async ({ mealType, name, calories }) => {
    if (!user?.id) return
    if (!name || name.trim() === '') return
    setIsMealSubmitting(true)
    try {
      await mealsService.add({
        userId: user.id,
        date: today,
        mealType,
        name: name.trim(),
        calories,
      })
      await reload()
      showToast({ message: 'Meal logged', type: 'success' })
      setIsLogMealOpen(false)
    } catch {
      showToast({ message: 'Could not log meal', type: 'error' })
    } finally {
      setIsMealSubmitting(false)
    }
  }

  return (
    <>
      <TopBar
        contextPill={
          <span className="inline-flex items-center gap-1.5">
            <CalendarIcon size={12} strokeWidth={2} />
            {formatMonthShort(today)}
          </span>
        }
        onPillClick={() => setIsCalendarOpen(true)}
      />
      <PageWrapper>
        {isLoading ? (
          <div className="flex flex-col gap-md">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-56 w-full" />
          </div>
        ) : (
          <div className="flex flex-col gap-lg">
            <div className="flex items-start justify-between gap-md">
              <div className="flex flex-col gap-xs">
                <span className="text-label text-muted">{formatFullDate(today)}</span>
                <h1 className="font-display text-display font-bold text-text leading-[1.05]">
                  {greeting}
                </h1>
              </div>
              <div className="relative">
                <BlobMascot
                  state={mascotState}
                  size={72}
                  mood={todayCheckin?.mood ?? null}
                  activitySessions={todayActivitySessions}
                  actionTick={actionTick}
                  onTap={() => setIsMoodPickOpen((o) => !o)}
                />
                <MoodQuickPick
                  isOpen={isMoodPickOpen}
                  selected={todayCheckin?.mood ?? null}
                  onPick={handleMoodPick}
                  onClose={() => setIsMoodPickOpen(false)}
                />
              </div>
            </div>

            {dailyKcalGoal ? (
              <CalorieRing
                goal={dailyKcalGoal}
                eaten={eatenCalories}
                burned={burnedCalories}
                segments={mealsByType}
              />
            ) : (
              <EmptyState
                icon={Target}
                title="Set a daily goal"
                description="powers the calorie ring & wakes up your mascot"
                actionLabel="Open profile"
                onAction={() => navigate('/profile')}
              />
            )}

            <div className="flex items-stretch gap-sm">
              <div className="flex-1">
                <ScanMealButton variant="labeled" onCapture={handleCaptureMeal} />
              </div>
              <div className="flex-1">
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Plus size={18} />}
                  onClick={() => setIsLogMealOpen(true)}
                >
                  Log meal
                </Button>
              </div>
            </div>

            <TodayGrid
              items={[
                {
                  icon: ClipboardList,
                  label: 'Check-in',
                  primary: todayCheckin?.weight
                    ? formatWeight(todayCheckin.weight, todayCheckin.weight_unit)
                    : todayCheckin?.mood
                      ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MoodDot mood={todayCheckin.mood} />
                          <span className="capitalize">{todayCheckin.mood}</span>
                        </span>
                      )
                      : 'Log today',
                  secondary:
                    todayCheckin?.weight && todayCheckin?.mood
                      ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MoodDot mood={todayCheckin.mood} />
                          <span>{todayCheckin.mood}</span>
                        </span>
                      )
                      : null,
                  active: isCheckInOpen,
                  onClick: () => setIsCheckInOpen(true),
                  ariaLabel: 'Daily check-in',
                },
                {
                  icon: ActivityIcon,
                  label: 'Activity',
                  primary:
                    todayActivitySessions > 0
                      ? `${todayActivitySessions} ${
                          todayActivitySessions === 1 ? 'session' : 'sessions'
                        }`
                      : 'Log activity',
                  secondary:
                    todayActivitySessions > 0 ? (
                      <span className="inline-flex items-center gap-1.5">
                        {todayActivityTypes.slice(0, 4).map((type) => {
                          const Meta = TYPE_META[type] || TYPE_META.custom
                          const TypeIcon = Meta.Icon
                          return (
                            <TypeIcon key={type} size={12} strokeWidth={1.75} />
                          )
                        })}
                        {burnedCalories > 0 && <span>{burnedCalories} kcal</span>}
                      </span>
                    ) : null,
                  onClick: () => navigate('/activity'),
                },
                {
                  icon: Repeat,
                  label: 'Habits',
                  visual:
                    habitsTotal > 0 ? (
                      <Pips total={habitsTotal} done={habitsDone} />
                    ) : null,
                  primary:
                    habitsTotal > 0
                      ? `${habitsDone} of ${habitsTotal} done`
                      : 'Add habits',
                  onClick: () => navigate('/goals'),
                },
                {
                  icon: CheckSquare,
                  label: 'Tasks',
                  visual:
                    totalToday > 0 ? (
                      <Pips total={totalToday} done={completedToday} />
                    ) : null,
                  primary:
                    totalToday > 0
                      ? `${completedToday} of ${totalToday} done`
                      : 'No tasks today',
                  onClick: () => navigate('/tasks'),
                },
              ]}
            />


            <WeeklyCheckInChart />
          </div>
        )}
      </PageWrapper>

      <LogMealSheet
        isOpen={isLogMealOpen}
        onClose={() => {
          setIsLogMealOpen(false)
          setMealPendingPhoto(null)
        }}
        defaultMealType={getMealTypeForTime(today)}
        frequentMeals={frequentMeals}
        favourites={favourites}
        onToggleFavourite={toggleFavourite}
        pendingPhoto={mealPendingPhoto}
        onSave={handleLogMeal}
        isSubmitting={isMealSubmitting}
      />

      <CheckInSheet
        isOpen={isCheckInOpen}
        onClose={() => {
          setIsCheckInOpen(false)
          reload()
        }}
      />

      <CalendarMonthSheet
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        today={today}
        hasDataIsoSet={dataDates}
        onPickDate={handlePickDate}
      />
    </>
  )
}
