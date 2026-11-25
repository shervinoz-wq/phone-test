import { useMemo, useState } from 'react'
import {
  CheckCircleOutlineIcon,
  CheckIcon,
  ClassicLayoutIcon,
  FilterIcon,
  InfoIcon,
  MinusCircleIcon,
  MissedIcon,
  PersonCircleOutlineIcon,
  PhoneOutlineIcon,
  SmallPhoneIcon,
  StarOutlineIcon,
  UnifiedLayoutIcon,
  VoicemailIcon,
} from '../components/Icons'
import { BandScroll } from '../components/BandScroll'
import { Menu, MenuDivider, MenuItem } from '../components/Menu'
import { ActionSheet } from '../components/Sheet'
import { useApp } from '../hooks/useApp'
import { useStore } from '../hooks/useStore'
import { displayName, recentLabel } from '../utils/format'

type Filter = 'calls' | 'missed' | 'voicemail'

export function CallsPage() {
  const { state, dispatch } = useStore()
  const app = useApp()
  const [filter, setFilter] = useState<Filter>('calls')
  const [selecting, setSelecting] = useState(false)
  const [editMenu, setEditMenu] = useState(false)
  const [filterMenu, setFilterMenu] = useState(false)
  const [layout, setLayout] = useState<'classic' | 'unified'>('unified') // display only
  const [filterFrom, setFilterFrom] = useState<DOMRect | null>(null)
  const [editFrom, setEditFrom] = useState<DOMRect | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const rows = useMemo(
    () => (filter === 'missed' ? state.recents.filter((r) => r.kind === 'missed') : state.recents),
    [state.recents, filter],
  )
  const favs = state.favourites
    .map((id) => state.contacts.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => !!c)
  const showFavs = filter === 'calls' && favs.length > 0
  const nothing = filter === 'voicemail' || (rows.length === 0 && !showFavs)

  return (
    <div className="page bands">
      <header className="navbar">
        <div className="nav-side nav-left">
          {selecting ? (
            <button type="button" className="glass-btn" onClick={() => setSelecting(false)}>
              Done
            </button>
          ) : (
            <button
              type="button"
              className="glass-btn"
              onClick={(e) => {
                setEditFrom(e.currentTarget.getBoundingClientRect())
                setEditMenu(true)
              }}
            >
              Edit
            </button>
          )}
        </div>
        <div className="nav-center">
          <span className="nav-title">{filter === 'missed' ? 'Missed' : filter === 'voicemail' ? 'Voicemail' : 'Calls'}</span>
        </div>
        <div className="nav-side nav-right">
          {selecting ? (
            <button type="button" className="glass-btn" onClick={() => setConfirmClear(true)}>
              Clear
            </button>
          ) : (
            <button type="button" className="glass-btn round" aria-label="Filter"
              onClick={(e) => {
                setFilterFrom(e.currentTarget.getBoundingClientRect())
                setFilterMenu(true)
              }}
            >
              <FilterIcon size={22} />
            </button>
          )}
        </div>
      </header>

      <BandScroll>
        {nothing ? (
          <div className="empty center">
            <div className="empty-title">{filter === 'voicemail' ? 'No Voicemail' : 'No Recents'}</div>
          </div>
        ) : (
          <>
            {showFavs && (
              <>
                <h2 className="list-heading">Favorites</h2>
                <ul className={`list${selecting ? ' editing' : ''}`}>
                  {favs.map((c) => (
                    <li key={c.id} className="row">
                      {selecting && (
                        <button
                          type="button"
                          className="row-delete"
                          aria-label={`Remove ${displayName(c)}`}
                          onClick={() => dispatch({ type: 'favourite/remove', id: c.id })}
                        >
                          <MinusCircleIcon size={24} />
                        </button>
                      )}
                      <button
                        type="button"
                        className="row-main"
                        onClick={() => (selecting ? undefined : app.startCall(c.phone, c.id))}
                      >
                        <span className="row-title">{displayName(c)}</span>
                        <span className="row-sub">mobile</span>
                      </button>
                      {!selecting && (
                        <button
                          type="button"
                          className="info-btn"
                          aria-label={`Info for ${displayName(c)}`}
                          onClick={() => app.openContact(c.id, 'calls')}
                        >
                          <InfoIcon size={24} />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {rows.length > 0 && showFavs && <h2 className="list-heading">Recents</h2>}
            <ul className={`list${selecting ? ' editing' : ''}`}>
              {rows.map((r) => {
                const contact = r.contactId ? state.contacts.find((c) => c.id === r.contactId) : undefined
                const name = contact ? displayName(contact) : r.number
                return (
                  <li key={r.id} className="row">
                    {selecting && (
                      <button
                        type="button"
                        className="row-delete"
                        aria-label="Delete"
                        onClick={() => dispatch({ type: 'recent/delete', id: r.id })}
                      >
                        <MinusCircleIcon size={24} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="row-main"
                      onClick={() => (selecting ? undefined : app.startCall(r.number, contact?.id))}
                    >
                      <span className={`row-title${r.kind === 'missed' ? ' missed' : ''}`}>{name}</span>
                      <span className="row-sub">
                        {r.kind === 'outgoing' && <SmallPhoneIcon size={11} className="sub-icon" />}
                        {contact ? 'mobile' : 'unknown'}
                      </span>
                    </button>
                    <span className="row-time">{recentLabel(r.at)}</span>
                    {!selecting && (
                      <button
                        type="button"
                        className="info-btn"
                        aria-label="Call details"
                        onClick={() => (contact ? app.openContact(contact.id, 'calls') : app.newContact(r.number))}
                      >
                        <InfoIcon size={24} />
                      </button>
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </BandScroll>

      {/* Edit menu (top-left) */}
      <Menu open={editMenu} anchor="left" morph morphFrom={editFrom} onClose={() => setEditMenu(false)}>
        <MenuItem
          icon={<PersonCircleOutlineIcon size={24} />}
          onClick={() => {
            setEditMenu(false)
            app.editMyCard()
          }}
        >
          Set Up Name and Photo
        </MenuItem>
        <MenuDivider />
        <MenuItem
          icon={<StarOutlineIcon size={24} />}
          onClick={() => {
            setEditMenu(false)
            app.pickFavourite()
          }}
        >
          Add Favorite
        </MenuItem>
        <MenuItem
          icon={<CheckCircleOutlineIcon size={24} />}
          onClick={() => {
            setEditMenu(false)
            setSelecting(true)
          }}
        >
          Select
        </MenuItem>
      </Menu>

      {/* Filter menu (top-right) */}
      <Menu open={filterMenu} anchor="right" morph morphFrom={filterFrom} onClose={() => setFilterMenu(false)}>
        <div className="layout-picker">
          {(
            [
              ['classic', 'Classic', <ClassicLayoutIcon key="c" active={layout === 'classic'} />],
              ['unified', 'Unified', <UnifiedLayoutIcon key="u" active={layout === 'unified'} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              className="layout-option"
              onClick={() => {
                setLayout(id) // visual only
                setFilterMenu(false)
              }}
            >
              {icon}
              <span>{label}</span>
              <span className={`radio${layout === id ? ' on' : ''}`}>{layout === id && <CheckIcon size={16} />}</span>
            </button>
          ))}
        </div>
        <MenuDivider />
        {(
          [
            ['calls', 'Calls', <PhoneOutlineIcon key="p" size={24} />],
            ['missed', 'Missed', <MissedIcon key="m" size={24} />],
            ['voicemail', 'Voicemail', <VoicemailIcon key="v" size={24} />],
          ] as const
        ).map(([id, label, icon]) => (
          <MenuItem
            key={id}
            checked={filter === id}
            icon={icon}
            onClick={() => {
              setFilter(id)
              setFilterMenu(false)
            }}
          >
            {label}
          </MenuItem>
        ))}
        <MenuDivider />
        <MenuItem
          indent
          onClick={() => {
            setFilterMenu(false)
          }}
        >
          Manage Filtering
        </MenuItem>
      </Menu>

      <ActionSheet
        open={confirmClear}
        title="Are you sure you want to clear all recents?"
        onClose={() => setConfirmClear(false)}
        actions={[
          {
            label: 'Clear All Recents',
            destructive: true,
            onClick: () => {
              dispatch({ type: 'recent/clear' })
              setSelecting(false)
            },
          },
        ]}
      />
    </div>
  )
}
