import { useEffect, useRef, useState } from 'react'
import type { BoardFilters, ToggleBoardFilters } from '../../features/kanban/filters'
import {
  DEFAULT_TOGGLE_FILTERS,
  hasActiveFilters,
  hasActiveToggleFilters,
} from '../../features/kanban/filters'

interface BoardFiltersBarProps {
  filters: BoardFilters
  onChange: (filters: BoardFilters) => void
  resultCount: number
  totalCount: number
}

type ToggleFilterKey = keyof ToggleBoardFilters

const FILTER_OPTIONS: {
  key: ToggleFilterKey
  label: string
  description: string
  accent: 'pink' | 'orange' | 'mint' | 'purple'
}[] = [
  {
    key: 'priorityHigh',
    label: 'High priority',
    description: 'Only urgent tasks',
    accent: 'pink',
  },
  {
    key: 'dueToday',
    label: 'Due today',
    description: 'Tasks due by end of day',
    accent: 'orange',
  },
  {
    key: 'completed',
    label: 'Completed',
    description: 'Tasks in Done',
    accent: 'mint',
  },
  {
    key: 'labelFeatures',
    label: 'Features',
    description: 'Feature label or keyword',
    accent: 'purple',
  },
]

export function BoardFiltersBar({
  filters,
  onChange,
  resultCount,
  totalCount,
}: BoardFiltersBarProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const filterBtnRef = useRef<HTMLButtonElement>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const [draft, setDraft] = useState<ToggleBoardFilters>(DEFAULT_TOGGLE_FILTERS)

  useEffect(() => {
    if (!panelOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        setPanelOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [panelOpen])

  useEffect(() => {
    if (!panelOpen) return

    function handlePointerDown(e: MouseEvent) {
      const target = e.target as Node
      if (
        panelRef.current?.contains(target) ||
        filterBtnRef.current?.contains(target)
      ) {
        return
      }
      setPanelOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [panelOpen])

  function openPanel() {
    setDraft({
      priorityHigh: filters.priorityHigh,
      dueToday: filters.dueToday,
      completed: filters.completed,
      labelFeatures: filters.labelFeatures,
    })
    setPanelOpen(true)
  }

  function applyDraft() {
    onChange({ ...filters, ...draft })
    setPanelOpen(false)
  }

  function toggleDraft(key: ToggleFilterKey) {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  function clearDraft() {
    setDraft(DEFAULT_TOGGLE_FILTERS)
  }

  function clearToggleFilters() {
    onChange({ ...filters, ...DEFAULT_TOGGLE_FILTERS })
    setDraft(DEFAULT_TOGGLE_FILTERS)
    setPanelOpen(false)
  }

  function handlePanelKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault()
      applyDraft()
    }
  }

  const active = hasActiveFilters(filters)
  const toggleFiltersActive = hasActiveToggleFilters(filters)
  const draftCount = Object.values(draft).filter(Boolean).length
  const activeFilterCount = Object.values({
    priorityHigh: filters.priorityHigh,
    dueToday: filters.dueToday,
    completed: filters.completed,
    labelFeatures: filters.labelFeatures,
  }).filter(Boolean).length

  return (
    <section className="board-filters" aria-label="Filter tasks">
      <div className="board-filters__actions">
        <div className="board-search__filter-anchor">
          <button
            ref={filterBtnRef}
            type="button"
            aria-expanded={panelOpen}
            aria-haspopup="dialog"
            onClick={() => (panelOpen ? setPanelOpen(false) : openPanel())}
            className={[
              'board-search__filter-btn',
              (panelOpen || toggleFiltersActive) &&
                'board-search__filter-btn--active',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <FilterIcon />
            <span>Filters</span>
            {toggleFiltersActive && (
              <span className="board-search__filter-badge">
                {activeFilterCount}
              </span>
            )}
          </button>

          {panelOpen && (
            <div
              ref={panelRef}
              role="dialog"
              aria-label="Filter tasks"
              className="filter-panel"
              onKeyDown={handlePanelKeyDown}
            >
              <header className="filter-panel__header">
                <div>
                  <p className="filter-panel__title">Filter tasks</p>
                  <p className="filter-panel__subtitle">
                    Narrow your board view
                  </p>
                </div>
                <button
                  type="button"
                  className="filter-panel__close"
                  aria-label="Close filters"
                  onClick={() => setPanelOpen(false)}
                >
                  <CloseIcon />
                </button>
              </header>

              <ul className="filter-panel__list">
                {FILTER_OPTIONS.map(({ key, label, description, accent }) => {
                  const checked = draft[key]
                  return (
                    <li key={key}>
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        onClick={() => toggleDraft(key)}
                        className={[
                          'filter-panel__chip',
                          `filter-panel__chip--${accent}`,
                          checked && 'filter-panel__chip--active',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <span className="filter-panel__chip-check" aria-hidden>
                          {checked ? <CheckIcon /> : null}
                        </span>
                        <span className="filter-panel__chip-copy">
                          <span className="filter-panel__chip-label">{label}</span>
                          <span className="filter-panel__chip-desc">
                            {description}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {draftCount > 0 && (
                <p className="filter-panel__draft-count">
                  {draftCount} filter{draftCount === 1 ? '' : 's'} selected
                </p>
              )}

              <footer className="filter-panel__footer">
                <button
                  type="button"
                  onClick={clearDraft}
                  className="filter-panel__btn filter-panel__btn--ghost"
                  disabled={draftCount === 0}
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={applyDraft}
                  className="filter-panel__btn filter-panel__btn--primary"
                >
                  Apply filters
                </button>
              </footer>
            </div>
          )}
        </div>

        {toggleFiltersActive && (
          <button
            type="button"
            onClick={clearToggleFilters}
            className="board-search__clear"
          >
            Clear filters
          </button>
        )}
      </div>

      {active && (
        <p className="board-search__results" aria-live="polite">
          Showing <strong>{resultCount}</strong> of {totalCount} tasks
        </p>
      )}
    </section>
  )
}

function FilterIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  )
}