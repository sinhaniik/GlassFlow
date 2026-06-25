import { Fragment, useState, type FormEvent, type RefObject } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { addTask } from '../../features/kanban/kanbanSlice'
import type { Column as ColumnType, Task } from '../../features/kanban/types'
import { accentRing, createTask } from '../../features/kanban/utils'
import { DropPlaceholder } from '../ui/DropPlaceholder'
import { EmptyState } from '../ui/EmptyState'
import { TaskCard } from '../task/TaskCard'

function getPlaceholderIndex(
  columnId: string,
  tasks: Task[],
  overId: string | null,
  activeId: string | null,
): number | null {
  if (!activeId || !overId || overId === activeId) return null
  if (overId === columnId) return tasks.length
  const overIndex = tasks.findIndex((task) => task.id === overId)
  if (overIndex === -1) return null
  return overIndex
}

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
  inlineEditId: string | null
  activeId?: string | null
  overId?: string | null
  filtersActive?: boolean
  isDropTarget?: boolean
  inputRef?: RefObject<HTMLInputElement | null>
  onOpenModal: (taskId: string) => void
  onSelectTask: (taskId: string) => void
  selectedTaskId?: string | null
  onStartInlineEdit: (taskId: string) => void
  onEndInlineEdit: () => void
  onPointerDragStart?: (
    taskId: string,
    element: HTMLDivElement,
    pointerId: number,
    clientX: number,
    clientY: number,
  ) => void
}

export function Column({
  column,
  tasks,
  inlineEditId,
  activeId = null,
  overId = null,
  filtersActive = false,
  isDropTarget = false,
  inputRef,
  onOpenModal,
  onSelectTask,
  selectedTaskId = null,
  onStartInlineEdit,
  onEndInlineEdit,
  onPointerDragStart,
}: ColumnProps) {
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState('')

  const highlighted = isDropTarget
  const placeholderIndex = getPlaceholderIndex(
    column.id,
    tasks,
    overId,
    activeId,
  )
  const isDragging = activeId !== null
  const showEmptyPlaceholder = isDragging && tasks.length === 0
  const canAddTask = column.id === 'todo'

  function focusAddInput() {
    inputRef?.current?.focus()
    inputRef?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  const emptyState = filtersActive
    ? {
        title: 'No tasks match your filters',
        hint: 'Try clearing a filter or changing your search',
      }
    : canAddTask
      ? {
          title: '+ Create your first task',
          hint: 'Press N or add one below',
          actionLabel: '+ Create your first task',
          onAction: focusAddInput,
        }
      : {
          title: 'Drop a task here',
          hint: 'Drag a card from another column',
        }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = title.trim()
    if (!trimmed) return
    dispatch(
      addTask(createTask(trimmed, column.id, column.accent, tasks.length)),
    )
    setTitle('')
  }

  return (
    <section
      data-column-id={column.id}
      className={[
        'board-column flex flex-col overflow-visible rounded-xl p-3 transition duration-200 sm:rounded-2xl sm:p-4',
        `board-column--${column.id}`,
        highlighted
          ? `column-drop-active ring-2 ring-offset-2 ring-offset-bg-main ${accentRing[column.accent]}`
          : '',
        isDragging && 'board-column--drag-active',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <header className="mb-4 flex shrink-0 items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span
            className={[
              'h-2.5 w-2.5 rounded-full',
              column.accent === 'pink' && 'bg-accent-pink',
              column.accent === 'orange' && 'bg-accent-orange',
              column.accent === 'purple' && 'bg-accent-purple',
              column.accent === 'mint' && 'bg-accent-mint',
            ]
              .filter(Boolean)
              .join(' ')}
          />
          <h2 className="board-column__title">{column.title}</h2>
        </div>
        <span className="board-column__count">{tasks.length}</span>
      </header>

      <div
        className={[
          'board-column__tasks flex min-h-0 flex-1 flex-col gap-3 overflow-x-visible overflow-y-auto py-1',
          isDragging && 'board-column__tasks--active-drop',
          tasks.length === 0 && 'board-column__tasks--empty',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {showEmptyPlaceholder ? (
          <DropPlaceholder />
        ) : tasks.length === 0 ? (
          <EmptyState {...emptyState} />
        ) : (
          tasks.map((task, index) => (
            <Fragment key={task.id}>
              {placeholderIndex === index && <DropPlaceholder />}
              <TaskCard
                task={task}
                isSelected={selectedTaskId === task.id}
                isInlineEditing={inlineEditId === task.id}
                isDragging={activeId === task.id}
                onPointerDragStart={onPointerDragStart}
                onOpenModal={() => {
                  if (inlineEditId !== task.id) onOpenModal(task.id)
                }}
                onSelectTask={() => onSelectTask(task.id)}
                onStartInlineEdit={() => onStartInlineEdit(task.id)}
                onEndInlineEdit={onEndInlineEdit}
              />
            </Fragment>
          ))
        )}

        {activeId !== null &&
          placeholderIndex === tasks.length &&
          tasks.length > 0 && <DropPlaceholder />}
      </div>

      {canAddTask && (
        <form onSubmit={handleSubmit} className="mt-4 shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a task…"
            aria-label={`Add task to ${column.title}`}
            className="glass-input w-full rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition"
          />
        </form>
      )}
    </section>
  )
}