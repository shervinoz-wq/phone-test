import { createContext } from 'react'
import type { Contact, RecentCall, Settings } from '../types'

export interface AppStore {
  contacts: Contact[]
  recents: RecentCall[]
  settings: Settings
  saveContact: (contact: Contact) => void
  deleteContact: (id: string) => void
  setFavourite: (id: string, favourite: boolean) => void
  addRecent: (call: Omit<RecentCall, 'id' | 'date'>) => void
  deleteRecent: (id: string) => void
  clearRecents: () => void
  updateSettings: (patch: Partial<Settings>) => void
  resetData: () => void
}

export const AppStoreContext = createContext<AppStore | null>(null)
