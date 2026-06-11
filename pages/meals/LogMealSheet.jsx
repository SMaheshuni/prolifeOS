// Log-meal slide-up sheet — owns its BottomSheet so the Save buttons
// can sit in the sticky footer while content scrolls above. Matches PDF
// page-6: meal-type chips → "What did you eat?" search field with
// favourite-driven autocomplete → optional calories.
//
// Suggestions only appear after typing a letter. Favourites surface
// first, then frequents (deduped) — keeps the sheet uncluttered.
//
// Photo entry: parents pass `pendingPhoto` when the user taps the day
// view's camera button. Name + calories + meal-type pre-fill from
// OpenAI Vision (via Supabase Edge Function); the user reviews and
// taps Save. The image is never persisted.

import { useEffect, useState } from 'react'
import { Search, Star } from 'lucide-react'
import { BottomSheet, Button } from '@/components/ui'
import { showToast } from '@/store/toastStore'
import { analyzeMealPhoto } from '@/utils/mealVision'
import { getMealTypeForTime } from '@/utils/dateHelpers'
import { MEAL_SLOTS } from './mealSlots'

const MAX_SUGGESTIONS = 5

const buildSuggestions = (typed, favourites, frequents) => {
  const lower = typed.trim().toLowerCase()
  if (!lower) return []
  const seen = new Set()
  const out = []
  for (const fav of favourites) {
    const name = (fav.name || '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (!key.includes(lower) || seen.has(key)) continue
    seen.add(key)
    out.push({
      name,
      avgCalories:
        fav.calories === null || fav.calories === undefined
          ? null
          : Number(fav.calories),
      isFavourite: true,
    })
    if (out.length >= MAX_SUGGESTIONS) return out
  }
  for (const freq of frequents) {
    const name = (freq.name || '').trim()
    if (!name) continue
    const key = name.toLowerCase()
    if (!key.includes(lower) || seen.has(key)) continue
    seen.add(key)
    out.push({ ...freq, isFavourite: false })
    if (out.length >= MAX_SUGGESTIONS) return out
  }
  return out
}

export default function LogMealSheet({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
  frequentMeals = [],
  favourites = [],
  onToggleFavourite,
  pendingPhoto = null,
  onSave,
  isSubmitting = false,
}) {
  const [mealType, setMealType] = useState(defaultMealType)
  const [name, setName] = useState('')
  const [calories, setCalories] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMealType(defaultMealType)
      setName('')
      setCalories('')
      setIsAnalyzing(false)
    }
  }, [isOpen, defaultMealType])

  useEffect(() => {
    if (!isOpen || !pendingPhoto) return
    let cancelled = false
    setIsAnalyzing(true)
    ;(async () => {
      try {
        const result = await analyzeMealPhoto(pendingPhoto)
        if (cancelled) return
        setName(result.name)
        setCalories(String(result.calories))
        setMealType(getMealTypeForTime(new Date()))
      } catch {
        if (!cancelled) {
          showToast({
            message: "Couldn't read meal — enter manually",
            type: 'error',
          })
        }
      } finally {
        if (!cancelled) setIsAnalyzing(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [isOpen, pendingPhoto])

  const trimmedName = name.trim()
  const suggestions = buildSuggestions(name, favourites, frequentMeals)
  const showSuggestions =
    suggestions.length > 0 && trimmedName !== suggestions[0]?.name

  const isCurrentFavourite = favourites.some(
    (f) => (f.name || '').toLowerCase() === trimmedName.toLowerCase()
  )

  const pickSuggestion = (entry) => {
    setName(entry.name)
    if (entry.avgCalories) setCalories(String(entry.avgCalories))
  }

  const handleToggleFavourite = () => {
    if (!trimmedName || !onToggleFavourite) return
    onToggleFavourite({ name: trimmedName, calories })
  }

  const handleSave = () => {
    if (!trimmedName) return
    onSave({ mealType, name: trimmedName, calories })
  }

  const footer = (
    <Button
      variant="primary"
      onClick={handleSave}
      isLoading={isSubmitting}
      disabled={!trimmedName || isAnalyzing}
      fullWidth
    >
      Save meal
    </Button>
  )

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Log meal" footer={footer}>
      <div className="flex flex-col gap-md">
        <div className="grid grid-cols-4 gap-xs">
          {MEAL_SLOTS.map(({ type, label, Icon }) => {
            const isActive = type === mealType
            return (
              <button
                key={type}
                type="button"
                onClick={() => setMealType(type)}
                className={`flex flex-col items-center gap-xs rounded-md border px-sm py-sm transition active:scale-[0.97] ${
                  isActive
                    ? 'border-accent bg-accent-light text-accent'
                    : 'border-border text-muted hover:border-text hover:text-text'
                }`}
              >
                <Icon size={18} strokeWidth={1.75} />
                <span className="text-label">{label}</span>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col gap-xs">
          <span className="text-micro font-medium uppercase tracking-[0.16em] text-muted">
            What did you eat?
          </span>
          <div className="flex h-12 items-center gap-sm rounded-md border border-border bg-surface px-md focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/40">
            <Search size={16} className="text-muted" />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isAnalyzing ? 'Analyzing photo…' : 'Search foods or paste a meal'}
              disabled={isAnalyzing}
              className="flex-1 bg-transparent text-body text-text outline-none placeholder:text-muted disabled:opacity-60"
            />
            <button
              type="button"
              onClick={handleToggleFavourite}
              disabled={!trimmedName}
              aria-label={
                isCurrentFavourite ? 'Remove from favourites' : 'Add to favourites'
              }
              aria-pressed={isCurrentFavourite}
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-primary-light hover:text-text active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted"
            >
              <Star
                size={18}
                strokeWidth={1.75}
                fill={isCurrentFavourite ? 'currentColor' : 'none'}
                className={isCurrentFavourite ? 'text-accent' : ''}
              />
            </button>
          </div>
        </div>

        {showSuggestions && (
          <ul className="flex flex-col gap-xs">
            {suggestions.map((entry) => (
              <li key={entry.name}>
                <button
                  type="button"
                  onClick={() => pickSuggestion(entry)}
                  className="flex w-full items-center justify-between gap-md rounded-md px-md py-sm text-left transition hover:bg-primary-light active:scale-[0.99]"
                >
                  <span className="flex items-center gap-xs text-body text-text">
                    {entry.isFavourite && (
                      <Star size={14} strokeWidth={1.75} fill="currentColor" className="text-accent" />
                    )}
                    {entry.name}
                  </span>
                  {entry.avgCalories !== null && entry.avgCalories !== undefined && (
                    <span className="text-micro text-muted">{entry.avgCalories} kcal</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-col gap-xs">
          <label
            htmlFor="meal_kcal"
            className="text-micro font-medium uppercase tracking-[0.16em] text-muted"
          >
            Calories <span className="text-muted/70">(kcal)</span>
          </label>
          <input
            id="meal_kcal"
            type="number"
            inputMode="numeric"
            value={calories}
            onChange={(e) => setCalories(e.target.value)}
            placeholder="Optional"
            disabled={isAnalyzing}
            className="h-12 w-full rounded-md border border-border bg-surface px-md text-body text-text outline-none transition placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/40 disabled:opacity-60"
          />
        </div>
      </div>
    </BottomSheet>
  )
}
