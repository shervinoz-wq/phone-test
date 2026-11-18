import type { ComponentType } from 'react'
import type { TabId } from '../types'
import { ClockIcon, KeypadIcon, PersonCircleIcon, SearchGlassIcon } from './Icons'

const TABS: { id: TabId; label: string; Icon: ComponentType<{ size?: number }> }[] = [
  { id: 'calls', label: 'Calls', Icon: ClockIcon },
  { id: 'contacts', label: 'Contacts', Icon: PersonCircleIcon },
  { id: 'keypad', label: 'Keypad', Icon: KeypadIcon },
]

interface Props {
  active: TabId
  onChange: (tab: TabId) => void
  onSearch: () => void
  missedBadge: number
  hidden?: boolean
}

/** iOS 26 floating tab bar (demo: no animation, the selection simply jumps). */
export function TabBar({ active, onChange, onSearch, hidden }: Props) {
  return (
    <div className={`tabbar-wrap${hidden ? ' hidden' : ''}`}>
      <nav className="tabbar glass" aria-label="Main">
        <div className="tab-row">
          {TABS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={`tab${active === id ? ' selected' : ''}`}
              aria-current={active === id ? 'page' : undefined}
              onClick={() => onChange(id)}
            >
              <span className="tab-icon">
                <Icon size={23} />
              </span>
              <span className="tab-label">{label}</span>
            </button>
          ))}
        </div>
      </nav>
      <button type="button" className="search-btn glass" aria-label="Search" tabIndex={-1} onClick={onSearch}>
        <SearchGlassIcon size={26} />
      </button>
    </div>
  )
}
