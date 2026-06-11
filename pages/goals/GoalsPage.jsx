import { useMemo, useState } from 'react'
import { Plus, Target, Repeat } from 'lucide-react'
import TopBar from '@/components/layout/TopBar'
import PageWrapper from '@/components/layout/PageWrapper'
import { Button, BottomSheet, Modal, EmptyState, Skeleton } from '@/components/ui'
import GoalCard from './GoalCard'
import GoalForm from './GoalForm'
import { useGoals } from './goals.hooks'
import HabitItem from '@/pages/habits/HabitItem'
import HabitForm from '@/pages/habits/HabitForm'
import { useHabits } from '@/pages/habits/habits.hooks'

const sortGoals = (goals) => {
  const order = { active: 0, paused: 1, completed: 2 }
  return [...goals].sort((a, b) => (order[a.status] ?? 3) - (order[b.status] ?? 3))
}

export default function GoalsPage() {
  const { goals, isLoading: goalsLoading, addGoal, updateGoal, setGoalProgress, deleteGoal } = useGoals()
  const {
    habits,
    doneTodayIds,
    completedDatesByHabit,
    isLoading: habitsLoading,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabitOnDate,
  } = useHabits()

  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState(null)
  const [goalPendingDelete, setGoalPendingDelete] = useState(null)

  const [isHabitFormOpen, setIsHabitFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)
  const [habitPendingDelete, setHabitPendingDelete] = useState(null)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const sortedGoals = useMemo(() => sortGoals(goals), [goals])

  const goalCounts = useMemo(() => {
    const counts = { active: 0, paused: 0, completed: 0 }
    for (const g of goals) counts[g.status] = (counts[g.status] || 0) + 1
    return counts
  }, [goals])

  const habitsDoneToday = doneTodayIds?.size ?? 0

  const handleAddGoal = async (input) => {
    setIsSubmitting(true)
    const result = await addGoal(input)
    setIsSubmitting(false)
    if (!result?.errors && !result?.error) setIsGoalFormOpen(false)
    return result
  }

  const handleEditGoalSubmit = async (input) => {
    setIsSubmitting(true)
    await updateGoal(editingGoal.id, {
      title: input.title,
      description: input.description,
      category: input.category,
      target_value: Number(input.targetValue),
      unit: input.unit,
      deadline: input.deadline,
    })
    setIsSubmitting(false)
    setEditingGoal(null)
  }

  const handleAddHabit = async (input) => {
    setIsSubmitting(true)
    const result = await addHabit(input)
    setIsSubmitting(false)
    if (!result?.errors && !result?.error) setIsHabitFormOpen(false)
    return result
  }

  const handleEditHabitSubmit = async (input) => {
    setIsSubmitting(true)
    await updateHabit(editingHabit.id, { title: input.title })
    setIsSubmitting(false)
    setEditingHabit(null)
  }

  const handleConfirmDeleteGoal = async () => {
    if (!goalPendingDelete) return
    await deleteGoal(goalPendingDelete.id)
    setGoalPendingDelete(null)
  }

  const handleConfirmDeleteHabit = async () => {
    if (!habitPendingDelete) return
    await deleteHabit(habitPendingDelete.id)
    setHabitPendingDelete(null)
  }

  return (
    <>
      <TopBar />
      <PageWrapper>
        <div className="flex flex-col gap-lg">
          {/* Habits */}
          <section className="flex flex-col gap-md">
            <div className="flex items-end justify-between gap-md">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-display text-heading font-bold text-text">Habits</h2>
                {habits.length > 0 && (
                  <span className="text-micro text-muted">
                    {habitsDoneToday} of {habits.length} done · today
                  </span>
                )}
              </div>
              <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsHabitFormOpen(true)}>
                Add
              </Button>
            </div>

            {habitsLoading ? (
              <Skeleton className="h-16 w-full" />
            ) : habits.length === 0 ? (
              <EmptyState
                icon={Repeat}
                title="No habits yet"
                description="Start small — one habit at a time"
              />
            ) : (
              <ul className="flex flex-col gap-sm">
                {habits.map((habit) => (
                  <li key={habit.id}>
                    <HabitItem
                      habit={habit}
                      completedDates={completedDatesByHabit.get(habit.id) || new Set()}
                      onToggle={toggleHabitOnDate}
                      onEdit={setEditingHabit}
                      onDelete={setHabitPendingDelete}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Goals */}
          <section className="flex flex-col gap-md">
            <div className="flex items-end justify-between gap-md">
              <div className="flex flex-col gap-0.5">
                <h2 className="font-display text-heading font-bold text-text">Goals</h2>
                {goals.length > 0 && (
                  <span className="text-micro text-muted">
                    {goalCounts.active} active
                    {goalCounts.paused > 0 ? ` · ${goalCounts.paused} paused` : ''}
                    {goalCounts.completed > 0 ? ` · ${goalCounts.completed} done` : ''}
                  </span>
                )}
              </div>
              <Button size="sm" leftIcon={<Plus size={16} />} onClick={() => setIsGoalFormOpen(true)}>
                Add
              </Button>
            </div>

            {goalsLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : sortedGoals.length === 0 ? (
              <EmptyState
                icon={Target}
                title="No goals yet"
                description="Set a goal you want to work toward"
              />
            ) : (
              <ul className="flex flex-col gap-md">
                {sortedGoals.map((goal) => (
                  <li key={goal.id}>
                    <GoalCard
                      goal={goal}
                      onSetProgress={setGoalProgress}
                      onEdit={setEditingGoal}
                      onDelete={setGoalPendingDelete}
                    />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </PageWrapper>

      <BottomSheet isOpen={isHabitFormOpen} onClose={() => setIsHabitFormOpen(false)} title="New habit">
        <HabitForm onSubmit={handleAddHabit} onCancel={() => setIsHabitFormOpen(false)} isSubmitting={isSubmitting} />
      </BottomSheet>

      <BottomSheet isOpen={Boolean(editingHabit)} onClose={() => setEditingHabit(null)} title="Edit habit">
        {editingHabit && (
          <HabitForm
            initialHabit={editingHabit}
            onSubmit={handleEditHabitSubmit}
            onCancel={() => setEditingHabit(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </BottomSheet>

      <Modal
        isOpen={Boolean(habitPendingDelete)}
        onClose={() => setHabitPendingDelete(null)}
        title="Delete habit?"
        description={habitPendingDelete?.title}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDeleteHabit}
      />

      <BottomSheet isOpen={isGoalFormOpen} onClose={() => setIsGoalFormOpen(false)} title="New goal">
        <GoalForm onSubmit={handleAddGoal} onCancel={() => setIsGoalFormOpen(false)} isSubmitting={isSubmitting} />
      </BottomSheet>

      <BottomSheet isOpen={Boolean(editingGoal)} onClose={() => setEditingGoal(null)} title="Edit goal">
        {editingGoal && (
          <GoalForm
            initialGoal={editingGoal}
            onSubmit={handleEditGoalSubmit}
            onCancel={() => setEditingGoal(null)}
            isSubmitting={isSubmitting}
          />
        )}
      </BottomSheet>

      <Modal
        isOpen={Boolean(goalPendingDelete)}
        onClose={() => setGoalPendingDelete(null)}
        title="Delete goal?"
        description={goalPendingDelete?.title}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleConfirmDeleteGoal}
      />
    </>
  )
}
