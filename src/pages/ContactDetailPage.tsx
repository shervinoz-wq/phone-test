import { Avatar } from '../components/Avatar'
import { ChevronLeftIcon, MailIcon, MessageIcon, PhoneIcon, VideoIcon } from '../components/Icons'
import { useApp } from '../hooks/useApp'
import { useStore } from '../hooks/useStore'
import type { Contact } from '../types'
import { displayName } from '../utils/format'

interface Props {
  contact: Contact
  backLabel: string
  onBack: () => void
}

export function ContactDetailPage({ contact, backLabel, onBack }: Props) {
  const { state, dispatch } = useStore()
  const app = useApp()
  const isFav = state.favourites.includes(contact.id)
  const name = displayName(contact)

  const share = async () => {
    const text = `${name}\n${contact.phone}`
    try {
      if (navigator.share) await navigator.share({ title: name, text })
      else app.toast('Sharing is not available on this device')
    } catch {
      /* the user dismissed the share sheet */
    }
  }

  return (
    <div className="page detail-page tinted">
      <header className="navbar">
        <div className="nav-side nav-left">
          <button type="button" className="glass-btn round" aria-label={`Back to ${backLabel}`} onClick={onBack}>
            <ChevronLeftIcon size={20} />
          </button>
        </div>
        <div className="nav-center" />
        <div className="nav-side nav-right">
          <button type="button" className="glass-btn" onClick={() => app.editContact(contact.id)}>
            Edit
          </button>
        </div>
      </header>

      <div className="scroll">
        <div className="detail-head">
          <Avatar contact={contact} size={104} />
          <h1 className="detail-name">{name}</h1>
          {contact.company && fullHasName(contact) && <div className="detail-company">{contact.company}</div>}
        </div>

        <div className="quick-actions">
          <button type="button" className="quick" onClick={() => app.toast('Messages is not available in this demo')}>
            <MessageIcon size={22} />
            <span>message</span>
          </button>
          <button type="button" className="quick" onClick={() => app.startCall(contact.phone, contact.id)}>
            <PhoneIcon size={22} />
            <span>call</span>
          </button>
          <button type="button" className="quick" onClick={() => app.toast('FaceTime is not available in this demo')}>
            <VideoIcon size={22} />
            <span>video</span>
          </button>
          <button type="button" className="quick" onClick={() => app.toast('Mail is not available in this demo')}>
            <MailIcon size={22} />
            <span>mail</span>
          </button>
        </div>

        <div className="card">
          <button type="button" className="card-row field" onClick={() => app.startCall(contact.phone, contact.id)}>
            <span className="field-label">mobile</span>
            <span className="field-value link">{contact.phone}</span>
          </button>
        </div>

        <div className="card">
          <div className="card-row field static">
            <span className="field-label">Notes</span>
            <span className="field-value">{contact.notes || '\u00A0'}</span>
          </div>
        </div>

        <div className="card">
          <button type="button" className="card-row action" onClick={() => app.toast('Messages is not available in this demo')}>
            Send Message
          </button>
          <button type="button" className="card-row action" onClick={share}>
            Share Contact
          </button>
          <button
            type="button"
            className="card-row action"
            onClick={() => {
              dispatch({ type: isFav ? 'favourite/remove' : 'favourite/add', id: contact.id })
              app.toast(isFav ? 'Removed from Favorites' : 'Added to Favorites')
            }}
          >
            {isFav ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>
        </div>
        <div className="card">
          <button type="button" className="card-row action danger" onClick={() => app.toast('Blocking is not available in this demo')}>
            Block Caller
          </button>
        </div>
      </div>
    </div>
  )
}

const fullHasName = (c: Contact) => !!(c.first || c.last)
