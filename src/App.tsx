import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from 'react'
import { BatteryIcon, SignalIcon, WifiIcon } from './components/Icons'
import { ActionSheet, Sheet } from './components/Sheet'
import { TabBar } from './components/TabBar'
import { Toast } from './components/Toast'
import { AppContext, type AppApi } from './hooks/useApp'
import { useFrameScale } from './hooks/useFrameScale'
import { StoreProvider, useStore } from './hooks/useStore'
import { useTransitionMount } from './hooks/useTransitionMount'
import { CallScreen } from './pages/CallScreen'
import { ContactDetailPage } from './pages/ContactDetailPage'
import { ContactForm } from './pages/ContactForm'
import { ContactPicker } from './pages/ContactPicker'
import { DeviceIdsForm } from './pages/DeviceIdsForm'
import { ImeiSheet } from './pages/ImeiSheet'
import { BlockPopover } from './pages/BlockPopover'
import { ShareContactSheet } from './pages/ShareContactSheet'
import { ContactsTab } from './pages/ContactsTab'
import { CallsPage } from './pages/CallsPage'
import { KeypadPage } from './pages/KeypadPage'
import { SearchOverlay } from './pages/SearchOverlay'
import type { CallKind, CallSession, Contact, TabId } from './types'
import { displayName, uid } from './utils/format'

const TAB_KEY = 'iphone-phone:tab'
const TAB_NAMES: Record<TabId, string> = {
  calls: 'Calls',
  contacts: 'Contacts',
  keypad: 'Keypad',
}

interface FormState {
  /** true when editing the "My Card" name instead of a contact */
  me?: boolean
  /** snapshot of the contact being edited, null for a new contact */
  contact: Contact | null
  number?: string
}

function loadTab(): TabId {
  try {
    const v = localStorage.getItem(TAB_KEY) as TabId | null
    if (v && v in TAB_NAMES) return v
  } catch {
    /* ignore */
  }
  return 'keypad'
}

