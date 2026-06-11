const MS_PER_DAY = 86400000

// Parse ISO YYYY-MM-DD date strings as LOCAL midnight (not UTC). Native
// `new Date("2026-05-04")` parses as UTC midnight, which becomes the
// previous local day in negative timezones — that breaks isToday() and
// filters elsewhere. This helper avoids the TZ shift for date-only
// strings and falls through to Date for everything else.
const parseLocalDate = (input) => {
  if (typeof input === 'string') {
    const match = input.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (match) {
      return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    }
  }
  return new Date(input)
}

export const startOfDay = (date) => {
  const d = parseLocalDate(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export const endOfDay = (date) => {
  const d = parseLocalDate(date)
  d.setHours(23, 59, 59, 999)
  return d
}

export const isToday = (date) => {
  const today = startOfDay(new Date())
  const target = startOfDay(date)
  return today.getTime() === target.getTime()
}

export const startOfWeek = (date) => {
  const d = startOfDay(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

export const endOfWeek = (date) => {
  const start = startOfWeek(date)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return endOfDay(end)
}

export const startOfMonth = (date) => {
  const d = startOfDay(date)
  d.setDate(1)
  return d
}

export const endOfMonth = (date) => {
  const d = new Date(date)
  d.setMonth(d.getMonth() + 1, 0)
  return endOfDay(d)
}

export const getWeekDays = (date) => {
  const start = startOfWeek(date)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export const addDays = (date, days) => {
  const d = parseLocalDate(date)
  d.setDate(d.getDate() + days)
  return d
}

export const daysBetween = (a, b) => {
  const start = startOfDay(a).getTime()
  const end = startOfDay(b).getTime()
  return Math.round((end - start) / MS_PER_DAY)
}

export const toIsoDate = (date) => {
  const d = parseLocalDate(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Buckets: 07-12 breakfast, 12-15 lunch, 15-19 snack, 19-24 dinner, 00-07 snack.
export const getMealTypeForTime = (date) => {
  const hour = parseLocalDate(date).getHours()
  if (hour >= 7 && hour < 12) return 'breakfast'
  if (hour >= 12 && hour < 15) return 'lunch'
  if (hour >= 19) return 'dinner'
  return 'snack'
}
