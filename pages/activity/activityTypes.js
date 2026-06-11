// Single source of truth for activity-type metadata: short label + icon.
// Imported by ActivityPage (full list) and HomePage's bento (today's
// session-type icons).

import {
  Dumbbell,
  Footprints,
  Bike,
  Flower2,
  Waves,
  CircleDot,
  MoreHorizontal,
} from 'lucide-react'

export const TYPE_META = {
  gym: { label: 'Gym', Icon: Dumbbell },
  running: { label: 'Run', Icon: Footprints },
  walking: { label: 'Walk', Icon: Footprints },
  cycling: { label: 'Bike', Icon: Bike },
  yoga: { label: 'Yoga', Icon: Flower2 },
  swimming: { label: 'Swim', Icon: Waves },
  pickleball: { label: 'Pickle', Icon: CircleDot },
  custom: { label: 'Other', Icon: MoreHorizontal },
}
