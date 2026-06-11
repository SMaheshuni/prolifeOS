// 44 px page-level toolbar — design-locked.
// Layout: coral logo square + page name (small, only on subpages) +
// context pill (tappable) + hamburger menu. Theme toggle moved into
// the menu drawer to keep the bar uncluttered.

import { useState } from 'react'
import { Zap, Menu } from 'lucide-react'
import MenuDrawer from './MenuDrawer'

export default function TopBar({ pageName, contextPill, onPillClick }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-header bg-background/80 backdrop-blur-glass safe-top">
        <div className="mx-auto flex h-11 w-full max-w-md items-center gap-sm px-lg">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-accent text-accent-ink shadow-sm">
            <Zap size={12} fill="currentColor" strokeWidth={1.5} />
          </span>
          {pageName && (
            <span className="text-label font-medium text-text">{pageName}</span>
          )}
          <div className="flex-1" />
          {contextPill && (
            <button
              type="button"
              onClick={onPillClick}
              className="rounded-full glass px-md py-1 text-micro text-text active:scale-[0.97] transition"
            >
              {contextPill}
            </button>
          )}
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setIsMenuOpen(true)}
            className="-mr-sm flex h-11 w-11 items-center justify-center rounded-full text-text hover:bg-primary-light"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>
      <MenuDrawer isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </>
  )
}