function Shell() {
  const { state, dispatch } = useStore()
  const [tab, setTab] = useState<TabId>(loadTab)
  const [detail, setDetail] = useState<{ id: string; from: TabId } | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [call, setCall] = useState<{ session: CallSession; open: boolean } | null>(null)
  const [form, setForm] = useState<FormState | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formMorph, setFormMorph] = useState<'center' | 'plus' | undefined>(undefined)
  const [formFrom, setFormFrom] = useState<DOMRect | null>(null)
  const [pickOpen, setPickOpen] = useState(false)
  const [imeiOpen, setImeiOpen] = useState(false)
  const [idsOpen, setIdsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [shareId, setShareId] = useState<string | null>(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [blockId, setBlockId] = useState<string | null>(null)
  const [blockOpen, setBlockOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const toastTimer = useRef<number | undefined>(undefined)
  const incomingTimer = useRef<number | undefined>(undefined)

  /* ---------- tab persistence + missed badge ---------- */
  useEffect(() => {
    try {
      localStorage.setItem(TAB_KEY, tab)
    } catch {
      /* ignore */
    }
    if (tab === 'calls') dispatch({ type: 'recents/seen' })
  }, [tab, dispatch])

  const missedBadge = useMemo(
    () => state.recents.filter((r) => r.kind === 'missed' && r.at > state.recentsSeenAt).length,
    [state.recents, state.recentsSeenAt],
  )

  /* ---------- contact detail (push transition) ---------- */
  const detailContact = detail ? state.contacts.find((c) => c.id === detail.id) : undefined
  const { mounted: detailMounted, shown: detailShown } = useTransitionMount(detailOpen && !!detailContact, 340)

  const shareContact = shareId ? state.contacts.find((c) => c.id === shareId) : undefined

  /* ---------- API for pages ---------- */
  const toast = useCallback((message: string) => {
    window.clearTimeout(toastTimer.current)
    setToastMsg(message)
    toastTimer.current = window.setTimeout(() => setToastMsg(null), 2200)
  }, [])

  const api = useMemo<AppApi>(
    () => ({
      openContact: (id, from) => {
        setDetail({ id, from })
        setDetailOpen(true)
      },
      startCall: (number, contactId) => {
        dispatch({ type: 'dialed/set', number })
        setCall({ session: { mode: 'outgoing', number, contactId }, open: true })
      },
      simulateIncoming: () => {
        window.clearTimeout(incomingTimer.current)
        toast('Incoming call in 3 seconds…')
        incomingTimer.current = window.setTimeout(() => {
          const list = state.contacts
          const c = list[Math.floor(Math.random() * list.length)]
          setCall({
            session: { mode: 'incoming', number: c?.phone ?? '+1 (415) 555-0100', contactId: c?.id },
            open: true,
          })
        }, 3000)
      },
      newContact: (number, opts) => {
        setFormMorph(opts?.morph)
        setFormFrom(opts?.from ?? null)
        setForm({ contact: null, number })
        setFormOpen(true)
      },
      editContact: (id) => {
        setFormMorph(undefined)
        setForm({ contact: state.contacts.find((c) => c.id === id) ?? null })
        setFormOpen(true)
      },
      shareContact: (id) => {
        setShareId(id)
        setShareOpen(true)
      },
      blockContact: (id) => {
        const c = state.contacts.find((x) => x.id === id)
        if (!c) return
        if (c.blocked) {
          dispatch({ type: 'contact/save', contact: { ...c, blocked: false } })
          toast('Contact unblocked')
          return
        }
        setBlockId(id)
        setBlockOpen(true)
      },
      pickFavourite: () => setPickOpen(true),
      editMyCard: () => {
        setFormMorph(undefined)
        const [first = '', ...rest] = state.settings.myName.trim().split(/\s+/)
        setForm({
          me: true,
          contact: { id: '__me__', first, last: rest.join(' '), company: '', phone: '', notes: '' },
        })
        setFormOpen(true)
      },
      resetData: () => setConfirmReset(true),
      showImei: () => setImeiOpen(true),
      editDeviceIds: () => setIdsOpen(true),
      toast,
    }),
    [dispatch, toast, state.contacts, state.settings.myName],
  )

  const endCall = (result: { kind: CallKind; duration: number }) => {
    if (!call) return
    const { session } = call
    dispatch({
      type: 'recent/add',
      record: {
        id: uid(),
        contactId: session.contactId,
        number: session.number,
        kind: result.kind,
        at: Date.now(),
        duration: result.duration,
      },
    })
    setCall({ session, open: false })
    window.setTimeout(() => setCall(null), 450)
  }

  const tabs: [TabId, ReactElement][] = [
    ['calls', <CallsPage key="r" />],
    ['contacts', <ContactsTab key="c" />],
    ['keypad', <KeypadPage key="k" />],
  ]

  return (
    <AppContext.Provider value={api}>
      <div className="stage">
        <div className="device">
          <div className="screen">
            <div className="fake-status" aria-hidden>
              <span className="fs-time">9:41</span>
              <span className="fs-icons">
                <SignalIcon />
                <WifiIcon />
                <BatteryIcon />
              </span>
            </div>
            <div className="island" aria-hidden />
            <div className="demo-ribbon" aria-hidden>
              <span>ios dialer demo</span>
            </div>

            <main className="panels">
              {tabs.map(([id, el]) => (
                <div key={id} className={`panel${tab === id ? ' active' : ''}`} aria-hidden={tab !== id}>
                  {el}
                </div>
              ))}

              {detailMounted && detailContact && detail && (
                <div className={`push${detailShown ? ' is-open' : ''}`}>
                  <ContactDetailPage
                    contact={detailContact}
                    backLabel={TAB_NAMES[detail.from]}
                    onBack={() => setDetailOpen(false)}
                  />
                </div>
              )}
            </main>

            <TabBar
              active={tab}
              missedBadge={missedBadge}
              hidden={searchOpen}
              onSearch={() => setSearchOpen(true)}
              onChange={(t) => {
                setDetailOpen(false)
                setTab(t)
              }}
            />

            <Sheet open={formOpen} morph={formMorph} morphFrom={formFrom} onClose={() => setFormOpen(false)}>
              {form && (
                <ContactForm
                  contact={form.contact}
                  prefillNumber={form.number}
                  title={form.me ? 'My Card' : undefined}
                  onCancel={() => setFormOpen(false)}
                  onSave={(contact) => {
                    if (form.me) {
                      dispatch({
                        type: 'settings/set',
                        patch: { myName: [contact.first, contact.last].filter(Boolean).join(' ') },
                      })
                    } else {
                      dispatch({ type: 'contact/save', contact })
                      if (!form.contact) toast('Contact saved')
                    }
                    setFormOpen(false)
                  }}
                  onDelete={
                    form.contact && !form.me
                      ? () => {
                          setDeleteTarget(form.contact)
                          setDeleteOpen(true)
                        }
                      : undefined
                  }
                />
              )}
            </Sheet>

            <Sheet open={shareOpen} onClose={() => setShareOpen(false)}>
              {shareContact && (
                <ShareContactSheet
                  contact={shareContact}
                  onDone={async (text) => {
                    setShareOpen(false)
                    try {
                      if (navigator.share) await navigator.share({ title: displayName(shareContact), text })
                      else toast('Sharing is not available on this device')
                    } catch {
                      /* dismissed */
                    }
                  }}
                />
              )}
            </Sheet>

            <Sheet open={imeiOpen} onClose={() => setImeiOpen(false)} className="imei-sheet">
              <ImeiSheet onClose={() => setImeiOpen(false)} />
            </Sheet>

            <Sheet open={idsOpen} onClose={() => setIdsOpen(false)}>
              <DeviceIdsForm
                onCancel={() => setIdsOpen(false)}
                onSave={(deviceIds) => {
                  dispatch({ type: 'settings/set', patch: { deviceIds } })
                  setIdsOpen(false)
                  toast('Identifiers saved')
                }}
              />
            </Sheet>

            <Sheet open={pickOpen} onClose={() => setPickOpen(false)}>
              <ContactPicker
                onCancel={() => setPickOpen(false)}
                onPick={(id) => {
                  dispatch({ type: 'favourite/add', id })
                  setPickOpen(false)
                }}
              />
            </Sheet>

            <ActionSheet
              open={deleteOpen}
              title={deleteTarget ? `Delete ${displayName(deleteTarget)}?` : undefined}
              onClose={() => setDeleteOpen(false)}
              actions={[
                {
                  label: 'Delete Contact',
                  destructive: true,
                  onClick: () => {
                    if (!deleteTarget) return
                    dispatch({ type: 'contact/delete', id: deleteTarget.id })
                    setFormOpen(false)
                    setDetailOpen(false)
                  },
                },
              ]}
            />

            <ActionSheet
              open={confirmReset}
              title="This deletes all contacts, favorites and recent calls."
              onClose={() => setConfirmReset(false)}
              actions={[
                {
                  label: 'Reset Data',
                  destructive: true,
                  onClick: () => {
                    dispatch({ type: 'reset' })
                    toast('All data cleared')
                  },
                },
              ]}
            />

            <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

            {call && <CallScreen key={call.session.number + call.session.mode} session={call.session} open={call.open} onEnd={endCall} />}

            <BlockPopover
              open={blockOpen}
              onClose={() => setBlockOpen(false)}
              onConfirm={() => {
                const c = state.contacts.find((x) => x.id === blockId)
                if (!c) return
                dispatch({ type: 'contact/save', contact: { ...c, blocked: true } })
                toast('Contact blocked')
              }}
            />

            <Toast message={toastMsg} />
            <div className="home-indicator" aria-hidden />
          </div>
        </div>
      </div>
    </AppContext.Provider>
  )
}

export default function App() {
  useFrameScale()
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
