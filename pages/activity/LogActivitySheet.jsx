// Log-activity slide-up sheet — owns its BottomSheet so the action
// buttons sit in the sticky footer while content scrolls above.
// Type chips → duration → calories → Quick add (30 min) + Log session.

import { useEffect, useState } from 'react'
import {
  Dumbbell,
  Footprints,
  Bike,
  Flower2,
  Waves,
  CircleDot,
  MoreHorizontal,
} from 'lucide-react'
import { BottomSheet, Button } from '@/components/ui'

const TYPE_OPTIONS = [
  { id: 'gym',        label: 'Gym',     Icon: Dumbbell },
  { id: 'running',    label: 'Run',     Icon: Footprints },
  { id: 'walking',    label: 'Walk',    Icon: Footprints },
  { id: 'cycling',    label: 'Bike',    Icon: Bike },
  { id: 'yoga',       label: 'Yoga',    Icon: Flower2 },
  { id: 'swimming',   label: 'Swim',    Icon: Waves },
  { id: 'pickleball', label: 'Pickle',  Icon: CircleDot },
  { id: 'custom',     label: 'Other',   Icon: MoreHorizontal },
]

export default function LogActivitySheet({
  isOpen,
  onClose,
  defaultType = 'gym',
  defaultDuration = '',
  defaultCalories = '',
  title = 'Log activity',
  onSave,
  isSubmitting = false,
}) {
  const [type, setType] = useState(defaultType)
  const [duration, setDuration] = useState(defaultDuration)
  const [calories, setCalories] = useState(defaultCalories)

  useEffect(() => {
    if (isOpen) {
      setType(defaultType)
      setDuration(defaultDuration ?? '')
      setCalories(defaultCalories ?? '')
    }
  }, [isOpen, defaultType, defaultDuration, defaultCalories])

  const isFormValid = duration !== '' && Number(duration) > 0

  const handleSave = () => {
    if (!isFormValid) return
    onSave({ type, durationMinutes: Number(duration), calories })
  }

  const footer = (
    <Button
      variant="primary"
      onClick={handleSave}
      isLoading={isSubmitting}
      disabled={!isFormValid}
      fullWidth
    >
      Log session
    </Button>
  )

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <div className="flex flex-col gap-md">
        <div className="grid grid-cols-4 gap-xs">
          {TYPE_OPTIONS.map((opt) => {
            const isActive = opt.id === type
            const Icon = opt.Icon
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setType(opt.id)}
                className={`flex flex-col items-center gap-xs rounded-md border px-sm py-sm transition active:scale-[0.97] ${
                  isActive
                    ? 'border-accent bg-accent-light text-accent'
                    : 'border-border text-muted hover:border-text hover:text-text'
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span className="text-label">{opt.label}</span>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-md">
          <div className="flex flex-col gap-xs">
            <label htmlFor="act_dur" className="text-micro font-medium uppercase tracking-[0.16em] text-muted">
              Duration <span className="text-muted/70">(min)</span>
            </label>
            <input
              id="act_dur"
              type="number"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="0"
              className="h-12 w-full rounded-md border border-border bg-surface px-md text-body text-text outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
          </div>
          <div className="flex flex-col gap-xs">
            <label htmlFor="act_kcal" className="text-micro font-medium uppercase tracking-[0.16em] text-muted">
              Calories <span className="text-muted/70">(kcal)</span>
            </label>
            <input
              id="act_kcal"
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="0"
              className="h-12 w-full rounded-md border border-border bg-surface px-md text-body text-text outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
          </div>
        </div>
      </div>
    </BottomSheet>
  )
}
