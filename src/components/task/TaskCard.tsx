import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { updateTask } from '../../features/kanban/kanbanSlice'
import type { Task } from '../../features/kanban/types'
import { accentClass } from '../../features/kanban/utils'

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  isInlineEditing?: boolean
  onOpenModal: () => void
  onStartInlineEdit: () => void
  onEndInlineEdit: () => void
}

export function TaskCard({
  task,
  isDragging = false,
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
  } = useSortable({ id: task.id, disabled: isInlineEditing })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
    if (isInlineEditing) return
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
    <article
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(isInlineEditing ? {} : listeners)}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={[
        'glass-subtle group rounded-xl border-l-4 px-4 py-3',
        'transition duration-200',
        accentClass[task.accent],
        isInlineEditing ? 'cursor-text' : 'cursor-grab active:cursor-grabbing',
        dragging ? 'task-card-dragging scale-[1.02] shadow-lg' : 'hover:scale-[1.01]',
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
          className="w-full bg-transparent text-sm font-medium text-text-primary outline-none"
        />
      ) : (
        <>
          <p className="text-sm font-medium leading-snug text-text-primary">
            {task.title}
          </p>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
              {task.description}
            </p>
          )}
        </>
      )}
    </article>
  )
}