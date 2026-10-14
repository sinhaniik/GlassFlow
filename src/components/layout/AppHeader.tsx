interface AppHeaderProps {
  onCreateTask: () => void
  onSearch: () => void
  searchOpen: boolean
  query: string
  onQueryChange: (query: string) => void
  onCloseSearch: () => void
}

export function AppHeader({ onCreateTask, onSearch, searchOpen, query, onQueryChange, onCloseSearch }: AppHeaderProps) {
  return (
    <header className="app-header">
      <a className="brand" href="#board" aria-label="GlassFlow home">
        <span className="brand-mark" aria-hidden="true">G</span>
        <span>GlassFlow</span>
      </a>
      <div className="header-actions">
        {searchOpen ? (
          <div className="header-search">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>
            <input autoFocus type="search" aria-label="Search tasks" placeholder="Search tasks" value={query} onChange={(event) => onQueryChange(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') onCloseSearch() }} />
            <button type="button" aria-label="Close search" onClick={onCloseSearch}>Esc</button>
          </div>
        ) : (
          <button type="button" className="icon-button header-search-button" aria-label="Search tasks" onClick={onSearch}>
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>
          </button>
        )}
        <button
          type="button"
          className="primary-button new-task-button"
          aria-label="New task"
          onClick={onCreateTask}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
          <span className="new-task-label">New task</span>
        </button>
      </div>
    </header>
  )
}
