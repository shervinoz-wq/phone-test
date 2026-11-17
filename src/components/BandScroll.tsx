import { useEffect, useRef, type ReactNode, type RefObject } from 'react'
import { useRubberBand } from '../hooks/useRubberBand'

interface Props {
  children: ReactNode
  /** Gives the page access to the scroll container (e.g. for jumping to a section). */
  scrollRef?: RefObject<HTMLDivElement | null>
}

/** How far (px) the content must scroll under the title before the blur is fully there. */
const FADE_DISTANCE = 22

/**
 * Scroll area used by the big list pages (Calls, Contacts).
 *  - same iOS rubber-band scrolling as the Share Device Identifiers page
 *  - the content runs under the (transparent) navigation bar; as soon as the first
 *    item slides under the title a progressive blur + white tint fades in behind the bar.
 *    (`--f` 0..1 scales blur radius and tint; no `opacity` on an ancestor, because that
 *    would stop backdrop-filter from seeing the list.)
 * Must be a child of `.page.bands`.
 */
export function BandScroll({ children, scrollRef }: Props) {
  const { scroller, inner } = useRubberBand()
  const fade = useRef<HTMLDivElement | null>(null)

  const setScroller = (el: HTMLDivElement | null) => {
    scroller.current = el
    if (scrollRef) scrollRef.current = el
  }

  useEffect(() => {
    const el = scroller.current
    const bar = fade.current
    if (!el || !bar) return
    const update = () => {
      const f = Math.min(1, Math.max(0, el.scrollTop / FADE_DISTANCE))
      bar.style.setProperty('--f', f.toFixed(3))
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [scroller])

  return (
    <>
      <div className="nav-fade" ref={fade} aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <b />
      </div>
      <div className="scroll band-scroll" ref={setScroller}>
        <div className="band-inner" ref={inner}>
          {children}
        </div>
      </div>
    </>
  )
}
