// Inline page header — single tight row.
// Back chevron (if sub-page) + title + optional action. No eyebrow,
// no multi-row stack. Per project rule: keep chrome compact so content
// lands above the fold on a typical mobile viewport.

import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'

export default function Header({ title, showBack = false, action }) {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex w-full max-w-md items-center gap-sm px-lg pb-xs pt-sm">
      {showBack && (
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="-ml-sm flex h-11 w-11 items-center justify-center rounded-full text-muted hover:text-text"
        >
          <ChevronLeft size={22} />
        </button>
      )}
      {title && (
        <h1 className="flex-1 truncate font-display text-heading font-bold text-text leading-[1.1]">
          {title}
        </h1>
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
