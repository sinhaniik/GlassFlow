import { memo, type KeyboardEvent, type MouseEvent as ReactMouseEvent } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useAppDispatch } from '../../app/hooks'
import { moveAndReorder } from '../../features/kanban/kanbanSlice'
import type { Task } from '../../features/kanban/types'
import { DEFAULT_COLUMNS } from '../../features/kanban/types'
import { getDueDateInfo } from '../../features/kanban/utils'

interface TaskCardProps {
  task: Task
  isOverlay?: boolean
  onEdit: (task: Task) => void
}

const TaskCardContent = memo(function TaskCardContent({ task }: Pick<TaskCardProps, 'task'>) {
  const due = task.dueDate ? getDueDateInfo(task.dueDate) : null
  const priorityLabel = task.priority[0].toUpperCase() + task.priority.slice(1)
  return (
    <>
      <span className="task-title">{task.title}</span>
      <span className="task-meta">
        <span className={`priority-label priority-${task.priority}`}>
          <span className="priority-dot" aria-hidden="true" />
          {priorityLabel}
        </span>
        {due
          ? <time
              className={`due-date due-date-${due.status}`}
              dateTime={task.dueDate}
              title={due.fullDate}
              aria-label={`${due.label}, ${due.fullDate}`}
            >{due.label}</time>
          : <span className="due-date due-date-missing">Deadline needed</span>}
      </span>
    </>
  )
})

export const TaskCard = memo(function TaskCard({ task, isOverlay = false, onEdit }: TaskCardProps) {
  if (isOverlay) {
    return <TaskCardOverlay task={task} />
  }
  return <SortableTaskCard task={task} onEdit={onEdit} />
})

function TaskCardOverlay({ task }: Pick<TaskCardProps, 'task'>) {
  return (
    <article
      className="task-card task-card-overlay"
    >
      <div className="task-open"><TaskCardContent task={task} /></div>
    </article>
  )
}

function SortableTaskCard({ task, onEdit }: TaskCardProps) {
  const dispatch = useAppDispatch()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, isDragging } = useSortable({
    id: task.id,
  })

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (!event.altKey || !event.key.startsWith('Arrow')) return
    const currentColumn = DEFAULT_COLUMNS.findIndex(({ id }) => id === task.columnId)
    const nextColumn = event.key === 'ArrowRight' ? currentColumn + 1 :
      event.key === 'ArrowLeft' ? currentColumn - 1 : currentColumn
    if (nextColumn !== currentColumn) {
      event.preventDefault()
      const column = DEFAULT_COLUMNS[nextColumn]
      if (!column) return
      dispatch(moveAndReorder({
        taskId: task.id,
        toColumnId: column.id,
        toIndex: Number.MAX_SAFE_INTEGER,
      }))
      requestAnimationFrame(() => {
        document.querySelector<HTMLButtonElement>(`[data-task-id="${task.id}"] .drag-handle`)?.focus()
      })
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      dispatch(moveAndReorder({
        taskId: task.id,
        toColumnId: task.columnId,
        toIndex: task.order + (event.key === 'ArrowUp' ? -1 : 1),
      }))
    }
  }

  function handleMouseDown(event: ReactMouseEvent<HTMLElement>) {
    if (event.altKey || event.shiftKey) return
    listeners?.onMouseDown?.(event)
  }

  function navigateCards(event: KeyboardEvent<HTMLButtonElement>) {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
    const currentColumn = event.currentTarget.closest<HTMLElement>('.board-column')
    const columns = Array.from(document.querySelectorAll<HTMLElement>('.board-grid > .board-column'))
    if (!currentColumn) return
    const targetIndex = Array.from(currentColumn.querySelectorAll<HTMLButtonElement>('.task-open')).indexOf(event.currentTarget)
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const cards = Array.from(currentColumn.querySelectorAll<HTMLButtonElement>('.task-open'))
      const next = cards[targetIndex + (event.key === 'ArrowUp' ? -1 : 1)]
      if (next) { event.preventDefault(); next.focus() }
      return
    }
    const nextColumn = columns[columns.indexOf(currentColumn) + (event.key === 'ArrowLeft' ? -1 : 1)]
    if (!nextColumn) return
    const cards = Array.from(nextColumn.querySelectorAll<HTMLButtonElement>('.task-open'))
    if (!cards.length) return
    event.preventDefault()
    cards[Math.min(targetIndex, cards.length - 1)]?.focus()
  }

  return (
    <article
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform) }}
      data-task-id={task.id}
      className={`task-card${task.columnId === 'done' ? ' task-card-done' : ''}${isDragging ? ' task-card-dragging' : ''}`}
      onMouseDown={handleMouseDown}
      onTouchStart={(event) => listeners?.onTouchStart?.(event)}
    >
      <button
        type="button"
        className="task-open"
        onKeyDown={navigateCards}
        onClick={(event) => { if (!event.shiftKey && !event.altKey) onEdit(task) }}
        aria-label={`Edit ${task.title}. Drag anywhere to move; hold Shift to select text.`}
      >
        <TaskCardContent task={task} />
      </button>
      <button
        ref={setActivatorNodeRef}
        type="button"
        className="drag-handle"
        {...attributes}
        aria-label={`Move ${task.title}. Use Space and arrow keys to move, or Option plus arrow keys to reorder or change column.`}
        onKeyDown={(event) => {
          handleKeyDown(event)
          if (!event.defaultPrevented) listeners?.onKeyDown?.(event)
        }}
      >
        <svg viewBox="0 0 12 20" aria-hidden="true"><circle cx="4" cy="5" r="1" /><circle cx="8" cy="5" r="1" /><circle cx="4" cy="10" r="1" /><circle cx="8" cy="10" r="1" /><circle cx="4" cy="15" r="1" /><circle cx="8" cy="15" r="1" /></svg>
      </button>
    </article>
  )
}
