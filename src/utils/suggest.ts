import type { Contact } from '../types'
import { digitsOf, fullName } from './format'

const T9: Record<string, string> = {}
;[
  ['2', 'abc'],
  ['3', 'def'],
  ['4', 'ghi'],
  ['5', 'jkl'],
  ['6', 'mno'],
  ['7', 'pqrs'],
  ['8', 'tuv'],
  ['9', 'wxyz'],
].forEach(([d, ls]) => [...ls].forEach((l) => (T9[l] = d)))

/** Latin letters of a name -> keypad digits (T9), other characters are skipped. */
const t9 = (s: string) => [...s.toLowerCase()].map((c) => T9[c] ?? '').join('')

export interface Suggestion {
  contact: Contact
  /** phone as shown, e.g. "0914 148 3901" */
  shown: string
  /** [start, end) range inside `shown` that matches what was typed */
  hit: [number, number] | null
}

/** Groups digits like the iPhone does for national numbers. */
export function formatPhone(raw: string): string {
  if (/[\s()-]/.test(raw)) return raw.trim()
  const plus = raw.startsWith('+') ? '+' : ''
  const d = digitsOf(raw)
  if (!plus && d.length === 11 && d.startsWith('0')) return `${d.slice(0, 4)} ${d.slice(4, 7)} ${d.slice(7)}`
  if (!plus && d.length === 10) return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
  return raw
}

/** Maps a digit range of the phone to a range inside the formatted string. */
function hitRange(shown: string, from: number, len: number): [number, number] {
  let seen = -1
  let s = -1
  let e = -1
  for (let i = 0; i < shown.length; i++) {
    if (!/\d/.test(shown[i])) continue
    seen++
    if (seen === from) s = i
    if (seen === from + len - 1) e = i + 1
  }
  return [s, e]
}

/**
 * Contacts matching what is typed on the keypad: by the digits of their number
 * (anywhere inside it) or by the letters of their name (T9). Number matches that
 * start at the beginning come first.
 */
export function suggestContacts(contacts: Contact[], typed: string): Suggestion[] {
  const q = typed.replace(/[^0-9]/g, '')
  if (!q) return []
  const out: { s: Suggestion; rank: number }[] = []
  for (const c of contacts) {
    if (!c.phone) continue
    const d = digitsOf(c.phone)
    const shown = formatPhone(c.phone)
    const at = d.indexOf(q)
    if (at >= 0) {
      out.push({ s: { contact: c, shown, hit: hitRange(shown, at, q.length) }, rank: at === 0 ? 0 : 2 })
    } else if (t9(fullName(c) || c.company).includes(q)) {
      out.push({ s: { contact: c, shown, hit: null }, rank: 1 })
    }
  }
  return out.sort((a, b) => a.rank - b.rank).map((x) => x.s)
}
