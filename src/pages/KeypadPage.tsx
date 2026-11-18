import { useCallback, useEffect, useRef, useState } from 'react'
import { DialKey } from '../components/DialKey'
import { DIAL_KEYS } from '../components/dialKeys'
import { AddContactIcon, BackspaceFilledIcon, PhoneIcon } from '../components/Icons'
import { playTone } from '../utils/sound'

const MAX_LENGTH = 32

/**
 * Demo keypad: digits, sound, 0-hold = "+", backspace (hold = repeat).
 * The call button and the add-contact icon are inert, and no dial code
 * (*#06#, *1*1#, ...) triggers anything.
 */
export function KeypadPage() {
  const [number, setNumber] = useState('')
  const holdRef = useRef<number | undefined>(undefined)
  const repeatRef = useRef<number | undefined>(undefined)

  const press = useCallback((d: string) => {
    playTone(d)
    setNumber((n) => (n.length >= MAX_LENGTH ? n : n + d))
  }, [])

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

  const size = number.length <= 11 ? 34 : number.length <= 14 ? 30 : number.length <= 18 ? 25 : 21

  return (
    <div className="page keypad-page">
      <div className="dial-top">
        {number && (
          <button type="button" className="add-contact-btn" aria-label="Add to contacts" tabIndex={-1}>
            <AddContactIcon size={27} />
          </button>
        )}
        <div className="dial-number" style={{ fontSize: size }} aria-live="polite">
          {number || '\u00A0'}
        </div>
        <div className="dial-sub" />
      </div>

      <div className="dial-grid">
        {DIAL_KEYS.map(([d, l]) => (
          <DialKey key={d} digit={d} letters={l} onPress={press} onHold={hold} />
        ))}
      </div>

      <div className="dial-actions">
        <span className="dial-spacer" />
        <button type="button" className="call-btn" aria-label="Call" tabIndex={-1}>
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
