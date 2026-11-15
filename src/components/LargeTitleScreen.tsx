import { useState, type ReactNode, type RefObject } from 'react'

interface Props {
  title: string
  left?: ReactNode
  right?: ReactNode
  /** Replaces the inline title (e.g. a segmented control). */
  center?: ReactNode
  overlay?: ReactNode
  scrollRef?: RefObject<HTMLDivElement | null>
  children: ReactNode
}

/** iOS large-title navigation screen: the title collapses into the bar on scroll. */
export function LargeTitleScreen({ title, left, right, center, overlay, scrollRef, children }: Props) {
  const [scrolled, setScrolled] = useState(false)
  return (
    <div className="screen">
      <header className={'navbar' + (scrolled ? ' scrolled' : '')}>
        <div className="nav-side nav-left">{left}</div>
        <div className={'nav-title' + (center ? ' has-center' : '')}>{center ?? title}</div>
        <div className="nav-side nav-right">{right}</div>
      </header>
      <div
        ref={scrollRef}
        className="scroll"
        onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 36)}
      >
        <h1 className="large-title">{title}</h1>
        {children}
      </div>
      {overlay}
    </div>
  )
}
