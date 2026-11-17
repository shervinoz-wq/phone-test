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
      <span className="digit">{digit}</span>
      {letters && <span className="letters">{letters}</span>}
    </button>
  )
}
