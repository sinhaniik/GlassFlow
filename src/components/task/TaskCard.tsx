import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { updateTask } from '../../features/kanban/kanbanSlice'
import type { Task } from '../../features/kanban/types'
import { accentClass } from '../../features/kanban/utils'
import { DueDateBadge } from '../ui/DueDateBadge'
import { TaskDateNotch } from './TaskDateNotch'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  isOverlay?: boolean
  isInlineEditing?: boolean
  onOpenModal: () => void
  onStartInlineEdit: () => void
  onEndInlineEdit: () => void
}

export function TaskCard({
  task,
  isDragging = false,
  isOverlay = false,
  isInlineEditing = false,
  onOpenModal,
  onStartInlineEdit,
  onEndInlineEdit,
}: TaskCardProps) {
  const dispatch = useAppDispatch()
  const [editTitle, setEditTitle] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id, disabled: isInlineEditing || isOverlay })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isOverlay ? undefined : transition,
  }

  const dragging = isDragging || isSortableDragging

  useEffect(() => {
    if (isInlineEditing) {
      setEditTitle(task.title)
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [isInlineEditing, task.title])

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    }
  }, [])

  function saveInlineEdit() {
    const trimmed = editTitle.trim()
    if (trimmed && trimmed !== task.title) {
      dispatch(updateTask({ id: task.id, title: trimmed }))
    }
    onEndInlineEdit()
  }

  function handleClick() {
    if (isInlineEditing || isOverlay) return
    clickTimerRef.current = setTimeout(() => onOpenModal(), 220)
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation()
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
    onStartInlineEdit()
  }

  return (
    <div
      ref={isOverlay ? undefined : setNodeRef}
      style={style}
      {...(isOverlay || isInlineEditing ? {} : attributes)}
      {...(isOverlay || isInlineEditing ? {} : listeners)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={[
        'task-row',
        isOverlay
          ? 'drag-overlay-card cursor-grabbing'
          : isInlineEditing
            ? 'cursor-text'
            : 'task-card-enter cursor-grab active:cursor-grabbing',
        !isOverlay && 'transition duration-200',
        dragging && !isOverlay
          ? 'task-card-dragging'
          : !isOverlay && 'hover:scale-[1.01]',
      ].join(' ')}
    >
      <article
        className={[
          'task-card-body glass-card rounded-lg border-l-[3px] py-2 pl-3 pr-2',
          accentClass[task.accent],
          isInlineEditing && 'task-card-body--full',
        ].join(' ')}
      >
        {isInlineEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={saveInlineEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveInlineEdit()
              if (e.key === 'Escape') {
                setEditTitle(task.title)
                onEndInlineEdit()
              }
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="w-full bg-transparent text-xs font-medium text-text-primary outline-none"
          />
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-1.5">
              <p className="text-xs font-medium leading-snug text-text-primary">
                {task.title}
              </p>
              {task.dueDate && <DueDateBadge dueDate={task.dueDate} />}
            </div>
            {task.description && (
              <p className="mt-0.5 line-clamp-2 text-[10px] leading-tight text-text-secondary">
                {task.description}
              </p>
            )}
          </>
        )}
      </article>

      {!isInlineEditing && <TaskDateNotch createdAt={task.createdAt} />}
    </div>
  )
}