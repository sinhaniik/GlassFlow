import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState, type FormEvent } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { addTask } from '../../features/kanban/kanbanSlice'
import type { Column as ColumnType, Task } from '../../features/kanban/types'
import { accentRing, createTask } from '../../features/kanban/utils'
import { EmptyState } from '../ui/EmptyState'
import { TaskCard } from '../task/TaskCard'

interface ColumnProps {
  column: ColumnType
  tasks: Task[]
}

export function Column({ column, tasks }: ColumnProps) {
  const dispatch = useAppDispatch()
  const [title, setTitle] = useState('')
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  const taskIds = tasks.map((t) => t.id)

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
        'glass flex min-h-[420px] flex-col rounded-2xl p-4 transition duration-200',
        isOver ? `ring-2 ring-offset-2 ring-offset-bg-main ${accentRing[column.accent]}` : '',
      ].join(' ')}
    >
      <header className="mb-4 flex items-center justify-between">
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
        <span className="glass-subtle rounded-full px-2.5 py-0.5 text-xs font-medium text-text-secondary">
          {tasks.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className="flex flex-1 flex-col gap-3 overflow-y-auto"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <EmptyState label="Drop tasks here or add one below" />
          ) : (
            tasks.map((task) => <TaskCard key={task.id} task={task} />)
          )}
        </SortableContext>
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add a task…"
          className="glass-subtle w-full rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-secondary outline-none transition focus:ring-2 focus:ring-accent-purple/40"
        />
      </form>
    </section>
  )
}