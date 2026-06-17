import { KanbanBoard } from './components/board/KanbanBoard'
import { AppHeader } from './components/layout/AppHeader'
import { KeyboardHints } from './components/ui/KeyboardHints'

function App() {
  return (
    <div className="bg-mesh flex min-h-svh flex-col">
      <AppHeader />

      <main className="mx-auto w-full max-w-[min(96vw,1400px)] flex-1 px-4 py-5">
        <KanbanBoard />
      </main>

      <KeyboardHints />
    </div>
  )
}

export default App