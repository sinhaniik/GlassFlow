import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../../features/kanban/types'
import { accentClass } from '../../features/kanban/utils'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
}

export function TaskCard({ task, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dragging = isDragging || isSortableDragging

  return (
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={[
        'glass-subtle group cursor-grab rounded-xl border-l-4 px-4 py-3',
        'transition duration-200 active:cursor-grabbing',
        accentClass[task.accent],
        dragging ? 'task-card-dragging scale-[1.02] shadow-lg' : 'hover:scale-[1.01]',
      ].join(' ')}
    >
      <p className="text-sm font-medium leading-snug text-text-primary">
        {task.title}
      </p>
    </article>
  )
}