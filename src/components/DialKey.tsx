import { useRef, useState } from 'react'
import { usePressAnimation } from '../hooks/usePressAnimation'

interface Props {
  digit: string
  letters: string
  onPress: (digit: string) => void
  /** Fired after holding the key (used by 0 -> +). */
  onHold?: (digit: string) => void
  dark?: boolean
}

export function DialKey({ digit, letters, onPress, onHold, dark }: Props) {
  const [down, setDown] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const anim = usePressAnimation<HTMLButtonElement>('key', !dark)

  const start = () => {
    setDown(true)
    anim.down()
    onPress(digit)
    if (digit === '0' && onHold) {
      timer.current = window.setTimeout(() => onHold('+'), 500)
    }
  }
  const stop = () => {
    setDown(false)
    anim.up()
    window.clearTimeout(timer.current)
  }

  const cls = `dial-key${down && dark ? ' down' : ''}${dark ? ' dark' : ''}${digit === '*' ? ' star' : ''}${letters ? ' has-l' : ''}`
  return (
    <button
      ref={anim.btn}
      type="button"
      className={cls}
      aria-label={digit === '*' ? 'star' : digit === '#' ? 'pound' : digit}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      {!dark && <span ref={anim.fill} className="key-fill" aria-hidden />}
      {digit === '*' ? (
        <svg className="key-glyph star-glyph" viewBox="0 0 28 28" aria-hidden>
          <path d="M14 0.7V27.3M2.5 7.4L25.5 20.6M25.5 7.4L2.5 20.6" />
        </svg>
      ) : digit === '#' ? (
        <svg className="key-glyph hash-glyph" viewBox="0 0 29 32" aria-hidden>
          <path d="M8.4 0.5V31.5M20.6 0.5V31.5M0.5 9.3H28.5M0.5 22.7H28.5" />
        </svg>
      ) : (
        <span className="digit">{digit}</span>
      )}
      {letters && <span className="letters">{letters}</span>}
    </button>
  )
}
