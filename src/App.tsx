import { KanbanBoard } from './components/board/KanbanBoard'
import { AppHeader } from './components/layout/AppHeader'
import { KeyboardHints } from './components/ui/KeyboardHints'

function App() {
  return (
    <div className="app-shell bg-mesh flex min-h-svh flex-col">
      <AppHeader />

      <main className="app-main mx-auto w-full max-w-[87.5rem] flex-1 px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
        <KanbanBoard />
      </main>

      <KeyboardHints />
    </div>
  )
}

export default App