// Standard tab bar bottom nav — design-locked.
// Full-width, fixed bottom, glass background with top border.
// Each tab: icon (filled when active, outline when inactive) + label.
// 4 primary destinations until Meal prep ships as the 5th. Calendar
// lives in the drawer + the calendar pill in Home's TopBar.

import { NavLink } from 'react-router-dom'
import { Home, CheckSquare, Target, Activity } from 'lucide-react'

const TABS = [
  { to: '/home',     label: 'Home',     icon: Home },
  { to: '/tasks',    label: 'Tasks',    icon: CheckSquare },
  { to: '/activity', label: 'Activity', icon: Activity },
  { to: '/goals',    label: 'Goals',    icon: Target },
]

export default function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-bottom-nav border-t border-border bg-background/85 backdrop-blur-glass safe-bottom"
    >
      <ul className="mx-auto flex w-full max-w-md items-stretch">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <li key={tab.to} className="flex-1">
              <NavLink
                to={tab.to}
                aria-label={tab.label}
                className={({ isActive }) =>
                  [
                    'flex flex-col items-center justify-center gap-0.5 py-sm transition',
                    isActive ? 'text-accent' : 'text-muted hover:text-text',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={22}
                      fill={isActive ? 'currentColor' : 'none'}
                      strokeWidth={isActive ? 2 : 1.75}
                    />
                    <span className="text-micro">{tab.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
