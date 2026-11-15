import { useMemo, useState } from 'react'
import { InfoIcon, PhoneIcon } from '../components/Icons'
import { LargeTitleScreen } from '../components/LargeTitleScreen'
import { displayName, findContactByNumber } from '../lib/contacts'
import { formatCallTime } from '../lib/format'
import { useAppStore } from '../store/useAppStore'

interface Props {
  onCall: (number: string) => void
  onOpenContact: (id: string) => void
  onAddNumber: (number: string) => void
}

export function RecentsScreen({ onCall, onOpenContact, onAddNumber }: Props) {
  const { recents, contacts, deleteRecent, clearRecents } = useAppStore()
  const [filter, setFilter] = useState<'all' | 'missed'>('all')
  const [editing, setEditing] = useState(false)

  const rows = useMemo(
    () => recents.filter((r) => filter === 'all' || r.kind === 'missed'),
    [recents, filter],
  )

  return (
    <LargeTitleScreen
      title="Recents"
      left={
        <button
          className="link-btn"
          onClick={() => (editing ? clearRecents() : setEditing(true))}
          disabled={!editing && recents.length === 0}
        >
          {editing ? 'Clear' : 'Edit'}
        </button>
      }
      right={
        editing ? (
          <button className="link-btn bold" onClick={() => setEditing(false)}>
            Done
          </button>
        ) : undefined
      }
      center={
        <div className="segmented" role="tablist">
          <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>
            All
          </button>
          <button className={filter === 'missed' ? 'on' : ''} onClick={() => setFilter('missed')}>
            Missed
          </button>
        </div>
      }
    >
      {rows.map((r) => {
        const contact = findContactByNumber(contacts, r.number)
        const label = contact?.phones.find((p) => findContactByNumber([contact], r.number))?.label ?? 'mobile'
        return (
          <div key={r.id} className="recent-row">
            {editing && (
              <button className="minus-btn" aria-label="Delete" onClick={() => deleteRecent(r.id)}>
                –
              </button>
            )}
            <button className="recent-main" onClick={() => onCall(r.number)}>
              <span className="recent-text">
                <span className={'recent-name' + (r.kind === 'missed' ? ' missed' : '')}>
                  {contact ? displayName(contact) : r.number}
                </span>
                <span className="recent-sub">
                  {r.kind === 'outgoing' && <PhoneIcon size={12} />}
                  {label}
                </span>
              </span>
              <span className="recent-time">{formatCallTime(r.date)}</span>
            </button>
            <button
              className="info-btn"
              aria-label="Details"
              onClick={() => (contact ? onOpenContact(contact.id) : onAddNumber(r.number))}
            >
              <InfoIcon size={24} />
            </button>
          </div>
        )
      })}
      {rows.length === 0 && <div className="empty">{filter === 'missed' ? 'No Missed Calls' : 'No Recents'}</div>}
    </LargeTitleScreen>
  )
}
