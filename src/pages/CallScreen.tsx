import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { DialKey } from '../components/DialKey'
import { DIAL_KEYS } from '../components/dialKeys'
import {
  CloseIcon,
  EndCallIcon,
  MicOffIcon,
  PersonCropIcon,
  PersonPlusIcon,
  PhoneIcon,
  SpeakerIcon,
  VideoIcon,
} from '../components/Icons'
import { useStore } from '../hooks/useStore'
import { useTransitionMount } from '../hooks/useTransitionMount'
import type { CallKind, CallSession } from '../types'
import { clock, displayName, findByNumber } from '../utils/format'
import { setSystemBarColor } from '../utils/pwa'
import { playTone } from '../utils/sound'

type Phase = 'calling' | 'connected' | 'incoming' | 'failed' | 'loading' | 'error'

interface Props {
  session: CallSession
  open: boolean
  onEnd: (result: { kind: CallKind; duration: number }) => void
}

export function CallScreen({ session, open, onEnd }: Props) {
  const { state } = useStore()
  const { mounted, shown } = useTransitionMount(open, session.mode === 'incoming' ? 380 : 220)

  const contact = session.contactId
    ? state.contacts.find((c) => c.id === session.contactId)
    : findByNumber(state.contacts, session.number)
  const title = contact ? displayName(contact) : session.number

  const [phase, setPhase] = useState<Phase>(session.mode === 'incoming' ? 'incoming' : 'loading')
  const [seconds, setSeconds] = useState(0)
  const [muted, setMuted] = useState(false)
  const [speaker, setSpeaker] = useState(false)
  const [showKeypad, setShowKeypad] = useState(false)
  const [typed, setTyped] = useState('')
  const ended = useRef(false)
  const [cb, setCb] = useState<'idle' | 'down' | 'release'>('idle')
  const cbDownAt = useRef(0)
  const cbTimer = useRef(0)
  useEffect(() => () => window.clearTimeout(cbTimer.current), [])

  // Tint the system top bar (iOS standalone / Android) with the call wallpaper while this screen is open.
  useEffect(() => {
    const tint = phase === 'loading' || phase === 'error' ? '#515152' : phase === 'failed' ? '#5d5047' : '#5a5c66'
    return setSystemBarColor(tint)
  }, [phase])

  // Outgoing call: 2 s of "Please Wait…" and then the request error.
  useEffect(() => {
    if (phase !== 'loading') return
    const id = window.setTimeout(() => setPhase('error'), 2000)
    return () => window.clearTimeout(id)
  }, [phase])

  // Call timer.
  useEffect(() => {
    if (phase !== 'connected') return
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => window.clearInterval(id)
  }, [phase])

  const finish = (kind: CallKind) => {
    if (ended.current) return
    ended.current = true
    onEnd({ kind, duration: phase === 'connected' ? seconds : 0 })
  }

  // Call Back: press animation only (min. visible hold so quick taps still show it)
  const cbDown = () => {
    window.clearTimeout(cbTimer.current)
    cbDownAt.current = performance.now()
    setCb('down')
  }
  const cbUp = () => {
    if (cb !== 'down') return
    const wait = Math.max(0, 110 - (performance.now() - cbDownAt.current))
    cbTimer.current = window.setTimeout(() => setCb('release'), wait)
  }
  const cbClick = () => {
    // keyboard activation (no pointer events)
    if (cb !== 'idle') return
    cbDown()
    cbTimer.current = window.setTimeout(() => setCb('release'), 110)
  }

  const hangUp = () => finish(session.mode === 'incoming' ? (phase === 'connected' ? 'incoming' : 'missed') : 'outgoing')

  if (!mounted) return null

  if (phase === 'loading' || phase === 'error') {
    return (
      <div className={`req-screen${shown ? ' is-open' : ''}`} role="dialog" aria-label="Call">
        {phase === 'loading' ? (
          <div className="req-wait">
            <Spinner />
            <div className="req-wait-text">Please Wait...</div>
          </div>
        ) : (
          <>
            <div className="req-error">
              <div>Error performing request</div>
              <div>Unknown Error</div>
            </div>
            <button type="button" className="req-dismiss" onClick={() => finish('outgoing')}>
              Dismiss
            </button>
          </>
        )}
      </div>
    )
  }

  const status =
    phase === 'calling'
      ? 'calling…'
      : phase === 'connected'
        ? clock(seconds)
        : phase === 'failed'
          ? 'Call failed'
          : contact
            ? 'mobile'
            : 'unknown'

  const toggle = (label: string, active: boolean, set: (v: boolean) => void, icon: React.ReactNode) => (
    <button type="button" className={`call-ctrl${active ? ' active' : ''}`} aria-pressed={active} onClick={() => set(!active)}>
      <span className="call-circle">{icon}</span>
      <span className="call-label">{label}</span>
    </button>
  )
  const plain = (label: string, icon: React.ReactNode, onClick: () => void, disabled = false) => (
    <button type="button" className={`call-ctrl${disabled ? ' disabled' : ''}`} onClick={onClick}>
      <span className="call-circle">{icon}</span>
      <span className="call-label">{label}</span>
    </button>
  )

  return (
    <div className={`call-screen${shown ? ' is-open' : ''}${phase === 'failed' ? ' failed' : ''}`} role="dialog" aria-label="Call">
      <div className="call-top">
        {contact && phase === 'incoming' && <Avatar contact={contact} size={92} />}
        {phase === 'failed' ? (
          <>
            <div className="call-status failed-label">{status}</div>
            <h1 className="call-name">{title}</h1>
          </>
        ) : (
          <>
            <h1 className="call-name">{title}</h1>
            <div className="call-status">{status}</div>
          </>
        )}
        {showKeypad && <div className="call-typed">{typed || '\u00A0'}</div>}
      </div>

      {phase === 'failed' ? (
        <div className="incoming-actions">
          <div className="incoming-side">
            <button type="button" className="call-circle gray" aria-label="Cancel" onClick={() => finish('outgoing')}>
              <CloseIcon size={34} />
            </button>
            <span className="call-label">Cancel</span>
          </div>
          <div className={`incoming-side cb-side${cb === 'down' ? ' down' : cb === 'release' ? ' release' : ''}`} onAnimationEnd={() => setCb('idle')}>
            <button
              type="button"
              className="call-circle green"
              aria-label="Call Back"
              onPointerDown={cbDown}
              onPointerUp={cbUp}
              onPointerLeave={cbUp}
              onPointerCancel={cbUp}
              onClick={(e) => {
                if (e.detail === 0) cbClick()
              }}
            >
              <PhoneIcon size={37} />
            </button>
            <span className="call-label">Call Back</span>
          </div>
        </div>
      ) : phase === 'incoming' ? (
        <div className="incoming-actions">
          <div className="incoming-side">
            <button type="button" className="call-circle red" aria-label="Decline" onClick={() => finish('missed')}>
              <EndCallIcon size={32} />
            </button>
            <span className="call-label">Decline</span>
          </div>
          <div className="incoming-side">
            <button type="button" className="call-circle green" aria-label="Accept" onClick={() => setPhase('connected')}>
              <PhoneIcon size={35} />
            </button>
            <span className="call-label">Accept</span>
          </div>
        </div>
      ) : (
        <div className="call-bottom">
          {showKeypad ? (
            <div className="call-keypad">
              {DIAL_KEYS.map(([d, l]) => (
                <DialKey
                  key={d}
                  digit={d}
                  letters={l}
                  dark
                  onPress={(k) => {
                    if (state.settings.keypadSounds) playTone(k)
                    setTyped((t) => (t.length > 24 ? t : t + k))
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="call-grid">
              {toggle('mute', muted, setMuted, <MicOffIcon size={32} />)}
              {plain('keypad', <KeypadGlyph />, () => setShowKeypad(true))}
              {toggle('speaker', speaker, setSpeaker, <SpeakerIcon size={32} />)}
              {plain('add call', <PersonPlusIcon size={30} />, () => undefined)}
              {plain('FaceTime', <VideoIcon size={32} />, () => undefined)}
              {plain('contacts', <PersonCropIcon size={32} />, () => undefined)}
            </div>
          )}

          <div className="call-end-row">
            <span className="call-end-spacer" />
            <button type="button" className="call-circle red" aria-label="End call" onClick={hangUp}>
              <EndCallIcon size={34} />
            </button>
            <span className="call-end-spacer">
              {showKeypad && (
                <button type="button" className="hide-keypad" onClick={() => setShowKeypad(false)}>
                  Hide
                </button>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// iOS-style activity indicator: 8 spokes, the bright head steps around the circle.
function Spinner() {
  return (
    <svg className="req-spinner" viewBox="0 0 26 26" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <line
          key={i}
          x1="13"
          y1="2"
          x2="13"
          y2="6.7"
          transform={`rotate(${i * 45} 13 13)`}
          opacity={Math.max(0.45, 0.92 - i * 0.06)}
        />
      ))}
    </svg>
  )
}

function KeypadGlyph() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      {[5, 12, 19].flatMap((y) => [5, 12, 19].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r="2.2" />))}
    </svg>
  )
}
