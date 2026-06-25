import { useState } from 'react'
import { KanbanBoard } from './components/board/KanbanBoard'
import { AppHeader } from './components/layout/AppHeader'
import { KeyboardHints } from './components/ui/KeyboardHints'
import { DEFAULT_BOARD_FILTERS } from './features/kanban/filters'
import type { BoardFilters } from './features/kanban/filters'

function App() {
  const [boardFilters, setBoardFilters] = useState<BoardFilters>(
    DEFAULT_BOARD_FILTERS,
  )

  return (
    <div className="app-shell bg-mesh flex min-h-svh flex-col">
      <AppHeader
        boardFilters={boardFilters}
        onBoardFiltersChange={setBoardFilters}
      />

      <main className="app-main mx-auto w-full max-w-[87.5rem] flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
        <KanbanBoard
          boardFilters={boardFilters}
          onBoardFiltersChange={setBoardFilters}
        />
      </main>

      <KeyboardHints />
    </div>
  )
}

export default App