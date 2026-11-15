import { useState } from 'react'
import { TabBar } from './components/TabBar'
import { ContactDetail } from './screens/ContactDetail'
import { ContactEditor, type EditorState } from './screens/ContactEditor'
import { ContactPicker } from './screens/ContactPicker'
import { ContactsScreen } from './screens/ContactsScreen'
import { CallScreen } from './screens/CallScreen'
import { FavouritesScreen } from './screens/FavouritesScreen'
import { KeypadScreen } from './screens/KeypadScreen'
import { RecentsScreen } from './screens/RecentsScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { findContactByNumber } from './lib/contacts'
import { AppStoreProvider } from './store/AppStoreProvider'
import { usePersistentState } from './store/usePersistentState'
import { useAppStore } from './store/useAppStore'
import type { TabId } from './types'

const BACK_LABELS: Record<TabId, string> = {
  favourites: 'Favourites',
  recents: 'Recents',
  contacts: 'Contacts',
  keypad: 'Keypad',
  settings: 'Settings',
}

function Shell() {
  const { contacts, addRecent } = useAppStore()
  const [tab, setTab] = usePersistentState<TabId>('iphone-phone:tab', () => 'keypad')
  const [detail, setDetail] = useState<{ id: string; key: number } | null>(null)
  const [editor, setEditor] = useState<EditorState | null>(null)
  const [picker, setPicker] = useState(false)
  const [call, setCall] = useState<string | null>(null)

  const selectTab = (next: TabId) => {
    setDetail(null)
    setTab(next)
  }

  const openDetail = (id: string) => setDetail({ id, key: Date.now() })
  const startCall = (number: string) => setCall(number)
  const callContact = call ? findContactByNumber(contacts, call) : undefined

  const endCall = (duration: number) => {
    if (call) addRecent({ number: call, kind: 'outgoing', duration })
    setCall(null)
  }

  const pane = (id: TabId) => 'tab-pane' + (tab === id ? ' active' : '')

  return (
    <div className="app">
      <main className="screens">
        <div className={pane('favourites')}>
          <FavouritesScreen
            onCall={startCall}
            onOpenContact={openDetail}
            onAddFavourite={() => setPicker(true)}
          />
        </div>
        <div className={pane('recents')}>
          <RecentsScreen
            onCall={startCall}
            onOpenContact={openDetail}
            onAddNumber={(number) => setEditor({ contact: null, prefillNumber: number })}
          />
        </div>
        <div className={pane('contacts')}>
          <ContactsScreen onOpen={openDetail} onAdd={() => setEditor({ contact: null })} />
        </div>
        <div className={pane('keypad')}>
          <KeypadScreen
            onCall={startCall}
            onAddNumber={(number) => setEditor({ contact: null, prefillNumber: number })}
          />
        </div>
        <div className={pane('settings')}>
          <SettingsScreen />
        </div>

        {detail && (
          <ContactDetail
            key={detail.key}
            id={detail.id}
            backLabel={BACK_LABELS[tab]}
            onClosed={() => setDetail(null)}
            onEdit={(id) => setEditor({ contact: contacts.find((c) => c.id === id) ?? null })}
            onCall={startCall}
          />
        )}
      </main>

      <TabBar active={tab} onSelect={selectTab} />

      {editor && (
        <ContactEditor
          state={editor}
          onClosed={() => setEditor(null)}
          onDeleted={(id) => setDetail((d) => (d?.id === id ? null : d))}
          onSaved={() => {}}
        />
      )}
      {picker && <ContactPicker onClosed={() => setPicker(false)} />}
      {call && <CallScreen number={call} contact={callContact} onEnd={endCall} />}
    </div>
  )
}

export default function App() {
  return (
    <AppStoreProvider>
      <Shell />
    </AppStoreProvider>
  )
}
