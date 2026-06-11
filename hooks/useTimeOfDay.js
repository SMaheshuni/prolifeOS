import { useEffect } from 'react'

const phaseFor = (date) => {
  const hour = date.getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

const PHASE_CLASSES = ['tod-morning', 'tod-afternoon', 'tod-evening', 'tod-night']

const applyPhase = (phase) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  PHASE_CLASSES.forEach((cls) => root.classList.remove(cls))
  root.classList.add(`tod-${phase}`)
}

export const useTimeOfDay = () => {
  useEffect(() => {
    applyPhase(phaseFor(new Date()))
    const interval = setInterval(() => applyPhase(phaseFor(new Date())), 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
}
