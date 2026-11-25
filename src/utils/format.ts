import type { Contact } from '../types'

export const digitsOf = (s: string) => s.replace(/\D/g, '')

/** Compare two phone numbers ignoring formatting and country prefixes. */
export function sameNumber(a: string, b: string): boolean {
  const x = digitsOf(a)
  const y = digitsOf(b)
  if (!x || !y) return false
  if (x.length < 7 || y.length < 7) return x === y
  return x.slice(-10) === y.slice(-10)
}

export function findByNumber(contacts: Contact[], number: string): Contact | undefined {
  return contacts.find((c) => sameNumber(c.phone, number))
}

export function fullName(c: Pick<Contact, 'first' | 'last'>): string {
  return [c.first, c.last].filter(Boolean).join(' ')
}

export function displayName(c: Contact): string {
  return fullName(c) || c.company || c.phone || 'No Name'
}

export function initials(c: Pick<Contact, 'first' | 'last' | 'company'>): string {
  // One word -> one letter; two or more words (first + last, or a multi-word first name) -> two letters.
  const words = [c.first, c.last].flatMap((w) => (w || '').trim().split(/\s+/)).filter(Boolean)
  if (words.length > 0) return words.slice(0, 2).map((w) => [...w][0]).join('').toUpperCase()
  return [...(c.company || '').trim()][0]?.toUpperCase() || ''
}

/** Key used for alphabetical sections (first name, like iOS default). */
export function sortKey(c: Contact): string {
  return (c.first || c.last || c.company || '#').trim().toLowerCase()
}

export function sectionLetter(c: Contact): string {
  const ch = sortKey(c)[0]?.toUpperCase() ?? '#'
  return /[A-Z]/.test(ch) ? ch : '#'
}

export function sortContacts(list: Contact[]): Contact[] {
  return [...list].sort((a, b) => {
    const la = sectionLetter(a)
    const lb = sectionLetter(b)
    if (la !== lb) {
      if (la === '#') return 1
      if (lb === '#') return -1
    }
    return sortKey(a).localeCompare(sortKey(b), 'en')
  })
}

const timeFmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' })
const weekdayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'long' })
const dateFmt = new Intl.DateTimeFormat('en-US', { day: '2-digit', month: '2-digit', year: '2-digit' })
const longFmt = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const startOfDay = (t: number) => {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** Recents-style timestamp: time today, "Yesterday", weekday, or date. */
export function recentLabel(at: number, now = Date.now()): string {
  const diffDays = Math.round((startOfDay(now) - startOfDay(at)) / 86_400_000)
  if (diffDays <= 0) return timeFmt.format(at)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return weekdayFmt.format(at)
  return dateFmt.format(at)
}

export const longDate = (at: number) => longFmt.format(at)

export function clock(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function durationLabel(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return s ? `${m} min ${s} sec` : `${m} min`
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

/** "2000-11-21" -> "November 21, 2000" (year left out for the placeholder years 0000 / 1604). */
export function formatDay(value: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!m) return value
  const y = Number(m[1])
  const d = new Date(2000, Number(m[2]) - 1, Number(m[3]))
  const md = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(d)
  return y === 0 || y === 1604 ? md : `${md}, ${y}`
}

/** Letters for the big profile bubble: always two when possible (first+last initials, else the first two letters). */
export function profileInitials(c: Pick<Contact, 'first' | 'last' | 'company'>): string {
  const words = [c.first, c.last].flatMap((w) => (w || '').trim().split(/\s+/)).filter(Boolean)
  if (words.length === 0) return (c.company || '').trim().slice(0, 2).toUpperCase()
  if (words.length === 1) return [...words[0]].slice(0, 2).join('').toUpperCase()
  return (([...words[0]][0] ?? '') + ([...words[1]][0] ?? '')).toUpperCase()
}
