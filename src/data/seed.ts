import type { PhoneState } from '../types'
import { DEFAULT_DEVICE_IDS } from '../utils/deviceIds'

/**
 * Initial state: like a freshly set-up iPhone – no contacts, no favorites,
 * no recent calls. Everything the user adds is stored locally.
 */
export function createSeedState(now = Date.now()): PhoneState {
  return {
    contacts: [],
    favourites: [],
    recents: [],
    settings: { keypadSounds: true, myName: 'saman aghil', deviceIds: { ...DEFAULT_DEVICE_IDS } },
    lastDialed: '',
    recentsSeenAt: now,
  }
}
