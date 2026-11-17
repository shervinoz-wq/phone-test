import { useEffect, useMemo, useRef, useState } from 'react'
import { CloseIcon, SearchGlassIcon } from '../components/Icons'
import { useApp } from '../hooks/useApp'
import { useKeyboardInset } from '../hooks/useKeyboardInset'
import { useStore } from '../hooks/useStore'
import { useTransitionMount } from '../hooks/useTransitionMount'
import { digitsOf, displayName, recentLabel } from '../utils/format'

interface Props {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: Props) {
  const { mounted, shown } = useTransitionMount(open, 260)
  // The body is unmounted when closed, so the query resets by itself.
  return mounted ? <SearchBody open={open} shown={shown} onClose={onClose} /> : null
}

function SearchBody({ open, shown, onClose }: Props & { shown: boolean }) {
  const { state } = useStore()
  const app = useApp()
  const [query, setQuery] = useState('')
  const input = useRef<HTMLInputElement | null>(null)
  useKeyboardInset(open)

  useEffect(() => {
    const t = window.setTimeout(() => input.current?.focus(), 60)
    return () => window.clearTimeout(t)
  }, [])

  const q = query.trim().toLowerCase()
  const dq = digitsOf(q)

  const contacts = useMemo(
    () =>
      q
        ? state.contacts.filter(
            (c) =>
              displayName(c).toLowerCase().includes(q) ||
              c.company.toLowerCase().includes(q) ||
              (dq !== '' && digitsOf(c.phone).includes(dq)),
          )
        : [],
    [state.contacts, q, dq],
  )
  const recents = useMemo(
    () =>
      q
        ? state.recents.filter((r) => {
            const c = r.contactId ? state.contacts.find((x) => x.id === r.contactId) : undefined
            return (
              (c && displayName(c).toLowerCase().includes(q)) || (dq !== '' && digitsOf(r.number).includes(dq))
            )
          })
        : [],
    [state.recents, state.contacts, q, dq],
  )

  const empty = contacts.length === 0 && recents.length === 0

  return (
    <div className={`search-overlay${shown ? ' is-open' : ''}`} role="dialog" aria-label="Search">
      <div className="search-results">
        {empty ? (
          <div className="empty center">
            <div className="empty-title">No Results</div>
            <p>Try a new search.</p>
          </div>
        ) : (
          <>
            {contacts.length > 0 && <h2 className="list-heading">Contacts</h2>}
            <ul className="list">
              {contacts.map((c) => (
                <li key={c.id} className="row">
                  <button
                    type="button"
                    className="row-main"
                    onClick={() => {
                      onClose()
                      app.openContact(c.id, 'contacts')
                    }}
                  >
                    <span className="row-title plain">{displayName(c)}</span>
                    <span className="row-sub">{c.phone}</span>
                  </button>
                </li>
              ))}
            </ul>
            {recents.length > 0 && <h2 className="list-heading">Recents</h2>}
            <ul className="list">
              {recents.map((r) => {
                const c = r.contactId ? state.contacts.find((x) => x.id === r.contactId) : undefined
                return (
                  <li key={r.id} className="row">
                    <button
                      type="button"
                      className="row-main"
                      onClick={() => {
                        onClose()
                        app.startCall(r.number, c?.id)
                      }}
                    >
                      <span className={`row-title${r.kind === 'missed' ? ' missed' : ''}`}>
                        {c ? displayName(c) : r.number}
                      </span>
                      <span className="row-sub">{c ? 'mobile' : 'unknown'}</span>
                    </button>
                    <span className="row-time">{recentLabel(r.at)}</span>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      <div className="search-bar-row">
        <label className="search-field glass">
          <SearchGlassIcon size={21} />
          <input
            ref={input}
            type="search"
            placeholder="Search"
            aria-label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="search"
          />
        </label>
        <button type="button" className="search-close glass" aria-label="Close search" onClick={onClose}>
          <CloseIcon size={22} />
        </button>
      </div>
    </div>
  )
}
