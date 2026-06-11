// Daily check-in bottom sheet — thin shell over CheckInForm so Home
// doesn't have to render the BottomSheet directly.

import { BottomSheet } from '@/components/ui'
import { CheckInForm } from './InlineCheckIn'

export default function CheckInSheet({ isOpen, onClose }) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Daily check-in">
      <CheckInForm onClose={onClose} />
    </BottomSheet>
  )
}
