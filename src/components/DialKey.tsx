import { useRef, useState } from 'react'

interface Props {
  digit: string
  letters: string
  onPress: (digit: string) => void
  /** Fired after holding the key (used by 0 -> +). */
  onHold?: (digit: string) => void
}

export function DialKey({ digit, letters, onPress, onHold }: Props) {
  const [down, setDown] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  const start = () => {
    setDown(true)
    onPress(digit)
    if (digit === '0' && onHold) {
      timer.current = window.setTimeout(() => onHold('+'), 500)
    }
  }
  const stop = () => {
    setDown(false)
    window.clearTimeout(timer.current)
  }

  const cls = `dial-key${down ? ' down' : ''}${digit === '*' ? ' star' : ''}${letters ? ' has-l' : ''}`
  return (
    <button
      type="button"
      className={cls}
      aria-label={digit === '*' ? 'star' : digit === '#' ? 'pound' : digit}
      onPointerDown={start}
      onPointerUp={stop}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={(e) => e.preventDefault()}
    >
      <span className="key-fill" aria-hidden />
      <span className="digit">{digit}</span>
      {letters && <span className="letters">{letters}</span>}
    </button>
  )
}
