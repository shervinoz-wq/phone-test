import { Avatar } from '../components/Avatar'
import { ChevronLeftIcon, MailIcon, MessageIcon, PhoneIcon, VideoIcon } from '../components/Icons'
import { SlideOver } from '../components/Sheet'
import { displayName } from '../lib/contacts'
import { useAppStore } from '../store/useAppStore'

interface Props {
  id: string
  backLabel: string
  onClosed: () => void
  onEdit: (id: string) => void
  onCall: (number: string) => void
}

export function ContactDetail({ id, backLabel, onClosed, onEdit, onCall }: Props) {
  const { contacts, setFavourite } = useAppStore()
  const contact = contacts.find((c) => c.id === id)

  return (
    <SlideOver onClosed={onClosed}>
      {(close) => {
        if (!contact) {
          return (
            <div className="screen detail">
              <header className="navbar scrolled">
                <div className="nav-side nav-left">
                  <button className="back-btn" onClick={close}>
                    <ChevronLeftIcon size={22} />
                    {backLabel}
                  </button>
                </div>
              </header>
            </div>
          )
        }
        const first = contact.phones[0]
        return (
          <div className="screen detail">
            <header className="navbar">
              <div className="nav-side nav-left">
                <button className="back-btn" onClick={close}>
                  <ChevronLeftIcon size={22} />
                  {backLabel}
                </button>
              </div>
              <div className="nav-side nav-right">
                <button className="link-btn" onClick={() => onEdit(contact.id)}>
                  Edit
                </button>
              </div>
            </header>

            <div className="scroll">
              <div className="detail-head">
                <Avatar contact={contact} size={104} />
                <h1 className="detail-name">{displayName(contact)}</h1>
                {contact.company && (contact.first || contact.last) && (
                  <div className="detail-company">{contact.company}</div>
                )}
              </div>

              <div className="action-row">
                <button className="action" disabled={!first} onClick={() => first && onCall(first.number)}>
                  <PhoneIcon size={22} />
                  <span>call</span>
                </button>
                <button className="action">
                  <MessageIcon size={22} />
                  <span>message</span>
                </button>
                <button className="action">
                  <VideoIcon size={22} />
                  <span>video</span>
                </button>
                <button className="action" disabled={!contact.email}>
                  <MailIcon size={22} />
                  <span>mail</span>
                </button>
              </div>

              <div className="group">
                {contact.phones.map((p, i) => (
                  <button key={i} className="info-cell" onClick={() => onCall(p.number)}>
                    <span className="info-label">{p.label}</span>
                    <span className="info-value blue">{p.number}</span>
                  </button>
                ))}
                {contact.email && (
                  <div className="info-cell">
                    <span className="info-label">email</span>
                    <span className="info-value blue">{contact.email}</span>
                  </div>
                )}
              </div>

              {contact.notes && (
                <div className="group">
                  <div className="info-cell">
                    <span className="info-label">notes</span>
                    <span className="info-value">{contact.notes}</span>
                  </div>
                </div>
              )}

              {!contact.isMe && (
                <div className="group">
                  <button
                    className="plain-cell blue"
                    onClick={() => setFavourite(contact.id, !contact.favourite)}
                  >
                    {contact.favourite ? 'Remove from Favourites' : 'Add to Favourites'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )
      }}
    </SlideOver>
  )
}
