import { useMemo } from 'react'
import { Avatar } from '../components/Avatar'
import { BandScroll } from '../components/BandScroll'
import { ChevronLeftIcon, PersonFillCircleIcon, PlusIcon } from '../components/Icons'
import { useApp } from '../hooks/useApp'
import { useStore } from '../hooks/useStore'
import type { Contact } from '../types'
import { displayName, sortContacts } from '../utils/format'

function ContactName({ c }: { c: Contact }) {
  return <>{displayName(c)}</>
}

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

      <BandScroll>
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
        <ul className="list contact-list">
          {contacts.map((c) => (
            <li key={c.id} className="contact-item">
              <button type="button" className="contact-row" onClick={() => app.openContact(c.id, 'contacts')}>
                <Avatar contact={c} size={40} blue />
                <span className="contact-name">
                  <ContactName c={c} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </BandScroll>
    </div>
  )
}
