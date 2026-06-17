import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState, type FormEvent, type RefObject } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { addTask } from '../../features/kanban/kanbanSlice'
import type { Column as ColumnType, Task } from '../../features/kanban/types'
import { accentRing, createTask } from '../../features/kanban/utils'
import { EmptyState } from '../ui/EmptyState'
import { TaskCard } from '../task/TaskCard'

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
  inlineEditId: string | null
  isDropTarget?: boolean
  inputRef?: RefObject<HTMLInputElement | null>
  onOpenModal: (taskId: string) => void
  onStartInlineEdit: (taskId: string) => void
  onEndInlineEdit: () => void
}

export function Column({
  column,
  tasks,
  inlineEditId,
  isDropTarget = false,
  inputRef,
  onOpenModal,
  onStartInlineEdit,
  onEndInlineEdit,
}: ColumnProps) {
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState('')
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const taskIds = tasks.map((t) => t.id)
  const highlighted = isOver || isDropTarget

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
      className={[
        'board-column glass-header flex flex-col overflow-visible rounded-2xl p-4 transition duration-200',
        highlighted
          ? `column-drop-active ring-2 ring-offset-2 ring-offset-bg-main ${accentRing[column.accent]}`
          : '',
      ].join(' ')}
    >
      <header className="mb-4 flex shrink-0 items-center justify-between">
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
          <h2 className="text-sm font-semibold text-text-primary">
            {column.title}
          </h2>
        </div>
        <span className="glass-card rounded-full px-2.5 py-0.5 text-xs font-medium text-text-secondary">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className="flex min-h-0 flex-1 flex-col gap-4 overflow-x-visible overflow-y-auto py-1"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <EmptyState label="Drop tasks here or add one below" />
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                isInlineEditing={inlineEditId === task.id}
                onOpenModal={() => {
                  if (inlineEditId !== task.id) onOpenModal(task.id)
                }}
                onStartInlineEdit={() => onStartInlineEdit(task.id)}
                onEndInlineEdit={onEndInlineEdit}
              />
            ))
          )}
        </SortableContext>
      </div>

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
    </section>
  )
}