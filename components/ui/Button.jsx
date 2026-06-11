import Spinner from './Spinner'

const VARIANTS = {
  primary: 'bg-accent text-accent-ink hover:brightness-95 disabled:opacity-50',
  secondary: 'glass text-text hover:bg-primary-light disabled:opacity-50',
  danger: 'bg-danger text-white hover:brightness-95 disabled:opacity-50',
  ghost: 'bg-transparent text-text hover:bg-primary-light disabled:opacity-50',
}

const SIZES = {
  sm: 'h-9 px-md text-label',
  md: 'h-12 px-lg text-body',
  lg: 'h-14 px-xl text-body',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  onClick,
  leftIcon,
  rightIcon,
}) {
  const className = [
    'inline-flex shrink-0 items-center justify-center gap-sm whitespace-nowrap rounded-full font-medium transition',
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={className} disabled={disabled || isLoading} onClick={onClick}>
      {isLoading ? <Spinner /> : leftIcon}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  )
}
