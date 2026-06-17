import { useAppDispatch, useAppSelector } from './app/hooks'
import { toggleTheme } from './features/theme/themeSlice'

function App() {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.theme)

  return (
    <div className="bg-mesh min-h-svh">
      <header className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-6 py-4 m-4">
        <div className="text-left">
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            GlassFlow
          </h1>
          <p className="text-sm text-text-secondary">
            Your daily work kanban
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

      <main className="mx-auto max-w-6xl px-4 pb-8">
        <section className="glass rounded-3xl p-8 text-center">
          <p className="text-text-secondary">
            Project initialized. Kanban board coming next.
          </p>
        </section>
      </main>
    </div>
  )
}

export default App