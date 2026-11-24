import { createContext, useContext } from 'react'
import type { TabId } from '../types'

export interface AppApi {
  openContact: (id: string, from: TabId) => void
  startCall: (number: string, contactId?: string) => void
  simulateIncoming: () => void
  newContact: (prefillNumber?: string, opts?: { morph?: 'center' | 'plus'; from?: DOMRect }) => void
  editContact: (id: string) => void
  shareContact: (id: string) => void
  blockContact: (id: string) => void
  pickFavourite: () => void
  editMyCard: () => void
  resetData: () => void
  showImei: () => void
  editDeviceIds: () => void
  toast: (message: string) => void
}

export const AppContext = createContext<AppApi | null>(null)

export function useApp(): AppApi {
  const v = useContext(AppContext)
  if (!v) throw new Error('useApp must be used inside <AppContext.Provider>')
  return v
}
