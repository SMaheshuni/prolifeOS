import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Activity as ActivityIcon,
  ClipboardList,
  Flame,
  Target,
} from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { BottomSheet, Modal, Skeleton } from '@/components/ui'
import { useCalendarDay, useCalendarDataDates } from './calendar.hooks'
import MonthGrid from './MonthGrid'
import WeekStrip from './WeekStrip'
import DayMealsCard from './DayMealsCard'
import DayActivityCard from './DayActivityCard'
import DaySnapshotTile from './DaySnapshotTile'
import DaySectionRow from './DaySectionRow'
import MealQuickForm from '@/pages/meals/MealQuickForm'
import LogMealSheet from '@/pages/meals/LogMealSheet'
import LogActivitySheet from '@/pages/activity/LogActivitySheet'
import LogTaskSheet from '@/pages/tasks/LogTaskSheet'
import { CheckInForm } from '@/pages/home/InlineCheckIn'
import { useActivities } from '@/pages/activity/activity.hooks'
import { useTasks } from '@/pages/tasks/tasks.hooks'
import { useFavourites } from '@/pages/meals/meals.hooks'
import { addDays, isToday, startOfWeek } from '@/utils/dateHelpers'
import { formatWeight } from '@/utils/formatters'

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export default function CalendarPage() {
  const today = useMemo(() => new Date(), [])
  const location = useLocation()
  const incomingDate = location.state?.selectedDate
  const [selectedDate, setSelectedDate] = useState(() =>
    incomingDate ? new Date(incomingDate) : today
  )
  const [isMonthView, setIsMonthView] = useState(false)
  const navigate = useNavigate()

  const {
    data: dayData,
    isLoading: isDayLoading,
    frequentMeals,
    addMeal,
    updateMeal,
    deleteMeal,
  } = useCalendarDay(selectedDate)
  const dataDates = useCalendarDataDates()

  const [mealSlotToAdd, setMealSlotToAdd] = useState(null)
  const [mealPendingPhoto, setMealPendingPhoto] = useState(null)
  const [mealToEdit, setMealToEdit] = useState(null)
  const [mealPendingDelete, setMealPendingDelete] = useState(null)
  const { favourites, toggleFavourite } = useFavourites()
  const [isCheckinOpen, setIsCheckinOpen] = useState(false)
  const [isActivityOpen, setIsActivityOpen] = useState(false)
  const [isTaskOpen, setIsTaskOpen] = useState(false)
  const [isMealSubmitting, setIsMealSubmitting] = useState(false)
  const [isActivitySubmitting, setIsActivitySubmitting] = useState(false)
  const [isTaskSubmitting, setIsTaskSubmitting] = useState(false)

  const { addActivity, updateActivity, deleteActivity } = useActivities()
  const { addTask } = useTasks()
  const [activityToEdit, setActivityToEdit] = useState(null)
  const [activityPendingDelete, setActivityPendingDelete] = useState(null)

  const handleLogActivity = async ({ type, durationMinutes, calories }) => {
    setIsActivitySubmitting(true)
    if (activityToEdit) {
      await updateActivity(activityToEdit.id, {
        type,
        duration_minutes: Number(durationMinutes),
        calories: calories === '' || calories === null ? null : Number(calories),
      })
      setActivityToEdit(null)
    } else {
      const result = await addActivity({
        date: selectedDate,
        type,
        durationMinutes,
        calories,
      })
      if (!result?.errors && !result?.error) setIsActivityOpen(false)
    }
    setIsActivitySubmitting(false)
  }

  const handleDeleteActivity = async () => {
    if (!activityPendingDelete) return
    await deleteActivity(activityPendingDelete.id)
    setActivityPendingDelete(null)
  }

  const handleLogTask = async ({ title, dueDate, priority }) => {
    setIsTaskSubmitting(true)
    const result = await addTask({
      title,
      type: 'one-time',
      priority: priority || 'medium',
      dueDate: dueDate || undefined,
    })
    setIsTaskSubmitting(false)
    if (!result?.errors && !result?.error) setIsTaskOpen(false)
  }

  const weekAnchor = useMemo(() => startOfWeek(selectedDate), [selectedDate])
  const monthAnchor = useMemo(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1),
    [selectedDate]
  )
  const monthPillLabel = `${SHORT_MONTHS[selectedDate.getMonth()]} ${selectedDate.getFullYear()}`

  const dayCaption = isToday(selectedDate)
    ? `Today · ${SHORT_MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`
    : `${SHORT_MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}`

  const goPrev = () => {
    if (isMonthView) setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))
    else setSelectedDate((d) => addDays(d, -7))
  }
  const goNext = () => {
    if (isMonthView) setSelectedDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))
    else setSelectedDate((d) => addDays(d, 7))
  }

  const dayKcal = useMemo(
    () => dayData.meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0),
    [dayData.meals]
  )

  const handleAddMeal = async ({ mealType, name, calories }) => {
    setIsMealSubmitting(true)
    const result = await addMeal({ mealType: mealType || mealSlotToAdd, name, calories })
    setIsMealSubmitting(false)
    if (result?.ok) setMealSlotToAdd(null)
    return result
  }

  const handleUpdateMeal = async ({ name, calories, notes }) => {
    setIsMealSubmitting(true)
    const result = await updateMeal(mealToEdit.id, { name, calories, notes })
    setIsMealSubmitting(false)
    if (result?.ok) setMealToEdit(null)
    return result
  }

  const handleConfirmDeleteMeal = async () => {
    if (!mealPendingDelete) return
    await deleteMeal(mealPendingDelete.id)
    setMealPendingDelete(null)
  }

  return (
    <>
      <TopBar
        contextPill={monthPillLabel}
        onPillClick={() => setIsMonthView((v) => !v)}
      />
      <PageWrapper>
        <div className="flex flex-col gap-md">
          {isMonthView ? (
            <>
              <div className="flex items-center justify-between gap-md">
                <button
                  type="button"
                  aria-label="Previous month"
                  onClick={goPrev}
                  className="flex h-11 w-11 items-center justify-center rounded-full glass text-text active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="font-display text-subheading font-medium text-text">
                  {FULL_MONTHS[monthAnchor.getMonth()]} {monthAnchor.getFullYear()}
                </span>
                <button
                  type="button"
                  aria-label="Next month"
                  onClick={goNext}
                  className="flex h-11 w-11 items-center justify-center rounded-full glass text-text active:scale-95"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
              <MonthGrid
                anchor={monthAnchor}
                selectedDate={selectedDate}
                onSelectDate={(d) => {
                  setSelectedDate(d)
                  setIsMonthView(false)
                }}
                hasDataIsoSet={dataDates}
              />
            </>
          ) : (
            <div className="flex items-center gap-sm">
              <button
                type="button"
                aria-label="Previous week"
                onClick={goPrev}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full glass text-text active:scale-95"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex-1">
                <WeekStrip
                  anchor={weekAnchor}
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  hasDataIsoSet={dataDates}
                />
              </div>
              <button
                type="button"
                aria-label="Next week"
                onClick={goNext}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full glass text-text active:scale-95"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <span className="text-micro font-medium uppercase tracking-[0.22em] text-muted">
            {dayCaption}
          </span>

          {isDayLoading ? (
            <div className="flex flex-col gap-sm">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              <div className="flex gap-sm">
                <DaySnapshotTile
                  icon={ClipboardList}
                  label="Check-in"
                  value={
                    dayData.checkin?.weight
                      ? formatWeight(dayData.checkin.weight, dayData.checkin.weight_unit)
                      : null
                  }
                  emptyCta="Log weight"
                  onClick={() => setIsCheckinOpen(true)}
                />
                <DaySnapshotTile
                  icon={Flame}
                  label="Calories"
                  value={dayKcal > 0 ? `${dayKcal} kc` : null}
                  emptyCta="0 kc"
                />
              </div>

              <DayMealsCard
                meals={dayData.meals}
                onAddMeal={(slotType) => setMealSlotToAdd(slotType)}
                onScanMeal={(file, slotType) => {
                  setMealPendingPhoto(file)
                  setMealSlotToAdd(slotType)
                }}
                onEditMeal={setMealToEdit}
                onDeleteMeal={setMealPendingDelete}
              />


              {dayData.activities.length > 0 ? (
                <DayActivityCard
                  activities={dayData.activities}
                  onAdd={() => setIsActivityOpen(true)}
                  onEdit={(a) => setActivityToEdit(a)}
                  onDelete={(a) => setActivityPendingDelete(a)}
                />
              ) : (
                <DaySectionRow
                  icon={ActivityIcon}
                  label="Activity"
                  summary="No activity logged"
                  onAdd={() => setIsActivityOpen(true)}
                />
              )}

              <DaySectionRow
                icon={CheckSquare}
                label="Tasks"
                summary={
                  dayData.tasks.length > 0
                    ? `${dayData.tasks.filter((t) => t.status === 'completed').length}/${dayData.tasks.length} done`
                    : 'No tasks for this day'
                }
                onAdd={() => setIsTaskOpen(true)}
              />

              {dayData.goals.length > 0 && (
                <DaySectionRow
                  icon={Target}
                  label="Goals"
                  summary={`${dayData.goals.length} deadline${dayData.goals.length === 1 ? '' : 's'}`}
                  onAdd={() => navigate('/goals')}
                />
              )}
            </>
          )}
        </div>
      </PageWrapper>

      <LogMealSheet
        isOpen={Boolean(mealSlotToAdd)}
        onClose={() => {
          setMealSlotToAdd(null)
          setMealPendingPhoto(null)
        }}
        defaultMealType={mealSlotToAdd || 'breakfast'}
        frequentMeals={frequentMeals}
        favourites={favourites}
        onToggleFavourite={toggleFavourite}
        pendingPhoto={mealPendingPhoto}
        onSave={handleAddMeal}
        isSubmitting={isMealSubmitting}
      />

      <BottomSheet
        isOpen={Boolean(mealToEdit)}
        onClose={() => setMealToEdit(null)}
        title={mealToEdit ? `Edit ${mealToEdit.meal_type}` : 'Edit meal'}
      >
        {mealToEdit && (
          <MealQuickForm
            initialMeal={mealToEdit}
            onSubmit={handleUpdateMeal}
            onCancel={() => setMealToEdit(null)}
            isSubmitting={isMealSubmitting}
          />
        )}
      </BottomSheet>

      <Modal
        isOpen={Boolean(mealPendingDelete)}
        onClose={() => setMealPendingDelete(null)}
        title="Delete meal?"
        description={mealPendingDelete?.name}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDeleteMeal}
      />

      <BottomSheet
        isOpen={isCheckinOpen}
        onClose={() => setIsCheckinOpen(false)}
        title="Daily check-in"
      >
        <CheckInForm onClose={() => setIsCheckinOpen(false)} />
      </BottomSheet>

      <LogActivitySheet
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
        onSave={handleLogActivity}
        isSubmitting={isActivitySubmitting}
      />

      <LogActivitySheet
        isOpen={Boolean(activityToEdit)}
        onClose={() => setActivityToEdit(null)}
        defaultType={activityToEdit?.type || 'gym'}
        title="Edit activity"
        onSave={handleLogActivity}
        isSubmitting={isActivitySubmitting}
      />

      <Modal
        isOpen={Boolean(activityPendingDelete)}
        onClose={() => setActivityPendingDelete(null)}
        title="Delete activity?"
        description={activityPendingDelete?.type}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDeleteActivity}
      />

      <LogTaskSheet
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        onSave={handleLogTask}
        isSubmitting={isTaskSubmitting}
      />
    </>
  )
}
