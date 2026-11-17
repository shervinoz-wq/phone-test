import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DialKey } from '../components/DialKey'
import { DIAL_KEYS } from '../components/dialKeys'
import { AddContactIcon, BackspaceFilledIcon, PersonFillCircleIcon, PhoneIcon, SearchIcon } from '../components/Icons'
import { useApp } from '../hooks/useApp'
import { usePressAnimation } from '../hooks/usePressAnimation'
import { useStore } from '../hooks/useStore'
import { displayName, findByNumber } from '../utils/format'
import { suggestContacts, type Suggestion } from '../utils/suggest'
import { playTone } from '../utils/sound'

const MAX_LENGTH = 32

export function KeypadPage() {
  const { state } = useStore()
  const app = useApp()
  const [number, setNumber] = useState('')
  const [expanded, setExpanded] = useState(false)
  const callAnim = usePressAnimation<HTMLButtonElement>('call')
  const holdRef = useRef<number | undefined>(undefined)
  const repeatRef = useRef<number | undefined>(undefined)

  const match = number ? findByNumber(state.contacts, number) : undefined
  const sounds = state.settings.keypadSounds
  const suggestions = useMemo(() => suggestContacts(state.contacts, number), [state.contacts, number])
  const shownList = expanded ? suggestions : suggestions.slice(0, 1)
  const more = suggestions.length - 1

  useEffect(() => {
    if (suggestions.length < 2) setExpanded(false)
  }, [suggestions.length])

  // *#06# opens the device identifiers (IMEI) sheet and clears the field at once.
  // *1*1# opens the editor for those identifiers (IMEI edit page).
  useEffect(() => {
    if (number === '*#06#') {
      setNumber('')
      app.showImei()
    } else if (number === '*1*1#') {
      setNumber('')
      app.editDeviceIds()
    }
  }, [number, app])

  const press = useCallback(
    (d: string) => {
      if (sounds) playTone(d)
      setNumber((n) => (n.length >= MAX_LENGTH ? n : n + d))
    },
    [sounds],
  )

  const hold = useCallback((plus: string) => {
    setNumber((n) => (n.endsWith('0') ? n.slice(0, -1) + plus : n))
  }, [])

  const stopDelete = () => {
    window.clearTimeout(holdRef.current)
    window.clearInterval(repeatRef.current)
  }
  const startDelete = () => {
    setNumber((n) => n.slice(0, -1))
    stopDelete()
    holdRef.current = window.setTimeout(() => {
      repeatRef.current = window.setInterval(() => setNumber((n) => n.slice(0, -1)), 90)
    }, 450)
  }
  useEffect(() => stopDelete, [])
  useEffect(() => {
    if (!number) stopDelete()
  }, [number])

  const call = () => {
    if (number) {
      app.startCall(number, match?.id)
      setNumber('')
    } else if (state.lastDialed) {
      // Like iOS: pressing call on an empty keypad recalls the last number.
      setNumber(state.lastDialed)
    }
  }

  const size = number.length <= 11 ? 34 : number.length <= 14 ? 30 : number.length <= 18 ? 25 : 21

  const pick = (sg: Suggestion) => {
    const typed = sg.contact.phone.replace(/[\s()-]/g, '')
    setNumber(typed.slice(0, MAX_LENGTH))
    setExpanded(false)
  }

  return (
    <div className="page keypad-page">
      <div className="dial-top">
        {number && (
          <button
            type="button"
            className="add-contact-btn"
            aria-label="Add to contacts"
            onClick={() => app.newContact(number)}
          >
            <AddContactIcon size={27} />
          </button>
        )}
        <div className="dial-number" style={{ fontSize: size }} aria-live="polite">
          {number || '\u00A0'}
        </div>
        <div className="dial-sub">
          {suggestions.length > 0 && (
            <div className={`suggest-card${expanded ? ' open' : ''}`}>
              {shownList.map((sg) => (
                <button type="button" key={sg.contact.id} className="suggest-row" onClick={() => pick(sg)}>
                  <PersonFillCircleIcon size={19} className="sg-ico" />
                  <span className="sg-name">{displayName(sg.contact)}</span>
                  <span className="sg-num" dir="ltr">
                    {sg.hit ? (
                      <>
                        {sg.shown.slice(0, sg.hit[0])}
                        <b>{sg.shown.slice(sg.hit[0], sg.hit[1])}</b>
                        {sg.shown.slice(sg.hit[1])}
                      </>
                    ) : (
                      sg.shown
                    )}
                  </span>
                </button>
              ))}
              {!expanded && more > 0 && (
                <button type="button" className="suggest-row more" onClick={() => setExpanded(true)}>
                  <SearchIcon size={18} className="sg-ico" />
                  <span className="sg-more">
                    {more} More Result{more > 1 ? 's' : ''}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="dial-grid">
        {DIAL_KEYS.map(([d, l]) => (
          <DialKey key={d} digit={d} letters={l} onPress={press} onHold={hold} />
        ))}
      </div>

      <div className="dial-actions">
        <span className="dial-spacer" />
        <button
          ref={callAnim.btn}
          type="button"
          className="call-btn"
          aria-label="Call"
          onClick={call}
          onPointerDown={callAnim.down}
          onPointerUp={callAnim.up}
          onPointerLeave={callAnim.up}
          onPointerCancel={callAnim.up}
          onContextMenu={(e) => e.preventDefault()}
        >
          <PhoneIcon size={34} />
        </button>
        <span className="dial-spacer">
          {number && (
            <button
              type="button"
              className="backspace-btn"
              aria-label="Delete"
              onPointerDown={startDelete}
              onPointerUp={stopDelete}
              onPointerLeave={stopDelete}
              onPointerCancel={stopDelete}
              onContextMenu={(e) => e.preventDefault()}
            >
              <BackspaceFilledIcon size={31} />
            </button>
          )}
        </span>
      </div>
    </div>
  )
}
