import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { ChevronRightIcon, CheckIcon, CloseIcon, PlusCircleGreenIcon } from '../components/Icons'
import type { Contact } from '../types'
import { uid } from '../utils/format'

interface Props {
  /** Existing contact when editing, otherwise null for a new one. */
  contact: Contact | null
  prefillNumber?: string
  title?: string
  onCancel: () => void
  onSave: (contact: Contact) => void
  onDelete?: () => void
}

const EXTRA_ROWS = ['add email', 'add pronouns']
const MORE_ROWS = [
  'add url',
  'add address',
  'add related name',
  'add social profile',
  'add instant message',
]

export function ContactForm({ contact, prefillNumber, title, onCancel, onSave, onDelete }: Props) {
  const [first, setFirst] = useState(contact?.first ?? '')
  const [last, setLast] = useState(contact?.last ?? '')
  const [company, setCompany] = useState(contact?.company ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? prefillNumber ?? '')
  const [showPhone, setShowPhone] = useState(!!(contact?.phone || prefillNumber))
  const [birthday, setBirthday] = useState(contact?.birthday ?? '')
  const [showBirthday, setShowBirthday] = useState(!!contact?.birthday)
  const [anniversary, setAnniversary] = useState(contact?.anniversary ?? '')
  const [showAnniv, setShowAnniv] = useState(!!contact?.anniversary)
  const [notes, setNotes] = useState(contact?.notes ?? '')

  const canSave = !!(first.trim() || last.trim() || company.trim() || phone.trim())
  const unavailable = () => undefined

  const save = () => {
    if (!canSave) return
    onSave({
      id: contact?.id ?? uid(),
      first: first.trim(),
      last: last.trim(),
      company: company.trim(),
      phone: phone.trim(),
      notes: notes.trim(),
      birthday: birthday || undefined,
      anniversary: anniversary || undefined,
      blocked: contact?.blocked,
    })
  }

  const addRow = (label: string, onClick: () => void = unavailable) => (
    <button key={label} type="button" className="pill-row add" onClick={onClick}>
      <PlusCircleGreenIcon size={24} />
      <span>{label}</span>
    </button>
  )

  return (
    <div className="form">
      <div className="grabber" aria-hidden />
      <header className="sheet-bar">
        <button type="button" className="glass-btn round" aria-label="Cancel" onClick={onCancel}>
          <CloseIcon size={22} />
        </button>
        <span className="sheet-title">{title ?? (contact ? 'Edit Contact' : 'New Contact')}</span>
        <button
          type="button"
          className={`glass-btn round done${canSave ? ' ready' : ''}`}
          aria-label="Done"
          disabled={!canSave}
          onClick={save}
        >
          <CheckIcon size={22} />
        </button>
      </header>

      <div className="scroll">
        <div className="form-avatar">
          <Avatar contact={{ first, last, company }} size={120} blue />
          <button type="button" className="pill-btn" onClick={unavailable}>
            Add Photo
          </button>
        </div>

        <div className="round-card">
          <label className="card-row input-row">
            <input value={first} onChange={(e) => setFirst(e.target.value)} placeholder="First name" autoCapitalize="words" autoFocus={!contact} />
          </label>
          <label className="card-row input-row">
            <input value={last} onChange={(e) => setLast(e.target.value)} placeholder="Last name" autoCapitalize="words" />
          </label>
          <label className="card-row input-row">
            <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" autoCapitalize="words" />
          </label>
        </div>

        {showPhone ? (
          <div className="pill-row field">
            <span className="input-label">mobile</span>
            <input
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
          </div>
        ) : (
          addRow('add phone', () => setShowPhone(true))
        )}
        {EXTRA_ROWS.map((l) => addRow(l))}

        <button type="button" className="pill-row nav" onClick={unavailable}>
          <span>Ringtone</span>
          <span className="blue">Default</span>
          <ChevronRightIcon size={14} className="chev" />
        </button>
        <button type="button" className="pill-row nav" onClick={unavailable}>
          <span>Text Tone</span>
          <span className="blue">Default</span>
          <ChevronRightIcon size={14} className="chev" />
        </button>

        {showBirthday ? (
          <div className="pill-row field">
            <span className="input-label">birthday</span>
            <input type="date" value={birthday} onChange={(e) => setBirthday(e.target.value)} />
          </div>
        ) : (
          addRow('add birthday', () => setShowBirthday(true))
        )}
        {showAnniv ? (
          <div className="pill-row field">
            <span className="input-label">anniversary</span>
            <input type="date" value={anniversary} onChange={(e) => setAnniversary(e.target.value)} />
          </div>
        ) : (
          addRow('add date', () => setShowAnniv(true))
        )}
        {MORE_ROWS.map((l) => addRow(l))}

        <div className="round-card notes">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" rows={4} />
        </div>

        {addRow('add verification code')}
        <button type="button" className="pill-row link" onClick={unavailable}>
          add field
        </button>

        {contact && onDelete && (
          <button type="button" className="pill-row danger" onClick={onDelete}>
            Delete Contact
          </button>
        )}
      </div>
    </div>
  )
}
