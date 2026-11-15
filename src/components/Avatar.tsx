import type { Contact } from '../types'
import { initials } from '../lib/contacts'
import { PersonCircleIcon } from './Icons'

export function Avatar({ contact, size = 40 }: { contact?: Contact; size?: number }) {
  const text = contact ? initials(contact) : ''
  return (
    <div
      className="avatar"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      aria-hidden="true"
    >
      {text || <PersonCircleIcon size={size * 0.95} />}
    </div>
  )
}
