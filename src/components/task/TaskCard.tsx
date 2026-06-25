import { useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../../app/hooks'
import { updateTask } from '../../features/kanban/kanbanSlice'
import type { Task } from '../../features/kanban/types'
import { KanbanTaskCard } from './KanbanTaskCard'

const DRAG_THRESHOLD = 6

interface TaskCardProps {
  task: Task
  isDragging?: boolean
  isOverlay?: boolean
  isSelected?: boolean
  dropBefore?: boolean
  isInlineEditing?: boolean
  onOpenModal: () => void
  onSelectTask?: () => void
  onStartInlineEdit: () => void
  onEndInlineEdit: () => void
  onPointerDragStart?: (
    taskId: string,
    element: HTMLDivElement,
    pointerId: number,
    clientX: number,
    clientY: number,
  ) => void
}

export function TaskCard({
  task,
  isDragging = false,
  isOverlay = false,
  isSelected = false,
  dropBefore = false,
  isInlineEditing = false,
  onOpenModal,
  onSelectTask,
  onStartInlineEdit,
  onEndInlineEdit,
  onPointerDragStart,
}: TaskCardProps) {
  const dispatch = useAppDispatch()
  const [editTitle, setEditTitle] = useState(task.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const didDragRef = useRef(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (isInlineEditing) {
      setEditTitle(task.title)
      requestAnimationFrame(() => inputRef.current?.select())
    }
  }, [isInlineEditing, task.title])

  useEffect(() => {
    if (isDragging) didDragRef.current = true
  }, [isDragging])

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

  function handleToggleSubtask(subtaskId: string) {
    const subtasks = task.subtasks ?? []
    if (subtasks.length === 0) return
    dispatch(
      updateTask({
        id: task.id,
        subtasks: subtasks.map((item) =>
          item.id === subtaskId ? { ...item, done: !item.done } : item,
        ),
      }),
    )
  }

  function handleClick() {
    if (isInlineEditing || isOverlay) return
    if (didDragRef.current) {
      didDragRef.current = false
      return
    }
    onSelectTask?.()
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current)
    clickTimerRef.current = setTimeout(() => onOpenModal(), 220)
  }

  function handleDoubleClick(event: React.MouseEvent) {
    event.stopPropagation()
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current)
      clickTimerRef.current = null
    }
    onStartInlineEdit()
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (isInlineEditing || isOverlay || !onPointerDragStart) return
    if (event.button !== 0) return

    pointerStartRef.current = { x: event.clientX, y: event.clientY }
    didDragRef.current = false

    function handlePointerMove(moveEvent: PointerEvent) {
      const start = pointerStartRef.current
      if (!start || didDragRef.current) return

      const moved = Math.hypot(
        moveEvent.clientX - start.x,
        moveEvent.clientY - start.y,
      )
      if (moved < DRAG_THRESHOLD) return

      didDragRef.current = true
      const element = cardRef.current
      if (element) {
        onPointerDragStart?.(
          task.id,
          element,
          moveEvent.pointerId,
          moveEvent.clientX,
          moveEvent.clientY,
        )
      }
      cleanup()
    }

    function cleanup() {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      pointerStartRef.current = null
    }

    function handlePointerUp() {
      cleanup()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
  }

  return (
    <div
      ref={cardRef}
      data-task-id={isOverlay ? undefined : task.id}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      className={[
        'task-card',
        dropBefore && !isOverlay && 'task-card--drop-before',
        isSelected && !isOverlay && 'task-card--selected',
        isDragging && 'task-card--dragging-touch',
        isOverlay
          ? 'drag-overlay-card drag-overlay-card--active cursor-grabbing'
          : isInlineEditing
            ? 'cursor-text'
            : 'task-card-enter cursor-grab active:cursor-grabbing',
        !isOverlay && 'transition duration-200',
        isDragging && !isOverlay
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
        onToggleSubtask={handleToggleSubtask}
      />
    </div>
  )
}