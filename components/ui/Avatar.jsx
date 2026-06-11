const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

const SIZES = {
  sm: 'h-8 w-8 text-label',
  md: 'h-10 w-10 text-body',
  lg: 'h-14 w-14 text-subheading',
}

export default function Avatar({ name, imageUrl, size = 'md' }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name || 'avatar'}
        className={`rounded-full object-cover ${SIZES[size]}`}
      />
    )
  }
  return (
    <div
      className={`flex items-center justify-center rounded-full bg-primary-light font-medium text-primary ${SIZES[size]}`}
    >
      {getInitials(name)}
    </div>
  )
}
