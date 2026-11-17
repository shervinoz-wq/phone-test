export type TabId = 'calls' | 'contacts' | 'keypad'

export interface Contact {
  id: string
  first: string
  last: string
  company: string
  phone: string
  notes: string
}

export type CallKind = 'outgoing' | 'incoming' | 'missed'

export interface CallRecord {
  id: string
  contactId?: string
  number: string
  kind: CallKind
  /** timestamp in ms */
  at: number
  /** seconds */
  duration: number
}

/** Identifiers shown by dialing *#06# (all digits so they can be drawn as Code 128 barcodes). */
export interface DeviceIds {
  eid: string
  imei: string
  imei2: string
  meid: string
}

export interface Settings {
  keypadSounds: boolean
  /** name shown on "My Card" */
  myName: string
  deviceIds: DeviceIds
}

export interface PhoneState {
  contacts: Contact[]
  favourites: string[]
  recents: CallRecord[]
  settings: Settings
  lastDialed: string
  /** time the Recents tab was last opened (drives the missed-call badge) */
  recentsSeenAt: number
}

export interface CallSession {
  mode: 'outgoing' | 'incoming'
  number: string
  contactId?: string
}
