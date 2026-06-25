import { useState } from 'react'
import { BoardWorkspace } from './components/board/BoardWorkspace'
import { AppHeader } from './components/layout/AppHeader'
import { KeyboardHints } from './components/ui/KeyboardHints'
import { DEFAULT_BOARD_FILTERS } from './features/kanban/filters'
import type { BoardFilters } from './features/kanban/filters'
import { loadBoardView, saveBoardView } from './features/kanban/views'
import type { BoardView } from './features/kanban/views'

function App() {
  const [boardFilters, setBoardFilters] = useState<BoardFilters>(
    DEFAULT_BOARD_FILTERS,
  )
  const [boardView, setBoardView] = useState<BoardView>(loadBoardView)

  function handleBoardViewChange(view: BoardView) {
    setBoardView(view)
    saveBoardView(view)
  }

  return (
    <div className="app-shell bg-mesh flex min-h-svh flex-col">
      <AppHeader
        boardFilters={boardFilters}
        onBoardFiltersChange={setBoardFilters}
      />

      <main className="app-main mx-auto w-full max-w-[87.5rem] flex-1 px-3 py-5 sm:px-4 sm:py-6 lg:px-6">
        <BoardWorkspace
          boardFilters={boardFilters}
          onBoardFiltersChange={setBoardFilters}
          boardView={boardView}
          onBoardViewChange={handleBoardViewChange}
        />
      </main>

      <KeyboardHints />
    </div>
  )
}

export default App