import { useAppDispatch, useAppSelector } from './app/hooks'
import { KanbanBoard } from './components/board/KanbanBoard'
import { toggleTheme } from './features/theme/themeSlice'
import { getColumnTasks } from './features/kanban/utils'

function App() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)
  const tasks = useAppSelector((state) => state.kanban.tasks)
  const doneCount = getColumnTasks(tasks, 'done').length

  return (
    <div className="bg-mesh min-h-svh">
      <header className="glass mx-4 mt-4 flex max-w-6xl items-center justify-between rounded-2xl px-6 py-4 lg:mx-auto">
        <div className="text-left">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            GlassFlow
          </h1>
          <p className="text-sm text-text-secondary">
            {doneCount} done · {tasks.length} total today
          </p>
        </div>
        <button
          type="button"
          onClick={() => dispatch(toggleTheme())}
          className="glass-subtle rounded-full px-4 py-2 text-sm font-medium text-text-primary transition hover:opacity-80"
        >
          {theme === 'light' ? 'Dark' : 'Light'} mode
        </button>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <KanbanBoard />
      </main>
    </div>
  )
}

export default App