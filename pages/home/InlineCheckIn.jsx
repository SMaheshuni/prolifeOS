// Daily check-in form for Home — mood + weight. Auto-saves; upserts
// by date so there's only ever one row per day per user. Weight unit
// comes from user_settings (chosen at onboarding) — not asked here.
// A primary "Done" button sits beside the weight input as the dismiss
// action.

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui'
import { useCheckin } from '@/pages/checkin/checkin.hooks'
import { useAuth } from '@/hooks/useAuth'
import { settingsService } from '@/pages/settings/settings.service'
import { toIsoDate } from '@/utils/dateHelpers'
import { MOOD_ORDER } from './mood'

export function CheckInForm({ onClose }) {
  const { user } = useAuth()
  const { todayCheckin, saveCheckin } = useCheckin()
  const [mood, setMood] = useState('')
  const [weight, setWeight] = useState('')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [recentlySavedAt, setRecentlySavedAt] = useState(null)

  useEffect(() => {
    if (todayCheckin) {
      setMood(todayCheckin.mood || '')
      setWeight(todayCheckin.weight ?? '')
    }
  }, [todayCheckin])

  // Weight unit comes from user settings (set at onboarding); the form
  // doesn't ask the user to pick a unit each time.
  useEffect(() => {
    if (!user?.id) return
    let cancelled = false
    settingsService.ensure(user.id).then((s) => {
      if (cancelled) return
      setWeightUnit(s?.weight_unit || 'kg')
    })
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const flagSaved = () => {
    setRecentlySavedAt(Date.now())
    setTimeout(() => setRecentlySavedAt((t) => (Date.now() - t > 1900 ? null : t)), 2000)
  }

  const persist = async (overrides = {}) => {
    const payload = {
      date: toIsoDate(new Date()),
      weight: overrides.weight ?? weight,
      weightUnit: overrides.weightUnit ?? weightUnit,
      mood: overrides.mood ?? mood ?? null,
    }
    const result = await saveCheckin(payload, { silent: true })
    if (!result?.errors && !result?.error) flagSaved()
  }

  const handleMood = (next) => {
    setMood(next)
    persist({ mood: next })
  }

  const handleWeightBlur = () => {
    if (weight === '' || weight === null) return
    if (todayCheckin && Number(weight) === Number(todayCheckin.weight)) return
    persist({ weight })
  }

  return (
    <div className="glass rounded-lg p-md">
      <div className="flex items-center justify-between gap-md">
        <span className="text-micro font-medium uppercase tracking-[0.18em] text-muted">
          {todayCheckin ? 'edit check-in' : 'check in'}
        </span>
        {recentlySavedAt && <span className="text-micro text-muted">saved</span>}
      </div>

      <div className="mt-sm grid grid-cols-5 gap-xs">
        {MOOD_ORDER.map((option) => {
          const isActive = option === mood
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleMood(option)}
              className={`flex h-11 items-center justify-center rounded-full text-label capitalize transition active:scale-[0.97] ${
                isActive ? 'bg-accent text-accent-ink' : 'glass text-muted hover:text-text'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      <div className="mt-md flex items-end gap-sm">
        <div className="flex flex-1 flex-col gap-xs">
          <label
            htmlFor="checkin_weight"
            className="text-micro font-medium uppercase tracking-[0.16em] text-muted"
          >
            weight ({weightUnit})
          </label>
          <input
            id="checkin_weight"
            type="number"
            inputMode="decimal"
            value={weight ?? ''}
            onChange={(e) => setWeight(e.target.value)}
            onBlur={handleWeightBlur}
            placeholder="—"
            className="h-12 w-full rounded-md border border-border bg-surface px-md text-body text-text outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <Button variant="primary" onClick={onClose}>
          Done
        </Button>
      </div>
    </div>
  )
}
