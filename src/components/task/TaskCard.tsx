import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { updateTask } from '../../features/kanban/kanbanSlice'
import type { Task } from '../../features/kanban/types'
import { KanbanTaskCard } from './KanbanTaskCard'

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
  const didDragRef = useRef(false)

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
    if (isSortableDragging) didDragRef.current = true
  }, [isSortableDragging])

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
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
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
        'task-card',
        dragging && 'task-card--dragging-touch',
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
      <KanbanTaskCard
        task={task}
        isInlineEditing={isInlineEditing}
        editTitle={editTitle}
        inputRef={inputRef}
        onEditTitleChange={setEditTitle}
        onSaveInlineEdit={saveInlineEdit}
        onCancelInlineEdit={() => {
          setEditTitle(task.title)
          onEndInlineEdit()
        }}
      />
    </div>
  )
}