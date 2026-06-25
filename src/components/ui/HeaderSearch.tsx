import { useEffect, useRef, useState } from 'react'

interface HeaderSearchProps {
  query: string
  onQueryChange: (query: string) => void
}

export function HeaderSearch({ query, onQueryChange }: HeaderSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(false)

  const isExpanded = expanded || query.length > 0

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setExpanded(true)
        requestAnimationFrame(() => {
          inputRef.current?.focus()
          inputRef.current?.select()
        })
      }

      if (e.key === 'Escape' && isExpanded) {
        onQueryChange('')
        setExpanded(false)
        inputRef.current?.blur()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isExpanded, onQueryChange])

  useEffect(() => {
    if (!isExpanded) return

    function handlePointerDown(e: MouseEvent) {
      if (rootRef.current?.contains(e.target as Node)) return
      if (!query) setExpanded(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [isExpanded, query])

  function openSearch() {
    setExpanded(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function handleBlur() {
    if (!query) setExpanded(false)
  }

  return (
    <div
      ref={rootRef}
      className={[
        'header-search',
        isExpanded && 'header-search--expanded',
      ].join(' ')}
    >
      <button
        type="button"
        aria-label="Search tasks"
        onClick={openSearch}
        className="header-search__icon-btn glass-subtle"
      >
        <SearchIcon />
      </button>

      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onBlur={handleBlur}
        placeholder="Search…"
        aria-label="Search tasks"
        tabIndex={isExpanded ? 0 : -1}
        className="header-search__input"
      />
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}