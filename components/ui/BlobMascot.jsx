// LifeOS mascot — soft coral character whose energy mirrors the user's
// engagement: whether they've checked in, how active they've been,
// and what mood they logged. Five states map to behavior, not body
// composition. Designed for neurodivergent folks: warm, observational,
// never demanding. Tap the blob to cycle through preview states.
//
// Anatomy:
//   - Floating shadow beneath: sells "3D character" not "flat shape".
//   - Tuft on top: signature element, sways with secondary motion.
//   - Body: soft teardrop, squash-and-stretches with the bob.
//   - Eyes: blink, gaze drifts, expressive.
//   - Eyebrows: per-state shape conveys mood.
//   - Cheeks: appear on active states for warmth.
//   - Arms: peek out + wave on alert / wired / celebrating.
//   - Sparkles: orbit for wired and celebrating.

import { useEffect, useRef, useState } from 'react'

const VIEWBOX = '0 0 200 200'

const BODY_PATH =
  'M 100 32 C 144 34 170 66 170 108 C 170 154 138 178 100 178 C 62 178 30 154 30 108 C 30 66 56 34 100 32 Z'

// Tuft: small curl coming off the top-right of the head.
const TUFT_PATH =
  'M 104 34 C 100 22 108 12 116 16 C 124 21 119 34 110 36 Z'

const STATES = {
  snoozing: {
    bob: 'animate-blob-snooze',
    tuft: 'animate-tuft-snooze',
    shadow: 'animate-shadow-snooze',
    slump: 'animate-slump-snooze',
    aura: 'animate-aura-soft',
    auraOpacity: 0.32,
    eye: 'closed',
    brow: 'droopy',
    mouth: 'flat',
    cheeks: false,
    arms: false,
    armsWave: null,
    sparkles: false,
    puffs: true,
  },
  calm: {
    bob: 'animate-blob-calm',
    tuft: 'animate-tuft-calm',
    shadow: 'animate-shadow-calm',
    slump: 'animate-slump-calm',
    aura: 'animate-aura-soft',
    auraOpacity: 0.45,
    eye: 'small',
    brow: 'neutral',
    mouth: 'soft',
    cheeks: false,
    arms: false,
    armsWave: null,
    sparkles: false,
    puffs: false,
  },
  alert: {
    bob: 'animate-blob-alert',
    tuft: 'animate-tuft-alert',
    shadow: 'animate-shadow-alert',
    slump: 'animate-slump-alert',
    aura: 'animate-aura-vivid',
    auraOpacity: 0.55,
    eye: 'open',
    brow: 'raised',
    mouth: 'soft',
    cheeks: true,
    arms: true,
    armsWave: 'animate-arm-wave-slow',
    sparkles: false,
    puffs: false,
  },
  wired: {
    bob: 'animate-blob-wired',
    tuft: 'animate-tuft-wired',
    shadow: 'animate-shadow-wired',
    slump: 'animate-slump-wired',
    aura: 'animate-aura-vivid',
    auraOpacity: 0.7,
    eye: 'open',
    brow: 'energetic',
    mouth: 'grin',
    cheeks: true,
    arms: true,
    armsWave: 'animate-arm-wave-fast',
    sparkles: true,
    puffs: false,
  },
  celebrating: {
    bob: 'animate-blob-wired',
    tuft: 'animate-tuft-wired',
    shadow: 'animate-shadow-wired',
    slump: 'animate-slump-wired',
    aura: 'animate-aura-vivid',
    auraOpacity: 0.8,
    eye: 'wink',
    brow: 'arched',
    mouth: 'grin',
    cheeks: true,
    arms: true,
    armsWave: 'animate-arm-wave-fast',
    sparkles: true,
    puffs: false,
  },
}

