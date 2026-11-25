import type { Contact } from '../types'
import { initials } from '../utils/format'
import { PersonCropIcon, SilhouetteIcon } from './Icons'

interface Props {
  contact?: Pick<Contact, 'first' | 'last' | 'company'>
  size?: number
  /** Blue gradient (My Card / new contact) instead of the gray default. */
  blue?: boolean
}

export function Avatar({ contact, size = 40, blue = false }: Props) {
  const text = contact ? initials(contact) : ''
  return (
    <div
      className={`avatar${blue ? ' blue' : ''}`}
      style={{ width: size, height: size, fontSize: size * 0.52 }}
      aria-hidden
    >
      {text ? text : blue ? <SilhouetteIcon size={size} /> : <PersonCropIcon size={size * 0.62} />}
    </div>
  )
}
