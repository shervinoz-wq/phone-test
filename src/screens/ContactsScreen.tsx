import { useMemo, useRef, useState, type PointerEvent } from 'react'
import { Avatar } from '../components/Avatar'
import { PlusIcon } from '../components/Icons'
import { LargeTitleScreen } from '../components/LargeTitleScreen'
import { SearchField } from '../components/SearchField'
import { displayName, groupContacts, matchesQuery } from '../lib/contacts'
import { useAppStore } from '../store/useAppStore'

const LETTERS = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#']

interface Props {
  onOpen: (id: string) => void
  onAdd: () => void
}

export function ContactsScreen({ onOpen, onAdd }: Props) {
  const { contacts } = useAppStore()
  const [query, setQuery] = useState('')
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const me = contacts.find((c) => c.isMe)
  const people = useMemo(() => contacts.filter((c) => !c.isMe), [contacts])
  const sections = useMemo(
    () => groupContacts(people.filter((c) => matchesQuery(c, query))),
    [people, query],
  )
  const searching = query.trim().length > 0

  const jumpTo = (letter: string) => {
    const scroller = scrollRef.current
    if (!scroller) return
    const available = sections.map((s) => s.letter)
    // Fall back to the nearest following letter that has contacts.
    const target =
      available.find((l) => (l === '#' ? letter === '#' : letter !== '#' && l >= letter)) ?? available.at(-1)
    const el = target ? scroller.querySelector<HTMLElement>(`[data-letter="${target}"]`) : null
    if (el) scroller.scrollTop = el.offsetTop - 44
  }

  const onIndexPointer = (e: PointerEvent<HTMLDivElement>) => {
    if (e.type === 'pointermove' && e.buttons === 0 && e.pointerType === 'mouse') return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientY - rect.top) / rect.height
    const idx = Math.min(LETTERS.length - 1, Math.max(0, Math.floor(ratio * LETTERS.length)))
    jumpTo(LETTERS[idx])
  }

  return (
    <LargeTitleScreen
      title="Contacts"
      scrollRef={scrollRef}
      right={
        <button className="nav-icon-btn" aria-label="Add contact" onClick={onAdd}>
          <PlusIcon size={26} />
        </button>
      }
      overlay={
        !searching && (
          <div
            className="index-bar"
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              onIndexPointer(e)
            }}
            onPointerMove={onIndexPointer}
          >
            {LETTERS.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        )
      }
    >
      <SearchField value={query} onChange={setQuery} />

      {!searching && me && (
        <button className="my-card" onClick={() => onOpen(me.id)}>
          <Avatar contact={me} size={62} />
          <span className="my-card-text">
            <span className="my-card-name">{displayName(me)}</span>
            <span className="my-card-sub">My Card</span>
          </span>
        </button>
      )}

      {sections.map((section) => (
        <section key={section.letter} data-letter={section.letter} className="section">
          <div className="section-header">{section.letter}</div>
          {section.items.map((c) => (
            <button key={c.id} className="contact-row" onClick={() => onOpen(c.id)}>
              <span className="contact-name">
                {c.first || c.last ? (
                  <>
                    {c.first}
                    {c.first && c.last ? ' ' : ''}
                    <b>{c.last}</b>
                  </>
                ) : (
                  <b>{displayName(c)}</b>
                )}
              </span>
            </button>
          ))}
        </section>
      ))}

      {sections.length === 0 && <div className="empty">No Results</div>}
      {!searching && people.length > 0 && (
        <div className="footer-count">
          {people.length} {people.length === 1 ? 'Contact' : 'Contacts'}
        </div>
      )}
    </LargeTitleScreen>
  )
}
