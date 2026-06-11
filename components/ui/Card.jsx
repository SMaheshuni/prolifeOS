export default function Card({ children, onClick, className = '' }) {
  const base = 'glass rounded-lg p-md'
  const interactive = onClick
    ? 'cursor-pointer transition hover:translate-y-[-1px] active:translate-y-0'
    : ''
  const composed = [base, interactive, className].filter(Boolean).join(' ')

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${composed} text-left w-full`}>
        {children}
      </button>
    )
  }

  return <div className={composed}>{children}</div>
}