const Puff = ({ cx, cy, animationClass }) => (
  <g
    className={animationClass}
    style={{ transformOrigin: `${cx}px ${cy}px` }}
  >
    <circle
      cx={cx}
      cy={cy}
      r="3.5"
      fill="var(--lifeos-color-surface-solid)"
      opacity="0.6"
    />
  </g>
)

const Eye = ({ cx, cy, kind, isWinkEye = false, canBlink = true }) => {
  if (kind === 'closed' || (kind === 'wink' && isWinkEye)) {
    return (
      <path
        d={`M ${cx - 8} ${cy} Q ${cx} ${cy + 4} ${cx + 8} ${cy}`}
        stroke="var(--lifeos-color-accent-ink)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    )
  }

  const radius =
    kind === 'small' ? 5.5 : kind === 'huge' ? 12 : 9
  const eyeContent = (
    <circle cx={cx} cy={cy} r={radius} fill="var(--lifeos-color-accent-ink)" />
  )

  if (!canBlink) return eyeContent

  return (
    <g
      className="animate-blink"
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {eyeContent}
    </g>
  )
}

const Brow = ({ cx, kind, mirrored = false }) => {
  const half = 8
  const left = cx - half
  const right = cx + half
  const sign = mirrored ? -1 : 1

  let path
  let opacity = 0.7
  switch (kind) {
    case 'droopy':
      path = `M ${left} 90 Q ${cx} 94 ${right} 90`
      opacity = 0.5
      break
    case 'raised':
      path = `M ${left} 88 Q ${cx} 84 ${right} 88`
      opacity = 0.75
      break
    case 'energetic':
      path = `M ${left + sign * -1} 87 L ${right + sign * 1} 84`
      opacity = 0.85
      break
    case 'arched':
      path = `M ${left} 86 Q ${cx} 82 ${right} 86`
      opacity = 0.85
      break
    case 'neutral':
    default:
      path = `M ${left + 2} 91 L ${right - 2} 91`
      opacity = 0.3
  }

  return (
    <path
      d={path}
      stroke="var(--lifeos-color-accent-ink)"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
      opacity={opacity}
    />
  )
}

const Mouth = ({ kind }) => {
  if (kind === 'yawn') {
    return (
      <ellipse
        cx="100"
        cy="130"
        rx="9"
        ry="7"
        fill="var(--lifeos-color-accent-ink)"
        opacity="0.78"
      />
    )
  }
  if (kind === 'tongue') {
    return (
      <>
        <path
          d="M 90 124 Q 100 132 110 124"
          stroke="var(--lifeos-color-accent-ink)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        />
        <ellipse
          cx="100"
          cy="133"
          rx="5"
          ry="6"
          fill="var(--lifeos-color-accent-ink)"
          opacity="0.55"
        />
      </>
    )
  }
  if (kind === 'shock') {
    return (
      <ellipse
        cx="100"
        cy="128"
        rx="5"
        ry="6"
        fill="var(--lifeos-color-accent-ink)"
        opacity="0.85"
      />
    )
  }
  if (kind === 'flat') {
    return (
      <path
        d="M 92 128 Q 100 129 108 128"
        stroke="var(--lifeos-color-accent-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.55"
      />
    )
  }
  if (kind === 'soft') {
    return (
      <path
        d="M 90 124 Q 100 134 110 124"
        stroke="var(--lifeos-color-accent-ink)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.75"
      />
    )
  }
  // grin — with a small inner shadow for depth
  return (
    <>
      <path
        d="M 84 122 Q 100 140 116 122"
        stroke="var(--lifeos-color-accent-ink)"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.92"
      />
      <path
        d="M 90 130 Q 100 136 110 130"
        fill="var(--lifeos-color-accent-ink)"
        opacity="0.18"
      />
    </>
  )
}

const Cheek = ({ cx, cy }) => (
  <ellipse
    cx={cx}
    cy={cy}
    rx="7"
    ry="4.5"
    fill="var(--lifeos-color-accent-ink)"
    opacity="0.22"
  />
)

const Arm = ({ side, waveClass }) => {
  // Origins are near the shoulder; arms swing from there.
  const isLeft = side === 'left'
  const originX = isLeft ? 36 : 164
  const originY = 132

  return (
    <g
      className={waveClass}
      style={{ transformOrigin: `${originX}px ${originY}px` }}
    >
      <path
        d={
          isLeft
            ? 'M 36 132 C 24 132 18 138 18 144 C 18 148 24 150 30 148'
            : 'M 164 132 C 176 132 182 138 182 144 C 182 148 176 150 170 148'
        }
        stroke="var(--lifeos-color-accent)"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Subtle inner highlight */}
      <path
        d={
          isLeft
            ? 'M 30 134 C 24 134 22 138 22 142'
            : 'M 170 134 C 176 134 178 138 178 142'
        }
        stroke="var(--lifeos-color-accent-ink)"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        opacity="0.14"
      />
    </g>
  )
}

