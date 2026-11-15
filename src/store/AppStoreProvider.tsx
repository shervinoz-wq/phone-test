import type { ReactNode } from 'react'
import { createSampleContacts, createSampleRecents } from '../data/sample'
import { uid } from '../lib/contacts'
import type { Contact, RecentCall, Settings } from '../types'
import { AppStoreContext, type AppStore } from './context'
import { usePersistentState } from './usePersistentState'

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [contacts, setContacts] = usePersistentState<Contact[]>('iphone-phone:contacts:v1', createSampleContacts)
  const [recents, setRecents] = usePersistentState<RecentCall[]>('iphone-phone:recents:v1', createSampleRecents)
  const [settings, setSettings] = usePersistentState<Settings>('iphone-phone:settings:v1', () => ({
    keypadSounds: true,
  }))

  const store: AppStore = {
    contacts,
    recents,
    settings,
    saveContact: (contact) =>
      setContacts((list) =>
        list.some((c) => c.id === contact.id)
          ? list.map((c) => (c.id === contact.id ? contact : c))
          : [...list, contact],
      ),
    deleteContact: (id) => setContacts((list) => list.filter((c) => c.id !== id)),
    setFavourite: (id, favourite) =>
      setContacts((list) => list.map((c) => (c.id === id ? { ...c, favourite } : c))),
    addRecent: (call) =>
      setRecents((list) => [{ ...call, id: uid(), date: new Date().toISOString() }, ...list].slice(0, 200)),
    deleteRecent: (id) => setRecents((list) => list.filter((r) => r.id !== id)),
    clearRecents: () => setRecents([]),
    updateSettings: (patch) => setSettings((s) => ({ ...s, ...patch })),
    resetData: () => {
      setContacts(createSampleContacts())
      setRecents(createSampleRecents())
    },
  }

  return <AppStoreContext value={store}>{children}</AppStoreContext>
}
