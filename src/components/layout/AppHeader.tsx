import { useAppSelector } from '../../app/hooks'
import type { BoardFilters } from '../../features/kanban/filters'
import { BackupControls } from '../ui/BackupControls'
import { DaySummary } from '../ui/DaySummary'
import { HeaderSearch } from '../ui/HeaderSearch'
import { ThemeToggle } from '../ui/ThemeToggle'

interface AppHeaderProps {
  boardFilters: BoardFilters
  onBoardFiltersChange: (filters: BoardFilters) => void
}

export function AppHeader({
  boardFilters,
  onBoardFiltersChange,
}: AppHeaderProps) {
  const tasks = useAppSelector((state) => state.kanban.tasks)

  return (
    <header className="app-header glass-header mx-3 mt-3 shrink-0 rounded-2xl p-4 sm:mx-4 sm:mt-4 sm:rounded-3xl sm:p-5 lg:mx-auto lg:w-full lg:max-w-[87.5rem]">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold tracking-tight text-text-primary sm:text-xl">
            GlassFlow
          </h1>
          <p className="mt-0.5 text-xs text-text-secondary sm:text-sm">
            Your daily work board
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <HeaderSearch
            query={boardFilters.query}
            onQueryChange={(query) =>
              onBoardFiltersChange({ ...boardFilters, query })
            }
          />
          <BackupControls />
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-4">
        <DaySummary tasks={tasks} />
      </div>
    </header>
  )
}