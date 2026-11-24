import { useState } from 'react'
import { ContactsPage } from './ContactsPage'
import { ListsPage, type ListTarget } from './ListsPage'

/**
 * Navigation stack of the Contacts tab: Lists (root) -> Contacts.
 * Back on Contacts slides it off to the right, revealing Lists (which moves back from a slight
 * left offset); opening a list slides Contacts in from the right again.
 * The tab starts on the Contacts page (no animation on first load).
 */
export function ContactsTab() {
  const [target, setTarget] = useState<ListTarget>({ id: null, title: 'Contacts' })
  const [open, setOpen] = useState(true)

  return (
    <div className="nav-stack">
      <div className={`stack-root${open ? ' covered' : ''}`}>
        <ListsPage
          onOpen={(t) => {
            setTarget(t)
            setOpen(true)
          }}
        />
        <div className="stack-dim" />
      </div>
      <div className={`stack-top${open ? ' is-open' : ''}`} aria-hidden={!open}>
        <ContactsPage title={target.title} listId={target.id} onBack={() => setOpen(false)} />
      </div>
    </div>
  )
}
