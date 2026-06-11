// Camera-entry button + hidden file input pair. Wraps the boilerplate
// for triggering the device camera and surfacing the captured File via
// onCapture, so consumers don't have to re-do it.
//
// Variants:
//   chip     — small round 32px chip used inside card headers
//   labeled  — full primary-style Button with "Scan" label, sized to
//              sit alongside the page's main CTA as an equal peer

import { useRef } from 'react'
import { Camera } from 'lucide-react'
import Button from '@/components/ui/Button'

const CHIP_CLASS =
  'flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-text transition active:scale-[0.97] hover:bg-primary'

export default function ScanMealButton({ onCapture, variant = 'chip' }) {
  const fileInputRef = useRef(null)

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) onCapture?.(file)
  }

  const trigger =
    variant === 'labeled' ? (
      <Button
        variant="secondary"
        fullWidth
        leftIcon={<Camera size={18} strokeWidth={1.75} />}
        onClick={handleClick}
      >
        Scan
      </Button>
    ) : (
      <button
        type="button"
        onClick={handleClick}
        aria-label="Scan meal with camera"
        className={CHIP_CLASS}
      >
        <Camera size={14} strokeWidth={2.4} />
      </button>
    )

  return (
    <>
      {trigger}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleChange}
        className="hidden"
      />
    </>
  )
}
