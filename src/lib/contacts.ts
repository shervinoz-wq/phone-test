import type { Contact } from '../types'

export const PHONE_LABELS = ['mobile', 'iPhone', 'home', 'work', 'other'] as const

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function displayName(c: Contact): string {
  const name = [c.first, c.last].filter(Boolean).join(' ').trim()
  return name || c.company || c.phones[0]?.number || 'No Name'
}

export function initials(c: Contact): string {
  const a = c.first.trim()[0] ?? ''
  const b = c.last.trim()[0] ?? ''
  const text = (a + b).toUpperCase()
  return text || (c.company.trim()[0] ?? '').toUpperCase()
}

function sortName(c: Contact): string {
  return (c.first || c.last || c.company || c.phones[0]?.number || '').toLocaleLowerCase()
}

export function sectionLetter(c: Contact): string {
  const ch = sortName(c)[0]?.toLocaleUpperCase() ?? '#'
  return /\p{L}/u.test(ch) ? ch : '#'
}

export function sortContacts(list: Contact[]): Contact[] {
  return [...list].sort((a, b) => sortName(a).localeCompare(sortName(b), undefined, { sensitivity: 'base' }))
}

export interface Section {
  letter: string
  items: Contact[]
}

export function groupContacts(list: Contact[]): Section[] {
  const map = new Map<string, Contact[]>()
  for (const c of sortContacts(list)) {
    const letter = sectionLetter(c)
    map.set(letter, [...(map.get(letter) ?? []), c])
  }
  const letters = [...map.keys()].sort((a, b) => {
    if (a === '#') return 1
    if (b === '#') return -1
    return a.localeCompare(b)
  })
  return letters.map((letter) => ({ letter, items: map.get(letter) ?? [] }))
}

export const digitsOf = (n: string): string => n.replace(/\D/g, '')

export function samePhone(a: string, b: string): boolean {
  const da = digitsOf(a)
  const db = digitsOf(b)
  if (!da || !db) return false
  if (da === db) return true
  return da.length >= 7 && db.length >= 7 && da.slice(-10) === db.slice(-10)
}

export function findContactByNumber(contacts: Contact[], number: string): Contact | undefined {
  if (digitsOf(number).length < 3) return undefined
  return contacts.find((c) => c.phones.some((p) => samePhone(p.number, number)))
}

export function matchesQuery(c: Contact, q: string): boolean {
  const query = q.trim().toLocaleLowerCase()
  if (!query) return true
  const hay = [c.first, c.last, c.company, c.email, ...c.phones.map((p) => p.number)]
    .join(' ')
    .toLocaleLowerCase()
  const qd = digitsOf(query)
  return hay.includes(query) || (qd.length > 0 && c.phones.some((p) => digitsOf(p.number).includes(qd)))
}
