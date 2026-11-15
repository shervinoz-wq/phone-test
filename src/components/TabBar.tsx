import type { ComponentType } from 'react'
import type { TabId } from '../types'
import { ClockIcon, GearIcon, KeypadIcon, PersonCircleIcon, StarIcon } from './Icons'

const TABS: { id: TabId; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'favourites', label: 'Favourites', Icon: StarIcon },
  { id: 'recents', label: 'Recent', Icon: ClockIcon },
  { id: 'contacts', label: 'Contacts', Icon: PersonCircleIcon },
  { id: 'keypad', label: 'Keypad', Icon: KeypadIcon },
  { id: 'settings', label: 'Settings', Icon: GearIcon },
]

export function TabBar({ active, onSelect }: { active: TabId; onSelect: (tab: TabId) => void }) {
  return (
    <nav className="tabbar" role="tablist" aria-label="Main">
      {TABS.map(({ id, label, Icon }) => (
        <button
          key={id}
          role="tab"
          aria-selected={active === id}
          className={'tab' + (active === id ? ' active' : '')}
          onClick={() => onSelect(id)}
        >
          <Icon size={26} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  )
}