// Floating particle that rises + fades once when its key changes. Used to
// give idle behaviors a clear "thought-bubble" reading at small sizes.
const Particle = ({ kind }) => {
  const x = 134
  const y = 36
  const common = {
    className: 'animate-particle-rise',
    style: { transformOrigin: `${x}px ${y}px` },
  }
  if (kind === '?' || kind === '!' || kind === 'z' || kind === 'hic') {
    return (
      <text
        {...common}
        x={x}
        y={y}
        fontSize={kind === 'hic' ? 11 : 18}
        fontWeight="700"
        fill="var(--lifeos-color-accent)"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {kind === 'hic' ? '*hic*' : kind}
      </text>
    )
  }
  if (kind === 'note') {
    return (
      <g {...common}>
        <text
          x={x}
          y={y}
          fontSize="18"
          fontWeight="700"
          fill="var(--lifeos-color-accent)"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          ♪
        </text>
      </g>
    )
  }
  if (kind === 'puff') {
    return (
      <circle
        {...common}
        cx={x}
        cy={y}
        r="4"
        fill="var(--lifeos-color-surface-solid)"
        opacity="0.75"
      />
    )
  }
  if (kind === 'sparkle') {
    const s = 5
    return (
      <g {...common}>
        <path
          d={`M ${x} ${y - s} L ${x + s * 0.3} ${y - s * 0.3} L ${x + s} ${y} L ${x + s * 0.3} ${y + s * 0.3} L ${x} ${y + s} L ${x - s * 0.3} ${y + s * 0.3} L ${x - s} ${y} L ${x - s * 0.3} ${y - s * 0.3} Z`}
          fill="var(--lifeos-color-accent)"
          opacity="0.9"
        />
      </g>
    )
  }
  return null
}

const Sparkle = ({ cx, cy, size, animationClass }) => (
  <g className={animationClass} style={{ transformOrigin: `${cx}px ${cy}px` }}>
    <path
      d={`M ${cx} ${cy - size} L ${cx + size * 0.3} ${cy - size * 0.3} L ${cx + size} ${cy} L ${cx + size * 0.3} ${cy + size * 0.3} L ${cx} ${cy + size} L ${cx - size * 0.3} ${cy + size * 0.3} L ${cx - size} ${cy} L ${cx - size * 0.3} ${cy - size * 0.3} Z`}
      fill="var(--lifeos-color-accent)"
      opacity="0.85"
    />
  </g>
)

// Idle behavior tuning — sparse so it never feels mechanical, ND-friendly.
// Durations are matched to the corresponding tailwind keyframe lengths so
// face/body overrides clear right when the animation finishes.
const IDLE_DURATIONS = {
  lookL: 900,
  lookR: 900,
  lookUp: 900,
  lookDown: 900,
  peek: 700,
  yawn: 1200,
  stretch: 1100,
  sneeze: 900,
  hiccup: 700,
  shimmy: 1000,
  tongue: 800,
  surprised: 700,
  wink: 600,
  giggle: 1100,
}
const IDLE_MIN_MS = 5000
const IDLE_MAX_MS = 11000

