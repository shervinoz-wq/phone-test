import { useState } from 'react'
import { CheckIcon } from '../components/Icons'
import type { Contact } from '../types'
import { displayName, formatDay } from '../utils/format'

interface Field {
  key: string
  label: string
  value: string
}

interface Props {
  contact: Contact
  onDone: (text: string) => void
}

/** "Share Contact": pick which fields go into the shared card. */
export function ShareContactSheet({ contact, onDone }: Props) {
  const nameFields: Field[] = [
    { key: 'first', label: 'First name', value: contact.first },
    { key: 'last', label: 'Last name', value: contact.last },
  ].filter((f) => f.value)
  const otherFields: Field[] = [
    { key: 'company', label: 'company', value: contact.company },
    { key: 'phone', label: 'mobile', value: contact.phone },
    { key: 'birthday', label: 'birthday', value: contact.birthday ? formatDay(contact.birthday) : '' },
    { key: 'anniversary', label: 'anniversary', value: contact.anniversary ? formatDay(contact.anniversary) : '' },
    { key: 'notes', label: 'Notes', value: contact.notes },
  ].filter((f) => f.value)

  const all = [...nameFields, ...otherFields]
  const [picked, setPicked] = useState<Set<string>>(() => new Set(nameFields.map((f) => f.key)))
  const allOn = all.length > 0 && all.every((f) => picked.has(f.key))

  const toggle = (key: string) =>
    setPicked((s) => {
      const n = new Set(s)
      if (n.has(key)) n.delete(key)
      else n.add(key)
      return n
    })

  const row = (f: Field, grouped = false) => (
    <button key={f.key} type="button" className={`share-row${grouped ? ' grouped' : ''}`} onClick={() => toggle(f.key)}>
      <span className={`share-check${picked.has(f.key) ? ' on' : ''}`}>{picked.has(f.key) && <CheckIcon size={13} />}</span>
      <span className="share-text">
        <span className="share-label">{f.label}</span>
        <span className="share-value">{f.value}</span>
      </span>
    </button>
  )

  const send = () => {
    const lines = all.filter((f) => picked.has(f.key))
    const name = displayName(contact)
    const text = [
      ...(lines.length ? [] : [name]),
      ...lines.map((f) => (f.key === 'first' || f.key === 'last' || f.key === 'phone' ? f.value : `${f.label}: ${f.value}`)),
    ].join('\n')
    onDone(text)
  }

  return (
    <div className="form share-sheet">
      <div className="grabber" aria-hidden />
      <header className="sheet-bar">
        <span />
        <span className="sheet-title">Share Contact</span>
        <button type="button" className="glass-btn round done ready" aria-label="Share" disabled={picked.size === 0} onClick={send}>
          <CheckIcon size={22} />
        </button>
      </header>

      <div className="scroll share-scroll">
        {nameFields.length > 0 && <div className="share-card">{nameFields.map((f) => row(f, true))}</div>}
        {otherFields.map((f) => (
          <div key={f.key} className="share-card">
            {row(f)}
          </div>
        ))}
      </div>

      <div className="share-footer">
        <button
          type="button"
          className="glass-btn share-all"
          onClick={() => setPicked(allOn ? new Set() : new Set(all.map((f) => f.key)))}
        >
          {allOn ? 'Deselect All Fields' : 'Select All Fields'}
        </button>
      </div>
    </div>
  )
}
