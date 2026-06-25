import type { BoardView } from '../../features/kanban/views'
import { BOARD_VIEWS } from '../../features/kanban/views'

interface BoardViewSwitcherProps {
  value: BoardView
  onChange: (view: BoardView) => void
}

export function BoardViewSwitcher({ value, onChange }: BoardViewSwitcherProps) {
  return (
    <div
      className="board-view-switcher"
      role="tablist"
      aria-label="Board view"
    >
      {BOARD_VIEWS.map((view) => {
        const active = value === view.id
        return (
          <button
            key={view.id}
            type="button"
            role="tab"
            aria-selected={active}
            className={[
              'board-view-switcher__btn',
              active && 'board-view-switcher__btn--active',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => onChange(view.id)}
          >
            <ViewIcon view={view.id} />
            <span className="board-view-switcher__label">{view.label}</span>
            <span className="board-view-switcher__label-short">
              {view.shortLabel}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function ViewIcon({ view }: { view: BoardView }) {
  switch (view) {
    case 'kanban':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="3" width="5" height="18" rx="1" />
          <rect x="10" y="3" width="5" height="12" rx="1" />
          <rect x="17" y="3" width="5" height="15" rx="1" />
        </svg>
      )
    case 'list':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      )
    case 'calendar':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      )
    case 'timeline':
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="M3 12h18M8 7l-5 5 5 5M16 7l5 5-5 5" />
        </svg>
      )
  }
}