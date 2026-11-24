import { useEffect, useRef, useState } from 'react'
import { CheckIcon, ChevronDownIcon, ChevronRightIcon, MinusCircleIcon, PeopleIcon } from '../components/Icons'
import { useStore } from '../hooks/useStore'
import { uid } from '../utils/format'

export interface ListTarget {
  /** null = every contact, otherwise the id of a user-created list */
  id: string | null
  title: string
}

interface Props {
  onOpen: (target: ListTarget) => void
}

/** iOS 26 "Lists" page that sits below the Contacts page in the navigation stack. */
export function ListsPage({ onOpen }: Props) {
  const { state, dispatch } = useStore()
  const [editing, setEditing] = useState(false)
  const [open, setOpen] = useState(true) // "iPhone" section expanded
  const [focusId, setFocusId] = useState<string | null>(null)
  const inputs = useRef<Record<string, HTMLInputElement | null>>({})
  const total = state.contacts.length

  useEffect(() => {
    if (focusId) inputs.current[focusId]?.focus()
  }, [focusId, state.lists.length])

  const finish = () => {
    // an unnamed list is discarded, like on iOS
    for (const l of state.lists) if (!l.name.trim()) dispatch({ type: 'list/delete', id: l.id })
    setFocusId(null)
    setEditing(false)
    ;(document.activeElement as HTMLElement | null)?.blur()
  }

  const addList = () => {
    const blank = state.lists.find((l) => !l.name.trim())
    setEditing(true)
    setOpen(true)
    if (blank) {
      setFocusId(blank.id)
      return
    }
    const id = uid()
    dispatch({ type: 'list/add', list: { id, name: '' } })
    setFocusId(id)
  }

  return (
    <div className={`page lists-page${editing ? ' editing' : ''}`}>
      <header className="navbar">
        <div className="nav-side nav-left">
          {editing ? (
            <button type="button" className="glass-btn round done ready" aria-label="Done" onClick={finish}>
              <CheckIcon size={22} />
            </button>
          ) : (
            <button type="button" className="glass-btn" onClick={() => setEditing(true)}>
              Edit
            </button>
          )}
        </div>
        <div className="nav-center">
          <span className="nav-title">Lists</span>
        </div>
        <div className="nav-side nav-right">
          <button type="button" className="glass-btn" onClick={addList}>
            Add List
          </button>
        </div>
      </header>

      <div className="scroll lists-scroll">
        <div className="lists-card single">
          <button type="button" className="lists-row" disabled={editing} onClick={() => onOpen({ id: null, title: 'Contacts' })}>
            <PeopleIcon size={19} className="lists-icon" />
            <span className="lists-name">All Contacts</span>
            <span className="lists-count">{total}</span>
            <ChevronRightIcon size={13} className="lists-chev" />
          </button>
        </div>

        <button type="button" className="lists-section" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
          <span>iPhone</span>
          <ChevronDownIcon size={11} className={`lists-fold${open ? '' : ' closed'}`} />
        </button>

        <div className={`lists-collapse${open ? ' open' : ''}`}>
          <div className="lists-collapse-inner">
            <div className="lists-card">
              <button type="button" className="lists-row" disabled={editing} onClick={() => onOpen({ id: null, title: 'Contacts' })}>
                <span className="lists-name">All iPhone</span>
                <span className="lists-count">{total}</span>
                <ChevronRightIcon size={13} className="lists-chev" />
              </button>
              {state.lists.map((l) => (
                <div key={l.id} className="lists-row custom">
                  {editing && (
                    <button
                      type="button"
                      className="lists-minus"
                      aria-label={`Delete ${l.name || 'list'}`}
                      onClick={() => dispatch({ type: 'list/delete', id: l.id })}
                    >
                      <MinusCircleIcon size={24} />
                    </button>
                  )}
                  {editing ? (
                    <input
                      ref={(el) => void (inputs.current[l.id] = el)}
                      className="lists-input"
                      value={l.name}
                      placeholder="List Name"
                      autoCapitalize="words"
                      enterKeyHint="done"
                      onChange={(e) => dispatch({ type: 'list/rename', id: l.id, name: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && finish()}
                    />
                  ) : (
                    <button type="button" className="lists-open" onClick={() => onOpen({ id: l.id, title: l.name })}>
                      <span className="lists-name">{l.name}</span>
                      <span className="lists-count">0</span>
                      <ChevronRightIcon size={13} className="lists-chev" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lists-card single other">
          <button type="button" className="lists-row" disabled={editing} onClick={() => onOpen({ id: null, title: 'Other Known' })}>
            <span className="lists-name">Other Known</span>
            <span className="lists-count">{total}</span>
            <ChevronRightIcon size={13} className="lists-chev" />
          </button>
        </div>
      </div>
    </div>
  )
}
