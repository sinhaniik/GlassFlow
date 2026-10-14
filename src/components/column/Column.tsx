import { memo, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Column as ColumnType, Task } from '../../features/kanban/types'
import { TaskCard } from '../task/TaskCard'

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
  dropPosition: { index: number; top: number } | null
  onCreateTask: (columnId: ColumnType['id']) => void
  onEditTask: (task: Task) => void
}

export const Column = memo(function Column({ column, tasks, dropPosition, onCreateTask, onEditTask }: ColumnProps) {
  const taskIds = useMemo(() => tasks.map(({ id }) => id), [tasks])
  const taskItems = tasks.map((task) => (
    <div
      key={task.id}
      className="task-slot"
    >
      <TaskCard task={task} onEdit={onEditTask} />
    </div>
  ))

  return (
    <DroppableColumn column={column} taskCount={tasks.length}>
      <header className="column-header">
        <div className="column-heading">
          <span className={`status-dot status-${column.id}`} aria-hidden="true" />
          <h2>{column.title}</h2>
          <span className="column-count" aria-label={`${tasks.length} tasks`}>{tasks.length}</span>
        </div>
        <button
          type="button"
          className="icon-button add-column-task"
          aria-label={`Add task to ${column.title}`}
          onClick={() => onCreateTask(column.id)}
        >
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" /></svg>
        </button>
      </header>
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="column-tasks">
          {tasks.length ? taskItems : (
              <p className="column-empty">
                <svg className="empty-icon" viewBox="0 0 28 28" aria-hidden="true"><path d="M14 7v14M7 14h14" /></svg>
                Nothing here yet. Add a task or drag one in.
              </p>
            )}
          {dropPosition && <div className="drop-indicator" style={{ top: dropPosition.top }} aria-hidden="true" />}
        </div>
      </SortableContext>
    </DroppableColumn>
  )
})

function DroppableColumn({ column, taskCount, children }: { column: ColumnType; taskCount: number; children: ReactNode }) {
  const { setNodeRef } = useDroppable({ id: column.id })
  return (
    <section
      ref={setNodeRef}
      data-column-id={column.id}
      className="board-column"
      aria-label={`${column.title}, ${taskCount} tasks`}
    >
      {children}
    </section>
  )
}
