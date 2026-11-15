import { useState } from 'react'
import { SearchIcon } from './Icons'

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export function SearchField({ value, onChange, placeholder = 'Search' }: Props) {
  const [focused, setFocused] = useState(false)
  const cancel = () => {
    onChange('')
    setFocused(false)
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
  }
  return (
    <div className="search-row">
      <label className="search-field">
        <SearchIcon size={17} />
        <input
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoCapitalize="off"
          autoCorrect="off"
          enterKeyHint="search"
        />
      </label>
      {(focused || value) && (
        <button className="link-btn" onMouseDown={(e) => e.preventDefault()} onClick={cancel}>
          Cancel
        </button>
      )}
    </div>
  )
}
