import type { Task } from '../../features/kanban/types'
import { DEFAULT_COLUMNS } from '../../features/kanban/types'
import { getColumnTasks } from '../../features/kanban/utils'
import { EmptyState } from '../ui/EmptyState'
import { ViewTaskRow } from './ViewTaskRow'

interface ListViewProps {
  tasks: Task[]
  filtersActive: boolean
  selectedTaskId?: string | null
  onOpenTask: (taskId: string) => void
  onSelectTask: (taskId: string) => void
  onCreateTask: () => void
}

export function ListView({
  tasks,
  filtersActive,
  selectedTaskId = null,
  onOpenTask,
  onSelectTask,
  onCreateTask,
}: ListViewProps) {
  const hasTasks = tasks.length > 0

  if (!hasTasks) {
    return (
      <div className="board-view-panel list-view">
        <EmptyState
          title={
            filtersActive
              ? 'No tasks match your filters'
              : '+ Create your first task'
          }
          hint={
            filtersActive
              ? 'Try clearing a filter or changing your search'
              : 'Press N to jump to the board and add a task'
          }
          actionLabel={filtersActive ? undefined : '+ Create your first task'}
          onAction={filtersActive ? undefined : onCreateTask}
        />
      </div>
    )
  }

  return (
    <div className="board-view-panel list-view">
      {DEFAULT_COLUMNS.map((column) => {
        const columnTasks = getColumnTasks(tasks, column.id)
        if (columnTasks.length === 0) return null

        return (
          <section
            key={column.id}
            className={[
              'list-view__section',
              `list-view__section--${column.id}`,
            ].join(' ')}
          >
            <header className="list-view__header">
              <span
                className={[
                  'list-view__dot',
                  column.accent === 'pink' && 'bg-accent-pink',
                  column.accent === 'orange' && 'bg-accent-orange',
                  column.accent === 'purple' && 'bg-accent-purple',
                  column.accent === 'mint' && 'bg-accent-mint',
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
              <h3 className="list-view__title">{column.title}</h3>
              <span className="list-view__count">{columnTasks.length}</span>
            </header>

            <div className="list-view__rows">
              {columnTasks.map((task) => (
                <ViewTaskRow
                  key={task.id}
                  task={task}
                  showStatus={false}
                  isSelected={selectedTaskId === task.id}
                  onOpen={() => {
                    onSelectTask(task.id)
                    onOpenTask(task.id)
                  }}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}