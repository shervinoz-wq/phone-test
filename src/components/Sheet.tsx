import { useState, type ReactNode } from 'react'

const DURATION = 280

/** Modal sheet that slides up from the bottom (iOS-style). */
export function Sheet({ onClosed, children }: { onClosed: () => void; children: (close: () => void) => ReactNode }) {
  const [closing, setClosing] = useState(false)
  const close = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClosed, DURATION - 20)
  }
  return (
    <div className={'sheet-root' + (closing ? ' closing' : '')}>
      <div className="sheet-backdrop" onClick={close} />
      <div className="sheet-panel">{children(close)}</div>
    </div>
  )
}

/** Full-size page pushed from the right (iOS navigation push). */
export function SlideOver({ onClosed, children }: { onClosed: () => void; children: (close: () => void) => ReactNode }) {
  const [closing, setClosing] = useState(false)
  const close = () => {
    if (closing) return
    setClosing(true)
    window.setTimeout(onClosed, DURATION - 20)
  }
  return <div className={'slide-over' + (closing ? ' closing' : '')}>{children(close)}</div>
}
