import { useMemo, useRef, useState } from 'react'
import { BackspaceIcon, PhoneIcon } from '../components/Icons'
import { displayName, findContactByNumber } from '../lib/contacts'
import { startTone } from '../lib/dtmf'
import { useAppStore } from '../store/useAppStore'

const KEYS: [string, string][] = [
  ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
  ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
  ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
  ['*', ''], ['0', '+'], ['#', ''],
]

const MAX_LENGTH = 32

interface Props {
  onCall: (number: string) => void
  onAddNumber: (number: string) => void
}

export function KeypadScreen({ onCall, onAddNumber }: Props) {
  const { contacts, recents, settings } = useAppStore()
  const [value, setValue] = useState('')
  const [pressed, setPressed] = useState<string | null>(null)
  const stopTone = useRef<(() => void) | null>(null)
  const holdTimer = useRef<number | undefined>(undefined)
  const repeatTimer = useRef<number | undefined>(undefined)

  const match = useMemo(() => findContactByNumber(contacts, value), [contacts, value])

  const pressKey = (key: string) => {
    setPressed(key)
    setValue((v) => (v.length < MAX_LENGTH ? v + key : v))
    if (settings.keypadSounds) stopTone.current = startTone(key)
    if (key === '0') {
      holdTimer.current = window.setTimeout(() => {
        setValue((v) => (v.endsWith('0') ? v.slice(0, -1) + '+' : v))
      }, 450)
    }
  }

  const releaseKey = () => {
    setPressed(null)
    window.clearTimeout(holdTimer.current)
    stopTone.current?.()
    stopTone.current = null
  }

  const startDelete = () => {
    setValue((v) => v.slice(0, -1))
    holdTimer.current = window.setTimeout(() => {
      repeatTimer.current = window.setInterval(() => setValue((v) => v.slice(0, -1)), 85)
    }, 400)
  }

  const stopDelete = () => {
    window.clearTimeout(holdTimer.current)
    window.clearInterval(repeatTimer.current)
  }

  const call = () => {
    if (!value) {
      const last = recents.find((r) => r.kind === 'outgoing')
      if (last) setValue(last.number)
      return
    }
    onCall(value)
  }

  const size = value.length <= 11 ? 36 : Math.max(20, 36 - (value.length - 11) * 1.5)

  return (
    <div className="keypad">
      <div className="keypad-display">
        <div className="keypad-number" style={{ fontSize: size }} aria-live="polite">
          {value}
        </div>
        <div className="keypad-sub">
          {value &&
            (match ? (
              <span className="keypad-match">{displayName(match)}</span>
            ) : (
              <button className="link-btn" onClick={() => onAddNumber(value)}>
                Add Number
              </button>
            ))}
        </div>
      </div>

      <div className="keys">
        {KEYS.map(([digit, letters]) => (
          <button
            key={digit}
            className={'key' + (digit === '*' ? ' star' : '') + (pressed === digit ? ' pressed' : '')}
            aria-label={digit}
            onPointerDown={() => pressKey(digit)}
            onPointerUp={releaseKey}
            onPointerLeave={() => pressed === digit && releaseKey()}
            onPointerCancel={releaseKey}
            onContextMenu={(e) => e.preventDefault()}
          >
            <span className="digit">{digit}</span>
            {letters && <span className="letters">{letters}</span>}
          </button>
        ))}
      </div>

      <div className="call-row">
        <span />
        <button className="call-btn" aria-label="Call" onClick={call}>
          <PhoneIcon size={34} />
        </button>
        <button
          className={'delete-btn' + (value ? '' : ' hidden')}
          aria-label="Delete"
          onPointerDown={startDelete}
          onPointerUp={stopDelete}
          onPointerLeave={stopDelete}
          onPointerCancel={stopDelete}
          onContextMenu={(e) => e.preventDefault()}
        >
          <BackspaceIcon size={32} />
        </button>
      </div>
    </div>
  )
}
