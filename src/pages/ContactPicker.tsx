import { useMemo } from 'react'
import { CloseIcon } from '../components/Icons'
import { useStore } from '../hooks/useStore'
import { displayName, sortContacts } from '../utils/format'

interface Props {
  onCancel: () => void
  onPick: (id: string) => void
}

export function ContactPicker({ onCancel, onPick }: Props) {
  const { state } = useStore()
  const list = useMemo(
    () => sortContacts(state.contacts.filter((c) => !state.favourites.includes(c.id))),
    [state.contacts, state.favourites],
  )

  return (
    <div className="form">
      <div className="grabber" aria-hidden />
      <header className="sheet-bar">
        <button type="button" className="glass-btn round" aria-label="Cancel" onClick={onCancel}>
          <CloseIcon size={22} />
        </button>
        <span className="sheet-title">Add Favorite</span>
        <span className="glass-btn round ghost" />
      </header>
      <div className="scroll">
        {list.length === 0 ? (
          <div className="empty center">
            <div className="empty-title">No Contacts</div>
            <p>All contacts are already favorites.</p>
          </div>
        ) : (
          <ul className="list contact-list">
            {list.map((c) => (
              <li key={c.id} className="row">
                <button type="button" className="row-main" onClick={() => onPick(c.id)}>
                  <span className="row-title plain">{displayName(c)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
