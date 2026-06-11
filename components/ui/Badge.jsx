const VARIANTS = {
  primary: 'bg-primary-light text-primary',
  success: 'bg-success-light text-success',
  warning: 'bg-warning-light text-warning',
  danger: 'bg-danger-light text-danger',
  muted: 'bg-background text-muted',
}

export default function Badge({ children, variant = 'muted' }) {
  const className = `inline-flex items-center rounded-full px-sm py-xs text-micro font-medium ${VARIANTS[variant]}`
  return <span className={className}>{children}</span>
}
