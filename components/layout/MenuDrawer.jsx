// Slide-in menu drawer — design-locked. Opens from the right, lists every
// destination in the app (incl. ones not in the bottom nav: Meals,
// Challenge, Profile). Identity row + theme toggle pinned to the bottom.

import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Home,
  Calendar,
  UtensilsCrossed,
  CheckSquare,
  Target,
  Flame,
  Activity as ActivityIcon,
  User,
  X,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react'
import { Avatar } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { useThemeStore } from '@/store/themeStore'
import { useSyncStore } from '@/store/syncStore'
import { settingsService } from '@/pages/settings/settings.service'

const ROUTES = [
  { to: '/home', label: 'Home', icon: Home },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/challenge', label: 'Challenge', icon: Flame },
  { to: '/activity', label: 'Activity', icon: ActivityIcon },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function MenuDrawer({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const mode = useThemeStore((state) => state.mode)
  const setMode = useThemeStore((state) => state.setMode)
  const isOnline = useOnlineStatus()
  const isSyncing = useSyncStore((state) => state.isSyncing)
  const hasSyncError = useSyncStore((state) => state.hasSyncError)
  const isDark = mode === 'dark'

  let syncStatus = 'In sync'
  let syncDotClass = 'bg-success'
  if (!isOnline) {
    syncStatus = 'Offline — will sync when back'
    syncDotClass = 'bg-warning'
  } else if (hasSyncError) {
    syncStatus = 'Saved locally — retrying'
    syncDotClass = 'bg-danger'
  } else if (isSyncing) {
    syncStatus = 'Syncing…'
    syncDotClass = 'bg-accent animate-pulse'
  }

  useEffect(() => {
    if (!isOpen) return
    const handleKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  const handleToggleTheme = async () => {
    const next = isDark ? 'light' : 'dark'
    setMode(next)
    if (user?.id) {
      try {
        await settingsService.update(user.id, { theme: next })
      } catch {
        // local state already updated; sync will retry
      }
    }
  }

  const handleSignOut = async () => {
    onClose()
    await signOut()
    navigate('/login', { replace: true })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-bottom-sheet">
      <div
        className="absolute inset-0 animate-fade-in bg-text/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="safe-top safe-bottom absolute inset-y-0 right-0 flex w-3/4 max-w-xs animate-fade-in flex-col glass-solid">
        <div className="flex items-center justify-between px-lg pt-lg pb-md">
          <h2 className="font-display text-subheading font-medium text-text">Menu</h2>
          <button
            type="button"
            aria-label="Close menu"
            onClick={onClose}
            className="-mr-sm flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-md">
          <ul className="flex flex-col gap-xs">
            {ROUTES.map((route) => {
              const Icon = route.icon
              const isActive =
                route.to === '/home'
                  ? location.pathname === '/home' || location.pathname === '/'
                  : location.pathname.startsWith(route.to)
              return (
                <li key={route.to}>
                  <Link
                    to={route.to}
                    onClick={onClose}
                    className={`flex items-center gap-md rounded-md px-md py-sm transition active:scale-[0.99] ${
                      isActive
                        ? 'bg-accent text-accent-ink'
                        : 'text-text hover:bg-primary-light'
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2 : 1.75} />
                    <span className="text-body">{route.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="ml-auto h-2 w-2 rounded-full bg-accent-ink"
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="border-t border-border px-lg py-md">
          <div className="mb-sm flex items-center gap-sm">
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${syncDotClass}`} />
            <span className="text-micro text-muted">{syncStatus}</span>
          </div>
          <div className="flex items-center gap-sm">
            <Avatar name={user?.email || ''} size="sm" />
            <span className="flex-1 truncate text-label text-text">
              {user?.email?.split('@')[0] || 'you'}
            </span>
            <button
              type="button"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              onClick={handleToggleTheme}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-primary-light hover:text-text"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              type="button"
              aria-label="Sign out"
              onClick={handleSignOut}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-danger-light hover:text-danger"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
