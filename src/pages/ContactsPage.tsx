import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { BandScroll } from '../components/BandScroll'
import { ChevronLeftIcon, PlusIcon } from '../components/Icons'
import { useApp } from '../hooks/useApp'
import { useStore } from '../hooks/useStore'
import type { Contact } from '../types'
import { displayName, sectionLetter, sortContacts } from '../utils/format'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('')

function ContactName({ c }: { c: Contact }) {
  // iOS default: first name regular, last name bold.
  if (!c.first && !c.last) return <>{displayName(c)}</>
  if (!c.last) return <b>{c.first}</b>
  return (
    <>
      {c.first} <b>{c.last}</b>
    </>
  )
}

export function ContactsPage() {
  const { state } = useStore()
  const app = useApp()
  const scrollEl = useRef<HTMLDivElement | null>(null)
  const sectionEls = useRef<Record<string, HTMLElement | null>>({})
  const indexEl = useRef<HTMLDivElement | null>(null)
  const [activeLetter, setActiveLetter] = useState<string | null>(null)

  const sections = useMemo(() => {
    const map = new Map<string, Contact[]>()
    for (const c of sortContacts(state.contacts)) {
      const l = sectionLetter(c)
      map.set(l, [...(map.get(l) ?? []), c])
    }
    return [...map.entries()]
  }, [state.contacts])

  const present = new Set(sections.map(([l]) => l))

  const jumpTo = (letter: string) => {
    const idx = LETTERS.indexOf(letter)
    const target = LETTERS.slice(idx).find((l) => present.has(l)) ?? [...present].pop()
    if (!target) return
    setActiveLetter(target)
    const el = sectionEls.current[target]
    const sc = scrollEl.current
    if (el && sc) {
      const navH = parseFloat(getComputedStyle(sc).paddingTop) || 0
      sc.scrollTop = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - navH
    }
  }

  const letterAt = (e: PointerEvent) => {
    const box = indexEl.current?.getBoundingClientRect()
    if (!box) return
    const ratio = Math.min(0.999, Math.max(0, (e.clientY - box.top) / box.height))
    jumpTo(LETTERS[Math.floor(ratio * LETTERS.length)])
  }

  const [first, ...rest] = state.settings.myName.trim().split(/\s+/)
  const me = { first: first ?? '', last: rest.join(' '), company: '' }

  return (
    <div className="page bands">
      <header className="navbar">
        <div className="nav-side nav-left">
          <button
            type="button"
            className="glass-btn round"
            aria-label="Lists"
            onClick={() => app.toast('Lists are not available in this demo')}
          >
            <ChevronLeftIcon size={20} />
          </button>
        </div>
        <div className="nav-center">
          <span className="nav-title">Contacts</span>
        </div>
        <div className="nav-side nav-right">
          <button type="button" className="glass-btn round" aria-label="New contact" onClick={(e) => app.newContact(undefined, { morph: 'plus', from: e.currentTarget.getBoundingClientRect() })}>
            <PlusIcon size={24} />
          </button>
        </div>
      </header>

      <BandScroll scrollRef={scrollEl}>
        <button type="button" className="mycard" onClick={app.editMyCard}>
          <Avatar contact={me} size={40} blue />
          <span className="mycard-text">
            <span className="mycard-name">{state.settings.myName || 'My Card'}</span>
            <span className="mycard-sub">My Card</span>
          </span>
        </button>

        {sections.length === 0 ? (
          <div className="empty center">
            <div className="empty-title">No Contacts</div>
            <p>Contacts you’ve added will appear here.</p>
            <button type="button" className="link-btn big" onClick={() => app.newContact(undefined, { morph: 'center' })}>
              Create New Contact
            </button>
          </div>
        ) : (
          sections.map(([letter, list]) => (
            <section key={letter} ref={(el) => void (sectionEls.current[letter] = el)}>
              <h2 className="section-header">{letter}</h2>
              <ul className="list contact-list">
                {list.map((c) => (
                  <li key={c.id} className="row">
                    <button type="button" className="row-main" onClick={() => app.openContact(c.id, 'contacts')}>
                      <span className="row-title plain">
                        <ContactName c={c} />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
        {sections.length > 0 && <div className="count-footer">{state.contacts.length} Contacts</div>}
      </BandScroll>

      {sections.length > 0 && (
        <div
          className="alpha-index"
          ref={indexEl}
          aria-hidden
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            letterAt(e)
          }}
          onPointerMove={(e) => e.buttons && letterAt(e)}
          onPointerUp={() => setActiveLetter(null)}
          onPointerCancel={() => setActiveLetter(null)}
        >
          {LETTERS.map((l) => (
            <span key={l} className={activeLetter === l ? 'active' : ''}>
              {l}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
