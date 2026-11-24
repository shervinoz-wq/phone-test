import { createContext, useContext, useEffect, useMemo, useReducer, type Dispatch, type ReactNode } from 'react'
import { createSeedState } from '../data/seed'
import type { CallRecord, Contact, ContactList, PhoneState, Settings } from '../types'

const STORAGE_KEY = 'iphone-phone:v2'

export type Action =
  | { type: 'contact/save'; contact: Contact }
  | { type: 'contact/delete'; id: string }
  | { type: 'list/add'; list: ContactList }
  | { type: 'list/rename'; id: string; name: string }
  | { type: 'list/delete'; id: string }
  | { type: 'favourite/add'; id: string }
  | { type: 'favourite/remove'; id: string }
  | { type: 'recent/add'; record: CallRecord }
  | { type: 'recent/delete'; id: string }
  | { type: 'recent/clear' }
  | { type: 'settings/set'; patch: Partial<Settings> }
  | { type: 'dialed/set'; number: string }
  | { type: 'recents/seen' }
  | { type: 'reset' }

function reducer(state: PhoneState, action: Action): PhoneState {
  switch (action.type) {
    case 'contact/save': {
      const exists = state.contacts.some((c) => c.id === action.contact.id)
      return {
        ...state,
        contacts: exists
          ? state.contacts.map((c) => (c.id === action.contact.id ? action.contact : c))
          : [...state.contacts, action.contact],
      }
    }
    case 'contact/delete':
      return {
        ...state,
        contacts: state.contacts.filter((c) => c.id !== action.id),
        favourites: state.favourites.filter((f) => f !== action.id),
        recents: state.recents.map((r) => (r.contactId === action.id ? { ...r, contactId: undefined } : r)),
      }
    case 'list/add':
      return { ...state, lists: [...state.lists, action.list] }
    case 'list/rename':
      return { ...state, lists: state.lists.map((l) => (l.id === action.id ? { ...l, name: action.name } : l)) }
    case 'list/delete':
      return { ...state, lists: state.lists.filter((l) => l.id !== action.id) }
    case 'favourite/add':
      return state.favourites.includes(action.id)
        ? state
        : { ...state, favourites: [...state.favourites, action.id] }
    case 'favourite/remove':
      return { ...state, favourites: state.favourites.filter((f) => f !== action.id) }
    case 'recent/add':
      // Calls list is intentionally always empty: nothing is ever recorded.
      return state
    case 'recent/delete':
      return { ...state, recents: state.recents.filter((r) => r.id !== action.id) }
    case 'recent/clear':
      return { ...state, recents: [] }
    case 'settings/set':
      return { ...state, settings: { ...state.settings, ...action.patch } }
    case 'dialed/set':
      return { ...state, lastDialed: action.number }
    case 'recents/seen':
      return { ...state, recentsSeenAt: Date.now() }
    case 'reset':
      return createSeedState()
  }
}

function load(): PhoneState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as PhoneState
      if (Array.isArray(parsed.contacts) && Array.isArray(parsed.recents)) {
        return { ...createSeedState(), ...parsed, lists: Array.isArray(parsed.lists) ? parsed.lists : [], recents: [], settings: {
            ...createSeedState().settings,
            ...parsed.settings,
            deviceIds: { ...createSeedState().settings.deviceIds, ...parsed.settings?.deviceIds },
          },
        }
      }
    }
  } catch {
    /* corrupted storage -> fall back to the sample data */
  }
  return createSeedState()
}

interface StoreValue {
  state: PhoneState
  dispatch: Dispatch<Action>
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* storage full or unavailable (private mode) – keep working in memory */
    }
  }, [state])

  const value = useMemo(() => ({ state, dispatch }), [state])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore(): StoreValue {
  const v = useContext(StoreContext)
  if (!v) throw new Error('useStore must be used inside <StoreProvider>')
  return v
}
