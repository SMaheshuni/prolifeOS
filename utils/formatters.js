const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const FULL_MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const formatDate = (date) => {
  const d = new Date(date)
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]}`
}

export const formatFullDate = (date) => {
  const d = new Date(date)
  return `${SHORT_DAYS[d.getDay()]}, ${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export const formatTime = (date) => {
  const d = new Date(date)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export const formatRelative = (date) => {
  const now = Date.now()
  const then = new Date(date).getTime()
  const diffMs = now - then
  const diffMin = Math.round(diffMs / 60000)
  const diffHr = Math.round(diffMs / 3600000)
  const diffDay = Math.round(diffMs / 86400000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`
  if (diffDay === 1) return 'yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  return formatDate(date)
}

export const formatCalendarLabel = (date) => {
  const d = new Date(date)
  return `${SHORT_DAYS[d.getDay()]} ${d.getDate()}`
}

export const formatWeight = (value, unit) => {
  if (value === null || value === undefined || value === '') return '—'
  return `${value} ${unit}`
}

export const formatDistance = (value, unit) => {
  if (value === null || value === undefined || value === '') return '—'
  return `${value} ${unit}`
}

export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '—'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export const formatPercent = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0%'
  return `${Math.round(value)}%`
}

export const formatNumber = (value) => {
  if (value === null || value === undefined) return '—'
  return value.toLocaleString()
}

export const titleCase = (s) => {
  if (!s) return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export const formatMonthShort = (date) => {
  const d = new Date(date)
  return `${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

export const formatMonthFull = (date) => {
  const d = new Date(date)
  return `${FULL_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
