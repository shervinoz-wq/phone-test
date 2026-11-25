import { useMemo, useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { BandScroll } from '../components/BandScroll'
import { ChevronLeftIcon, PersonFillCircleIcon, PlusIcon } from '../components/Icons'
import { useApp } from '../hooks/useApp'
import { useStore } from '../hooks/useStore'
import type { Contact } from '../types'
import { displayName, sectionLetter, sortContacts } from '../utils/format'

function ContactName({ c }: { c: Contact }) {
  return <>{displayName(c)}</>
}

const INDEX_LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#']

interface Props {
  title: string
  /** null = all contacts; custom lists hold no contacts in this demo */
  listId: string | null
  onBack: () => void
}

export function ContactsPage({ title, listId, onBack }: Props) {
  const { state } = useStore()
  const app = useApp()
  const contacts = useMemo(() => (listId === null ? sortContacts(state.contacts) : []), [state.contacts, listId])
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const indexRef = useRef<HTMLDivElement | null>(null)

  // contacts grouped into alphabetical sections (A–Z, then #)
  const sections = useMemo(() => {
    const out: { letter: string; items: Contact[] }[] = []
    for (const c of contacts) {
      const letter = sectionLetter(c)
      const last = out[out.length - 1]
      if (last && last.letter === letter) last.items.push(c)
      else out.push({ letter, items: [c] })
    }
    return out
  }, [contacts])

  /** Scroll so the section for `letter` (or the next one that exists) sits right under the title bar. */
  const jumpTo = (letter: string) => {
    const sc = scrollRef.current
    if (!sc || sections.length === 0) return
    const from = INDEX_LETTERS.indexOf(letter)
    const target =
      sections.find((sec) => INDEX_LETTERS.indexOf(sec.letter) >= from) ?? sections[sections.length - 1]
    const el = sc.querySelector<HTMLElement>(`[data-letter="${CSS.escape(target.letter)}"]`)
    if (!el) return
    const pad = parseFloat(getComputedStyle(sc).paddingTop) || 0
    const top = el.getBoundingClientRect().top - sc.getBoundingClientRect().top + sc.scrollTop - pad
    sc.scrollTop = Math.max(0, top)
  }

  const onIndexPointer = (e: ReactPointerEvent<HTMLDivElement>) => {
    const box = indexRef.current
    if (!box) return
    if (e.type === 'pointerdown') e.currentTarget.setPointerCapture(e.pointerId)
    else if (!e.currentTarget.hasPointerCapture(e.pointerId)) return
    const r = box.getBoundingClientRect()
    const idx = Math.min(
      INDEX_LETTERS.length - 1,
      Math.max(0, Math.floor(((e.clientY - r.top) / r.height) * INDEX_LETTERS.length)),
    )
    jumpTo(INDEX_LETTERS[idx])
  }

  return (
    <div className="page bands">
      <header className="navbar">
        <div className="nav-side nav-left">
          <button type="button" className="glass-btn round" aria-label="Lists" onClick={onBack}>
            <ChevronLeftIcon size={20} />
          </button>
        </div>
        <div className="nav-center">
          <span className="nav-title">{title}</span>
        </div>
        <div className="nav-side nav-right">
          <button
            type="button"
            className="glass-btn round"
            aria-label="New contact"
            onClick={(e) => app.newContact(undefined, { morph: 'plus', from: e.currentTarget.getBoundingClientRect() })}
          >
            <PlusIcon size={24} />
          </button>
        </div>
      </header>

      <BandScroll scrollRef={scrollRef}>
        {contacts.length === 0 && (
          <div className="empty center">
            <PersonFillCircleIcon size={56} className="empty-avatar" />
            <div className="empty-title">No Contacts</div>
            <p>Contacts you’ve added will appear here.</p>
            <button
              type="button"
              className="link-btn big"
              onClick={(e) => app.newContact(undefined, { morph: 'center', from: e.currentTarget.getBoundingClientRect() })}
            >
              Create New Contact
            </button>
          </div>
        )}
        {sections.map((sec) => (
          <section key={sec.letter} className="ct-section" data-letter={sec.letter}>
            <div className="ct-head">{sec.letter}</div>
            <ul className="contact-list">
              {sec.items.map((c) => (
                <li key={c.id} className="contact-item">
                  <button type="button" className="contact-row" onClick={() => app.openContact(c.id, 'contacts')}>
                    <Avatar contact={c} size={41} blue />
                    <span className="contact-name">
                      <ContactName c={c} />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </BandScroll>

      {sections.length > 0 && (
        <div
          className="ct-index"
          aria-hidden
          onPointerDown={onIndexPointer}
          onPointerMove={onIndexPointer}
        >
          <div className="ct-index-letters" ref={indexRef}>
            {INDEX_LETTERS.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
