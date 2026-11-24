import { CalendarIcon, ChevronLeftIcon, MailIcon, MessageIcon, PersonCropIcon, PhoneIcon, VideoIcon } from '../components/Icons'
import { useApp } from '../hooks/useApp'
import type { Contact } from '../types'
import { displayName, profileInitials, formatDay } from '../utils/format'

interface Props {
  contact: Contact
  backLabel: string
  onBack: () => void
}

/** iOS 26 contact card: blue gradient page, big glass circle, round quick actions, glass cards. */
export function ContactDetailPage({ contact, backLabel, onBack }: Props) {
  const app = useApp()
  const name = displayName(contact)
  const letters = profileInitials(contact)

  return (
    <div className="page detail-page blue-detail">
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
          <div className="detail-circle" aria-hidden>
            {letters ? <span>{letters}</span> : <PersonCropIcon size={130} />}
          </div>
          <h1 className="detail-name">{name}</h1>
          {contact.company && (contact.first || contact.last) && <div className="detail-company">{contact.company}</div>}
        </div>

        <div className="quick-actions round">
          <button type="button" className="quick" aria-label="message" onClick={() => app.toast('Messages is not available in this demo')}>
            <MessageIcon size={22} />
          </button>
          <button type="button" className="quick" aria-label="call" onClick={() => app.startCall(contact.phone, contact.id)}>
            <PhoneIcon size={22} />
          </button>
          <button type="button" className="quick" aria-label="video" onClick={() => app.toast('FaceTime is not available in this demo')}>
            <VideoIcon size={22} />
          </button>
          <button type="button" className="quick" aria-label="mail" onClick={() => app.toast('Mail is not available in this demo')}>
            <MailIcon size={22} />
          </button>
        </div>

        {contact.phone && (
          <div className="card glass-card">
            <button type="button" className="card-row field" onClick={() => app.startCall(contact.phone, contact.id)}>
              <span className="field-label">mobile</span>
              <span className="field-value">{contact.phone}</span>
            </button>
          </div>
        )}

        {contact.birthday && (
          <div className="card glass-card">
            <div className="card-row field static dated">
              <span className="field-label">birthday</span>
              <span className="field-value">{formatDay(contact.birthday)}</span>
              <CalendarIcon size={16} className="field-cal" />
            </div>
          </div>
        )}

        {contact.anniversary && (
          <div className="card glass-card">
            <div className="card-row field static dated">
              <span className="field-label">anniversary</span>
              <span className="field-value">{formatDay(contact.anniversary)}</span>
              <CalendarIcon size={16} className="field-cal" />
            </div>
          </div>
        )}

        <div className="card glass-card notes-card">
          <div className="card-row field static">
            <span className="field-label">Notes</span>
            <span className="field-value">{contact.notes || '\u00A0'}</span>
          </div>
        </div>

        <div className="card glass-card">
          <button type="button" className="card-row action" onClick={() => app.shareContact(contact.id)}>
            Share Contact
          </button>
        </div>
        <div className="card glass-card">
          <button type="button" className="card-row action" onClick={() => app.blockContact(contact.id)}>
            {contact.blocked ? 'Unblock Contact' : 'Block Contact'}
          </button>
        </div>
      </div>
    </div>
  )
}
