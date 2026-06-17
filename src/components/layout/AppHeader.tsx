import { useAppSelector } from '../../app/hooks'
import { DaySummary } from '../ui/DaySummary'
import { ThemeToggle } from '../ui/ThemeToggle'

export function AppHeader() {
  const tasks = useAppSelector((state) => state.kanban.tasks)

  return (
    <header className="glass-header mx-4 mt-4 shrink-0 rounded-3xl p-5 lg:mx-auto lg:w-full lg:max-w-[min(96vw,1400px)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text-primary">
            GlassFlow
          </h1>
          <p className="mt-0.5 text-sm text-text-secondary">
            Your daily work kanban
          </p>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-4">
        <DaySummary tasks={tasks} />
      </div>
    </header>
  )
}