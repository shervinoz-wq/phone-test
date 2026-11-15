import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { Sheet } from '../components/Sheet'
import { PHONE_LABELS, uid } from '../lib/contacts'
import type { Contact, PhoneEntry, PhoneLabel } from '../types'
import { useAppStore } from '../store/useAppStore'

export interface EditorState {
  /** Existing contact to edit, or null for a new one. */
  contact: Contact | null
  prefillNumber?: string
}

interface Props {
  state: EditorState
  onClosed: () => void
  onDeleted: (id: string) => void
  onSaved: (contact: Contact) => void
}

export function ContactEditor({ state, onClosed, onDeleted, onSaved }: Props) {
  const { saveContact, deleteContact } = useAppStore()
  const existing = state.contact
  const [first, setFirst] = useState(existing?.first ?? '')
  const [last, setLast] = useState(existing?.last ?? '')
  const [company, setCompany] = useState(existing?.company ?? '')
  const [phones, setPhones] = useState<PhoneEntry[]>(
    existing?.phones.length
      ? existing.phones
      : [{ label: 'mobile', number: state.prefillNumber ?? '' }],
  )
  const [email, setEmail] = useState(existing?.email ?? '')
  const [notes, setNotes] = useState(existing?.notes ?? '')

  const cleanPhones = phones.filter((p) => p.number.trim())
  const canSave = Boolean(first.trim() || last.trim() || company.trim() || cleanPhones.length)

  const updatePhone = (i: number, patch: Partial<PhoneEntry>) =>
    setPhones((list) => list.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))

  const save = (close: () => void) => {
    const contact: Contact = {
      id: existing?.id ?? uid(),
      first: first.trim(),
      last: last.trim(),
      company: company.trim(),
      phones: cleanPhones.map((p) => ({ ...p, number: p.number.trim() })),
      email: email.trim(),
      notes: notes.trim(),
      favourite: existing?.favourite ?? false,
      isMe: existing?.isMe,
    }
    saveContact(contact)
    onSaved(contact)
    close()
  }

  const remove = (close: () => void) => {
    if (!existing) return
    deleteContact(existing.id)
    onDeleted(existing.id)
    close()
  }

  const preview: Contact = { id: 'preview', first, last, company, phones, email, notes, favourite: false }

  return (
    <Sheet onClosed={onClosed}>
      {(close) => (
        <div className="editor">
          <header className="sheet-bar">
            <button className="link-btn" onClick={close}>
              Cancel
            </button>
            <strong>{existing ? 'Edit Contact' : 'New Contact'}</strong>
            <button className="link-btn bold" disabled={!canSave} onClick={() => save(close)}>
              Done
            </button>
          </header>

          <div className="scroll editor-scroll">
            <div className="editor-avatar">
              <Avatar contact={first || last || company ? preview : undefined} size={92} />
            </div>

            <div className="group">
              <input className="field" placeholder="First name" value={first} onChange={(e) => setFirst(e.target.value)} autoCapitalize="words" />
              <input className="field" placeholder="Last name" value={last} onChange={(e) => setLast(e.target.value)} autoCapitalize="words" />
              <input className="field" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} autoCapitalize="words" />
            </div>

            <div className="group">
              {phones.map((p, i) => (
                <div className="field-row" key={i}>
                  <button
                    className="remove-btn"
                    aria-label="Remove phone"
                    onClick={() => setPhones((list) => (list.length > 1 ? list.filter((_, idx) => idx !== i) : [{ label: 'mobile', number: '' }]))}
                  >
                    –
                  </button>
                  <select
                    className="label-select"
                    value={p.label}
                    onChange={(e) => updatePhone(i, { label: e.target.value as PhoneLabel })}
                  >
                    {PHONE_LABELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                  <input
                    className="field inline"
                    placeholder="Phone"
                    inputMode="tel"
                    value={p.number}
                    onChange={(e) => updatePhone(i, { number: e.target.value })}
                  />
                </div>
              ))}
              <button className="add-row" onClick={() => setPhones((l) => [...l, { label: 'mobile', number: '' }])}>
                <span className="add-dot">+</span> add phone
              </button>
            </div>

            <div className="group">
              <input className="field" placeholder="Email" inputMode="email" autoCapitalize="off" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="group">
              <textarea className="field notes" placeholder="Notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            {existing && !existing.isMe && (
              <div className="group">
                <button className="plain-cell red" onClick={() => remove(close)}>
                  Delete Contact
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Sheet>
  )
}
