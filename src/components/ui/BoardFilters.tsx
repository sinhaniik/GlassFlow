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
  hint?: string
}[] = [
  { key: 'priorityHigh', label: 'High priority', hint: 'Priority' },
  { key: 'dueToday', label: 'Due today' },
  { key: 'completed', label: 'Completed' },
  { key: 'labelFeatures', label: 'features', hint: 'Label' },
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
            Filters
            {toggleFiltersActive && (
              <span className="board-search__filter-badge">
                {
                  Object.values({
                    priorityHigh: filters.priorityHigh,
                    dueToday: filters.dueToday,
                    completed: filters.completed,
                    labelFeatures: filters.labelFeatures,
                  }).filter(Boolean).length
                }
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
              <p className="filter-panel__title">Filters</p>

              <ul className="filter-panel__list">
                {FILTER_OPTIONS.map(({ key, label, hint }) => (
                  <li key={key}>
                    <label className="filter-panel__option">
                      <input
                        type="checkbox"
                        checked={draft[key]}
                        onChange={() => toggleDraft(key)}
                        className="filter-panel__checkbox"
                      />
                      <span className="filter-panel__option-text">
                        {hint && (
                          <span className="filter-panel__option-hint">
                            {hint}
                          </span>
                        )}
                        {label}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>

              {draftCount > 0 && (
                <p className="filter-panel__draft-count">
                  {draftCount} selected
                </p>
              )}

              <div className="filter-panel__footer">
                <button
                  type="button"
                  onClick={() => setPanelOpen(false)}
                  className="filter-panel__btn filter-panel__btn--ghost"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={applyDraft}
                  className="filter-panel__btn filter-panel__btn--primary"
                >
                  Okay
                </button>
              </div>
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