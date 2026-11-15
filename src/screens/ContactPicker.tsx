import { useMemo, useState } from 'react'
import { SearchField } from '../components/SearchField'
import { Sheet } from '../components/Sheet'
import { displayName, groupContacts, matchesQuery } from '../lib/contacts'
import { useAppStore } from '../store/useAppStore'

/** Choose a contact to add to Favourites. */
export function ContactPicker({ onClosed }: { onClosed: () => void }) {
  const { contacts, setFavourite } = useAppStore()
  const [query, setQuery] = useState('')
  const sections = useMemo(
    () => groupContacts(contacts.filter((c) => !c.isMe && !c.favourite && matchesQuery(c, query))),
    [contacts, query],
  )
  return (
    <Sheet onClosed={onClosed}>
      {(close) => (
        <div className="editor">
          <header className="sheet-bar">
            <span />
            <strong>Add to Favourites</strong>
            <button className="link-btn bold" onClick={close}>
              Done
            </button>
          </header>
          <div className="scroll editor-scroll white">
            <SearchField value={query} onChange={setQuery} />
            {sections.map((s) => (
              <section key={s.letter} className="section">
                <div className="section-header">{s.letter}</div>
                {s.items.map((c) => (
                  <button key={c.id} className="contact-row" onClick={() => setFavourite(c.id, true)}>
                    <span className="contact-name">{displayName(c)}</span>
                  </button>
                ))}
              </section>
            ))}
            {sections.length === 0 && <div className="empty">No Contacts</div>}
          </div>
        </div>
      )}
    </Sheet>
  )
}
