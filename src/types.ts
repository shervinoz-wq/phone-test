export type PhoneLabel = 'mobile' | 'iPhone' | 'home' | 'work' | 'other'

export interface PhoneEntry {
  label: PhoneLabel
  number: string
}

export interface Contact {
  id: string
  first: string
  last: string
  company: string
  phones: PhoneEntry[]
  email: string
  notes: string
  favourite: boolean
  isMe?: boolean
}

export type CallKind = 'outgoing' | 'incoming' | 'missed'

export interface RecentCall {
  id: string
  number: string
  kind: CallKind
  date: string
  duration: number
}

export type TabId = 'favourites' | 'recents' | 'contacts' | 'keypad' | 'settings'

export interface Settings {
  keypadSounds: boolean
}
