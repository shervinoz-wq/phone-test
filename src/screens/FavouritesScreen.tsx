import { useState } from 'react'
import { InfoIcon, PlusIcon } from '../components/Icons'
import { LargeTitleScreen } from '../components/LargeTitleScreen'
import { displayName } from '../lib/contacts'
import { useAppStore } from '../store/useAppStore'

interface Props {
  onCall: (number: string) => void
  onOpenContact: (id: string) => void
  onAddFavourite: () => void
}

export function FavouritesScreen({ onCall, onOpenContact, onAddFavourite }: Props) {
  const { contacts, setFavourite } = useAppStore()
  const [editing, setEditing] = useState(false)
  const favourites = contacts.filter((c) => c.favourite && !c.isMe)

  return (
    <LargeTitleScreen
      title="Favourites"
      left={
        <button className="link-btn" onClick={() => setEditing((e) => !e)} disabled={favourites.length === 0 && !editing}>
          {editing ? 'Done' : 'Edit'}
        </button>
      }
      right={
        <button className="nav-icon-btn" aria-label="Add favourite" onClick={onAddFavourite}>
          <PlusIcon size={26} />
        </button>
      }
    >
      {favourites.map((c) => (
        <div key={c.id} className="recent-row">
          {editing && (
            <button className="minus-btn" aria-label="Remove" onClick={() => setFavourite(c.id, false)}>
              –
            </button>
          )}
          <button className="recent-main" onClick={() => c.phones[0] && onCall(c.phones[0].number)}>
            <span className="recent-text">
              <span className="recent-name">{displayName(c)}</span>
              <span className="recent-sub">{c.phones[0]?.label ?? ''}</span>
            </span>
          </button>
          <button className="info-btn" aria-label="Details" onClick={() => onOpenContact(c.id)}>
            <InfoIcon size={24} />
          </button>
        </div>
      ))}
      {favourites.length === 0 && <div className="empty">No Favourites</div>}
    </LargeTitleScreen>
  )
}
