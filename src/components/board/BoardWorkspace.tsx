import { useMemo, useState } from 'react'
import { useAppSelector } from '../../app/hooks'
import type { BoardFilters } from '../../features/kanban/filters'
import {
  filterTasks,
  hasActiveFilters,
} from '../../features/kanban/filters'
import type { BoardView } from '../../features/kanban/views'
import { BoardFiltersBar } from '../ui/BoardFilters'
import { BoardViewSwitcher } from '../ui/BoardViewSwitcher'
import { TaskModal } from '../task/TaskModal'
import { CalendarView } from './CalendarView'
import { KanbanBoard } from './KanbanBoard'
import { ListView } from './ListView'
import { TimelineView } from './TimelineView'

interface BoardWorkspaceProps {
  boardFilters: BoardFilters
  onBoardFiltersChange: (filters: BoardFilters) => void
  boardView: BoardView
  onBoardViewChange: (view: BoardView) => void
}

export function BoardWorkspace({
  boardFilters,
  onBoardFiltersChange,
  boardView,
  onBoardViewChange,
}: BoardWorkspaceProps) {
  const tasks = useAppSelector((state) => state.kanban.tasks)
  const [modalTaskId, setModalTaskId] = useState<string | null>(null)

  const visibleTasks = useMemo(
    () => filterTasks(tasks, boardFilters),
    [tasks, boardFilters],
  )
  const filtersActive = hasActiveFilters(boardFilters)

  function handleOpenTask(taskId: string) {
    setModalTaskId(taskId)
  }

  return (
    <>
      <div className="board-toolbar">
        <BoardViewSwitcher value={boardView} onChange={onBoardViewChange} />
        <BoardFiltersBar
          filters={boardFilters}
          onChange={onBoardFiltersChange}
          resultCount={visibleTasks.length}
          totalCount={tasks.length}
        />
      </div>

      {boardView === 'kanban' && (
        <KanbanBoard
          boardFilters={boardFilters}
          onOpenTask={handleOpenTask}
          shortcutsDisabled={modalTaskId !== null}
        />
      )}

      {boardView === 'list' && (
        <ListView
          tasks={visibleTasks}
          filtersActive={filtersActive}
          onOpenTask={handleOpenTask}
        />
      )}

      {boardView === 'calendar' && (
        <CalendarView
          tasks={visibleTasks}
          filtersActive={filtersActive}
          onOpenTask={handleOpenTask}
        />
      )}

      {boardView === 'timeline' && (
        <TimelineView
          tasks={visibleTasks}
          filtersActive={filtersActive}
          onOpenTask={handleOpenTask}
        />
      )}

      <TaskModal
        taskId={modalTaskId}
        onClose={() => setModalTaskId(null)}
      />
    </>
  )
}