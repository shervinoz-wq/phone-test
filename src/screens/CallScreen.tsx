import { useEffect, useRef, useState, type ComponentType } from 'react'
import { Avatar } from '../components/Avatar'
import { KeypadIcon, MicIcon, PersonCircleIcon, PhoneIcon, PlusIcon, SpeakerIcon, VideoIcon } from '../components/Icons'
import { formatTimer } from '../lib/format'
import type { Contact } from '../types'
import { displayName } from '../lib/contacts'

interface Props {
  number: string
  contact?: Contact
  onEnd: (durationSeconds: number) => void
}

type Toggle = 'mute' | 'keypad' | 'speaker'

const BUTTONS: { id: Toggle | 'add' | 'facetime' | 'contacts'; label: string; Icon: ComponentType<{ size?: number }>; toggle: boolean }[] = [
  { id: 'mute', label: 'mute', Icon: MicIcon, toggle: true },
  { id: 'keypad', label: 'keypad', Icon: KeypadIcon, toggle: true },
  { id: 'speaker', label: 'speaker', Icon: SpeakerIcon, toggle: true },
  { id: 'add', label: 'add call', Icon: PlusIcon, toggle: false },
  { id: 'facetime', label: 'FaceTime', Icon: VideoIcon, toggle: false },
  { id: 'contacts', label: 'contacts', Icon: PersonCircleIcon, toggle: false },
]

/** Simulated call screen: no real call is ever placed. */
export function CallScreen({ number, contact, onEnd }: Props) {
  const [connected, setConnected] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [active, setActive] = useState<Record<string, boolean>>({})
  const secondsRef = useRef(0)

  useEffect(() => {
    const t = window.setTimeout(() => setConnected(true), 2200)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!connected) return
    const t = window.setInterval(() => {
      secondsRef.current += 1
      setSeconds(secondsRef.current)
    }, 1000)
    return () => window.clearInterval(t)
  }, [connected])

  const name = contact ? displayName(contact) : number
  const label = contact?.phones.find((p) => p.number === number)?.label ?? 'mobile'

  return (
    <div className="call-screen" role="dialog" aria-label="Call">
      <div className="call-top">
        <Avatar contact={contact} size={92} />
        <div className="call-name">{name}</div>
        <div className="call-status">{connected ? formatTimer(seconds) : `calling ${label}…`}</div>
      </div>
      <div className="call-grid">
        {BUTTONS.map(({ id, label: text, Icon, toggle }) => (
          <div className="call-grid-item" key={id}>
            <button
              className={'call-circle' + (active[id] ? ' on' : '')}
              aria-pressed={toggle ? Boolean(active[id]) : undefined}
              onClick={() => toggle && setActive((a) => ({ ...a, [id]: !a[id] }))}
            >
              <Icon size={30} />
            </button>
            <span>{text}</span>
          </div>
        ))}
      </div>
      <button className="end-btn" aria-label="End call" onClick={() => onEnd(connected ? secondsRef.current : 0)}>
        <span style={{ display: 'inline-flex', transform: 'rotate(135deg)' }}>
          <PhoneIcon size={36} />
        </span>
      </button>
    </div>
  )
}
