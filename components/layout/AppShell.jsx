import { Outlet, useLocation } from 'react-router-dom'
import AuroraBackground from './AuroraBackground'
import BottomNav from './BottomNav'
import InitialSyncOverlay from './InitialSyncOverlay'
import { Toast } from '@/components/ui'
import { useSync } from '@/hooks/useSync'
import { useThemeMode } from '@/hooks/useThemeMode'

export default function AppShell() {
  useSync()
  useThemeMode()
  const location = useLocation()

  return (
    <div className="relative flex min-h-screen flex-col">
      <AuroraBackground />
      <div
        key={location.pathname}
        className="relative z-card flex flex-1 flex-col animate-fade-rise"
      >
        <Outlet />
      </div>
      <BottomNav />
      <Toast />
      <InitialSyncOverlay />
    </div>
  )
}