// Body-level animations triggered by transient idle behaviors. Plays once
// per behavior (iteration count = 1 in tailwind config).
const TRANSIENT_BODY_ANIM = {
  stretch: 'animate-body-stretch',
  sneeze: 'animate-body-sneeze',
  hiccup: 'animate-body-hiccup',
  shimmy: 'animate-body-shimmy',
  surprised: 'animate-body-surprised',
  giggle: 'animate-body-giggle',
}

// Floating particle keyed to each behavior. null = no particle, just the
// face/body change reads on its own.
const TRANSIENT_PARTICLE = {
  peek: '?',
  surprised: '!',
  shimmy: 'note',
  yawn: 'z',
  sneeze: 'puff',
  hiccup: 'hic',
  giggle: 'sparkle',
  tongue: 'sparkle',
  stretch: null,
  lookL: null,
  lookR: null,
  lookUp: 'sparkle',
  lookDown: null,
  wink: null,
}

// Pointer gaze tuning — eyes deflect within these SVG units, only when
// pointer is reasonably close on screen.
const GAZE_MAX_X = 4
const GAZE_MAX_Y = 2
const POINTER_RANGE_PX = 320
const POINTER_PROXIMITY_FALLOFF_PX = 80

// Build a weighted idle-behavior pool flavored by today's mood +
// activity engagement + time of day. Stays observational only —
// bad/terrible moods trigger a quiet lookDown or stretch, never
// worried/sad faces (ND-first rule: no catastrophizing).
const buildIdlePool = ({ state, mood, activitySessions = 0, hour = 12 }) => {
  const pool = []
  const add = (behavior, weight = 1) => {
    for (let i = 0; i < weight; i++) pool.push(behavior)
  }

  // Baseline universals — keeps the blob varied even on a flat day.
  add('lookL', 1)
  add('lookR', 1)
  add('peek', 1)
  add('stretch', 1)

  // Time-of-day bias — gentle, not deterministic.
  if (hour >= 4 && hour < 9) {
    // Early morning: still waking up.
    add('yawn', 2)
    add('stretch', 2)
    add('lookDown', 1)
  } else if (hour >= 9 && hour < 12) {
    // Late morning: most awake, most playful.
    add('shimmy', 2)
    add('giggle', 2)
    add('lookUp', 1)
  } else if (hour >= 12 && hour < 18) {
    // Afternoon: curious, scanning.
    add('peek', 2)
    add('lookL', 1)
    add('lookR', 1)
  } else if (hour >= 18 && hour < 22) {
    // Evening: settling.
    add('stretch', 2)
    add('lookDown', 1)
  } else {
    // Late night / pre-dawn: sleepy.
    add('yawn', 3)
    add('lookDown', 1)
  }

  // Mood bias
  if (mood === 'great') {
    add('giggle', 3)
    add('shimmy', 2)
    add('wink', 2)
  } else if (mood === 'good') {
    add('giggle', 2)
    add('shimmy', 1)
    add('lookUp', 1)
  } else if (mood === 'okay') {
    add('lookL', 1)
    add('lookDown', 1)
    add('tongue', 1)
  } else if (mood === 'bad' || mood === 'terrible') {
    // Soft acknowledgment, never punitive.
    add('lookDown', 2)
    add('stretch', 1)
  }

  // Activity bias — layered on top
  if (activitySessions >= 1) {
    add('shimmy', 2)
    add('lookUp', 1)
    add('giggle', 1)
  }
  if (activitySessions >= 3) {
    add('shimmy', 2)
    add('hiccup', 1)
  }

  // Sleepy state — nothing logged at all
  if (state === 'snoozing') {
    add('yawn', 4)
    add('sneeze', 2)
    add('lookDown', 1)
  }

  // Energetic states unlock celebratory motion
  if (state === 'wired' || state === 'celebrating') {
    add('shimmy', 1)
    add('giggle', 1)
    add('wink', 1)
  }

  return pool
}

