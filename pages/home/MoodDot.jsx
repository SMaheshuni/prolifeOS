// Small color-coded dot for today's mood. Color mapping lives in
// `./mood` so it stays consistent across MoodDot, the check-in form,
// and the mascot's mood quick-pick popover.

import { MOOD_BG } from './mood'

export default function MoodDot({ mood }) {
  if (!mood) return null
  return (
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 rounded-full ${MOOD_BG[mood] ?? 'bg-border'}`}
    />
  )
}
