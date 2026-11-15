import type { Contact, PhoneLabel, RecentCall } from '../types'

type Row = [string, string, string, PhoneLabel, string, string, boolean?]

const ROWS: Row[] = [
  ['Amelia', 'Hart', 'Hart Design Studio', 'mobile', '+1 (555) 010-0101', 'amelia@example.com', true],
  ['Andre', 'Silva', '', 'iPhone', '+1 (555) 010-0102', 'andre.silva@example.com'],
  ['Benjamin', 'Cole', 'Northwind Traders', 'work', '+1 (555) 010-0103', 'ben.cole@example.com'],
  ['Chloe', 'Martin', '', 'mobile', '+1 (555) 010-0104', '', true],
  ['Daniel', 'Park', '', 'mobile', '+1 (555) 010-0105', 'daniel.park@example.com'],
  ['Emma', 'Wilson', 'Wilson & Co.', 'work', '+1 (555) 010-0106', 'emma@example.com', true],
  ['Fatima', 'Khan', '', 'mobile', '+1 (555) 010-0107', 'fatima.khan@example.com'],
  ['Gabriel', 'Rossi', '', 'home', '+1 (555) 010-0108', ''],
  ['Hannah', 'Lee', 'Contoso', 'work', '+1 (555) 010-0109', 'hannah.lee@example.com'],
  ['Isabella', 'Moreau', '', 'iPhone', '+1 (555) 010-0110', 'isa.moreau@example.com', true],
  ['Jack', 'Turner', '', 'mobile', '+1 (555) 010-0111', ''],
  ['Kenji', 'Tanaka', 'Tanaka Labs', 'work', '+1 (555) 010-0112', 'kenji@example.com'],
  ['Layla', 'Hassan', '', 'mobile', '+1 (555) 010-0113', 'layla.h@example.com'],
  ['Mateo', 'Garcia', '', 'mobile', '+1 (555) 010-0114', ''],
  ['Nora', 'Schmidt', '', 'home', '+1 (555) 010-0115', 'nora.s@example.com'],
  ['Oliver', 'Grant', 'Grant Legal', 'work', '+1 (555) 010-0116', 'oliver@example.com'],
  ['Priya', 'Patel', '', 'mobile', '+1 (555) 010-0117', 'priya.patel@example.com', true],
  ['Rafael', 'Costa', '', 'iPhone', '+1 (555) 010-0118', ''],
  ['Sofia', 'Novak', '', 'mobile', '+1 (555) 010-0119', 'sofia.novak@example.com'],
  ['Thomas', 'Brown', 'Brown Motors', 'work', '+1 (555) 010-0120', 'tom@example.com'],
  ['Victor', 'Lopez', '', 'mobile', '+1 (555) 010-0121', ''],
  ['Zoe', 'Adams', '', 'mobile', '+1 (555) 010-0122', 'zoe.adams@example.com'],
]

export function createSampleContacts(): Contact[] {
  const people: Contact[] = ROWS.map(([first, last, company, label, number, email, fav], i) => ({
    id: `c-${String(i + 1).padStart(2, '0')}`,
    first,
    last,
    company,
    phones: [{ label, number }],
    email,
    notes: '',
    favourite: Boolean(fav),
  }))
  const me: Contact = {
    id: 'me',
    first: 'John',
    last: 'Appleseed',
    company: '',
    phones: [{ label: 'mobile', number: '+1 (555) 010-0000' }],
    email: 'john@example.com',
    notes: '',
    favourite: false,
    isMe: true,
  }
  return [me, ...people]
}

const MIN = 60_000
const HOUR = 60 * MIN
const DAY = 24 * HOUR

export function createSampleRecents(): RecentCall[] {
  const now = Date.now()
  const rows: [string, RecentCall['kind'], number, number][] = [
    ['+1 (555) 010-0101', 'outgoing', 25 * MIN, 184],
    ['+1 (555) 010-0104', 'missed', 3 * HOUR, 0],
    ['+1 (555) 010-0106', 'incoming', 6 * HOUR, 422],
    ['+1 (555) 010-0123', 'missed', 20 * HOUR, 0],
    ['+1 (555) 010-0110', 'outgoing', 1 * DAY + 2 * HOUR, 61],
    ['+1 (555) 010-0117', 'incoming', 2 * DAY, 905],
    ['+1 (555) 010-0112', 'missed', 3 * DAY, 0],
    ['+1 (555) 010-0103', 'outgoing', 4 * DAY, 37],
    ['+1 (555) 010-0109', 'incoming', 9 * DAY, 240],
    ['+1 (555) 010-0102', 'outgoing', 12 * DAY, 15],
  ]
  return rows.map(([number, kind, ago, duration], i) => ({
    id: `r-${i + 1}`,
    number,
    kind,
    date: new Date(now - ago).toISOString(),
    duration,
  }))
}