export default function BlobMascot({
  state = 'calm',
  size = 150,
  onTap,
  mood = null,
  activitySessions = 0,
  actionTick = 0,
}) {
  const [isAcking, setIsAcking] = useState(false)
  const [pointerGaze, setPointerGaze] = useState({ x: 0, y: 0 })
  const [transient, setTransient] = useState(null)
  const [transientTick, setTransientTick] = useState(0)
  const buttonRef = useRef(null)
  const prevActionTickRef = useRef(actionTick)

  const config = STATES[state] || STATES.calm

  // Pointer + touch tracking — eyes drift toward the cursor when it's near
  // the blob. Far cursors recenter (avoids the "creepy follow" problem).
  // rAF-throttled so high-frequency mousemove doesn't spam React state.
  useEffect(() => {
    let rafId = null
    let pending = null

    const compute = (clientX, clientY) => {
      const rect = buttonRef.current?.getBoundingClientRect()
      if (!rect) return
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = clientX - cx
      const dy = clientY - cy
      const dist = Math.hypot(dx, dy)
      if (dist > POINTER_RANGE_PX) {
        setPointerGaze((g) => (g.x === 0 && g.y === 0 ? g : { x: 0, y: 0 }))
        return
      }
      const proximity = Math.min(1, dist / POINTER_PROXIMITY_FALLOFF_PX)
      const ang = Math.atan2(dy, dx)
      setPointerGaze({
        x: Math.cos(ang) * GAZE_MAX_X * proximity,
        y: Math.sin(ang) * GAZE_MAX_Y * proximity,
      })
    }

    const flush = () => {
      rafId = null
      if (pending) {
        compute(pending.x, pending.y)
        pending = null
      }
    }
    const onMouse = (e) => {
      pending = { x: e.clientX, y: e.clientY }
      if (rafId === null) rafId = requestAnimationFrame(flush)
    }
    const onTouch = (e) => {
      const t = e.touches?.[0] || e.changedTouches?.[0]
      if (!t) return
      pending = { x: t.clientX, y: t.clientY }
      if (rafId === null) rafId = requestAnimationFrame(flush)
    }

    window.addEventListener('mousemove', onMouse, { passive: true })
    window.addEventListener('touchstart', onTouch, { passive: true })
    window.addEventListener('touchmove', onTouch, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('touchstart', onTouch)
      window.removeEventListener('touchmove', onTouch)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  // Idle micro-behaviors — periodic, never overlapping. yawn is gated to
  // low-energy states so an "alert" blob doesn't look bored.
  useEffect(() => {
    let waitTimer
    let behaviorTimer
    let cancelled = false

    let lastChoice = null
    const schedule = () => {
      const wait = IDLE_MIN_MS + Math.random() * (IDLE_MAX_MS - IDLE_MIN_MS)
      waitTimer = setTimeout(() => {
        if (cancelled) return
        const pool = buildIdlePool({
          state,
          mood,
          activitySessions,
          hour: new Date().getHours(),
        })
        // No back-to-back duplicates so it doesn't feel mechanical.
        let choice = pool[Math.floor(Math.random() * pool.length)]
        if (choice === lastChoice && pool.length > 1) {
          let tries = 0
          while (choice === lastChoice && tries < 4) {
            choice = pool[Math.floor(Math.random() * pool.length)]
            tries++
          }
        }
        lastChoice = choice
        setTransient(choice)
        setTransientTick((t) => t + 1)
        behaviorTimer = setTimeout(() => {
          if (cancelled) return
          setTransient(null)
          schedule()
        }, IDLE_DURATIONS[choice])
      }, wait)
    }
    schedule()
    return () => {
      cancelled = true
      clearTimeout(waitTimer)
      clearTimeout(behaviorTimer)
    }
  }, [state, mood, activitySessions])

  // One-shot reaction when the parent reports a logged action (meal, habit
  // toggle, etc). Fires a brief wiggle + a giggle transient (sparkle +
  // closed-eye grin). Skipped on the first mount so we don't react to the
  // initial mount itself.
  useEffect(() => {
    if (prevActionTickRef.current === actionTick) return
    prevActionTickRef.current = actionTick
    setIsAcking(true)
    const ackTimer = setTimeout(() => setIsAcking(false), 360)
    setTransient('giggle')
    setTransientTick((t) => t + 1)
    const transTimer = setTimeout(() => setTransient(null), IDLE_DURATIONS.giggle)
    return () => {
      clearTimeout(ackTimer)
      clearTimeout(transTimer)
    }
  }, [actionTick])

  // Resolve effective gaze + face overrides — idle behaviors win over
  // pointer tracking so a "look around" doesn't get yanked by the cursor.
  const activeTransient = transient

  let transientGaze = null
  if (activeTransient === 'lookL') transientGaze = { x: -GAZE_MAX_X, y: 0 }
  else if (activeTransient === 'lookR') transientGaze = { x: GAZE_MAX_X, y: 0 }
  else if (activeTransient === 'lookUp') transientGaze = { x: 0, y: -GAZE_MAX_Y * 1.5 }
  else if (activeTransient === 'lookDown') transientGaze = { x: 0, y: GAZE_MAX_Y * 1.5 }
  else if (activeTransient === 'peek') transientGaze = { x: 0, y: -1.2 }

  const gaze = transientGaze ?? pointerGaze

  let renderedEye = config.eye
  let renderedBrow = config.brow
  let renderedMouth = config.mouth
  if (activeTransient === 'peek') {
    renderedEye = 'open'
    renderedBrow = 'raised'
  } else if (activeTransient === 'surprised') {
    renderedEye = 'huge'
    renderedBrow = 'raised'
    renderedMouth = 'shock'
  } else if (activeTransient === 'wink') {
    renderedEye = 'wink'
  } else if (activeTransient === 'giggle') {
    renderedEye = 'closed'
    renderedMouth = 'grin'
  } else if (activeTransient === 'tongue') {
    renderedMouth = 'tongue'
  } else if (activeTransient === 'yawn') {
    renderedMouth = 'yawn'
  } else if (activeTransient === 'sneeze') {
    renderedEye = 'closed'
    renderedBrow = 'energetic'
  }

  const transientBodyAnim = TRANSIENT_BODY_ANIM[activeTransient] || ''
  const transientParticle = TRANSIENT_PARTICLE[activeTransient] || null

  const handleClick = () => {
    if (!isAcking) {
      setIsAcking(true)
      setTimeout(() => setIsAcking(false), 360)
    }
    onTap?.()
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={handleClick}
      aria-label={`Mascot — ${state}, tap to cycle`}
      className={`relative inline-flex items-center justify-center ${
        isAcking ? 'animate-wiggle-ack' : ''
      }`}
      style={{ width: size, height: size }}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 ${config.aura}`}
        style={{
          background:
            'radial-gradient(circle at center, var(--lifeos-color-accent) 0%, transparent 65%)',
          opacity: config.auraOpacity,
          filter: 'blur(10px)',
        }}
      />

      <svg viewBox={VIEWBOX} width={size} height={size} className="relative">
        <defs>
          <radialGradient id="blob-fill" cx="35%" cy="28%" r="78%">
            <stop offset="0%" stopColor="var(--lifeos-color-accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--lifeos-color-accent)" stopOpacity="0.86" />
          </radialGradient>
          <radialGradient id="tuft-fill" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="var(--lifeos-color-accent)" stopOpacity="1" />
            <stop offset="100%" stopColor="var(--lifeos-color-accent)" stopOpacity="0.78" />
          </radialGradient>
        </defs>

        {/* Floating shadow — stationary, breathes opacity with the bob */}
        <ellipse
          cx="100"
          cy="190"
          rx="36"
          ry="3.5"
          fill="var(--lifeos-color-text)"
          className={config.shadow}
          style={{ transformOrigin: '100px 190px' }}
        />

        {/* Slump group — slow energy ebb-and-flow that all states share */}
        <g
          className={config.slump}
          style={{ transformOrigin: '100px 105px' }}
        >
          {/* Body group — bobs together with the tuft and face */}
          <g
            className={config.bob}
            style={{ transformOrigin: '100px 105px' }}
          >
            {/* Transient body anim wrapper — fresh key per behavior so the
                CSS animation restarts each time. */}
            <g
              key={`tx-${activeTransient ?? 'idle'}-${transientTick}`}
              className={transientBodyAnim}
              style={{ transformOrigin: '100px 105px' }}
            >
            {/* Tuft — child of body so it bobs together, plus its own sway */}
            <g
              className={config.tuft}
              style={{ transformOrigin: '108px 32px' }}
            >
              <path d={TUFT_PATH} fill="url(#tuft-fill)" />
            </g>

          <path d={BODY_PATH} fill="url(#blob-fill)" />

          {/* Soft top highlight for depth */}
          <ellipse
            cx="78"
            cy="62"
            rx="22"
            ry="13"
            fill="var(--lifeos-color-accent-ink)"
            opacity="0.16"
          />

          {config.cheeks && (
            <>
              <Cheek cx={58} cy={122} />
              <Cheek cx={142} cy={122} />
            </>
          )}

          {config.arms && (
            <>
              <Arm side="left" waveClass={config.armsWave} />
              <Arm side="right" waveClass={config.armsWave} />
            </>
          )}

          {/* Face — JS-controlled gaze group: pointer tracking + idle
              behaviors translate eyes/brows together. Smooth transition
              gives natural-looking eye movement. */}
          <g
            style={{
              transform: `translate(${gaze.x}px, ${gaze.y}px)`,
              transition: 'transform 240ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          >
            <Brow cx={82} kind={renderedBrow} />
            <Brow cx={118} kind={renderedBrow} mirrored />

            <Eye
              cx={82}
              cy={102}
              kind={renderedEye}
              isWinkEye
              canBlink={renderedEye !== 'closed' && renderedEye !== 'wink'}
            />
            <Eye
              cx={118}
              cy={102}
              kind={renderedEye}
              isWinkEye={false}
              canBlink={renderedEye !== 'closed'}
            />

            <Mouth kind={renderedMouth} />
          </g>
          </g>
          </g>
        </g>

        {/* Floating thought-bubble particle for the active behavior. Keyed
            so it remounts (and re-runs the rise animation) each time. */}
        {transientParticle && (
          <Particle
            key={`p-${activeTransient}-${transientTick}`}
            kind={transientParticle}
          />
        )}

        {/* Sleep puffs — drift up from above the head when snoozing */}
        {config.puffs && (
          <>
            <Puff cx={130} cy={32} animationClass="animate-puff-1" />
            <Puff cx={130} cy={32} animationClass="animate-puff-2" />
            <Puff cx={130} cy={32} animationClass="animate-puff-3" />
          </>
        )}

        {config.sparkles && (
          <>
            <Sparkle cx={42} cy={48} size={4.5} animationClass="animate-sparkle-1" />
            <Sparkle cx={162} cy={62} size={5} animationClass="animate-sparkle-2" />
            <Sparkle cx={172} cy={140} size={3.5} animationClass="animate-sparkle-3" />
          </>
        )}
      </svg>
    </button>
  )
}

export const MASCOT_STATES = ['snoozing', 'calm', 'alert', 'wired', 'celebrating']
