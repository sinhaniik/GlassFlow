import { useCallback, useMemo, useRef, useState } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { moveAndReorder } from '../../features/kanban/kanbanSlice'
import { DEFAULT_COLUMNS } from '../../features/kanban/types'
import type { ColumnId, Task } from '../../features/kanban/types'
import { getColumnTasks, getInsertIndex, isColumnId } from '../../features/kanban/utils'
import { Column } from '../column/Column'
import { TaskCard } from '../task/TaskCard'

interface KanbanBoardProps {
  onCreateTask: (columnId?: ColumnId) => void
  onEditTask: (task: Task) => void
  query: string
}

interface DropPosition {
  columnId: ColumnId
  index: number
  top: number
  beforeTaskId: string | null
  afterTaskId: string | null
}

function getPointerY(activatorEvent: Event, deltaY: number): number | null {
  if ('clientY' in activatorEvent && typeof activatorEvent.clientY === 'number') {
    return activatorEvent.clientY + deltaY
  }
  if ('touches' in activatorEvent) {
    const touchEvent = activatorEvent as TouchEvent
    const touch = touchEvent.touches[0] ?? touchEvent.changedTouches[0]
    return touch ? touch.clientY + deltaY : null
  }
  return null
}

export function KanbanBoard({ onCreateTask, onEditTask, query }: KanbanBoardProps) {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((state) => state.kanban.tasks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dropPosition, setDropPosition] = useState<DropPosition | null>(null)
  const overIdRef = useRef<string | null>(null)
  const pointerYRef = useRef<number | null>(null)
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const columns = useMemo(
    () => {
      const normalizedQuery = query.trim().toLocaleLowerCase()
      return DEFAULT_COLUMNS.map((column) => ({
        ...column,
        tasks: getColumnTasks(tasks, column.id).filter((task) =>
          !normalizedQuery || `${task.title} ${task.description ?? ''}`.toLocaleLowerCase().includes(normalizedQuery),
        ),
      }))
    },
    [tasks, query],
  )
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks])
  const activeTask = activeId ? taskById.get(activeId) : undefined

  const collisionDetection = useCallback<CollisionDetection>((args) => {
    const pointerHits = pointerWithin(args)
    if (pointerHits.length === 0) return closestCenter(args)
    const taskHits = pointerHits.filter(({ id }) => taskById.has(String(id)))
    return taskHits.length ? taskHits : pointerHits
  }, [taskById])

  const measureDropPosition = useCallback((columnId: ColumnId, draggedId: string, pointerY: number) => {
    const columnElement = document.querySelector<HTMLElement>(`.board-column[data-column-id="${columnId}"]`)
    const listElement = columnElement?.querySelector<HTMLElement>('.column-tasks')
    if (!listElement) return null
    const listRect = listElement.getBoundingClientRect()
    const cards = Array.from(listElement.querySelectorAll<HTMLElement>('.task-card[data-task-id]'))
      .filter((card) => card.dataset.taskId !== draggedId)
      .map((card) => ({ id: card.dataset.taskId ?? '', rect: card.getBoundingClientRect() }))
      .sort((a, b) => a.rect.top - b.rect.top)
    const cardRects = cards.map(({ rect }) => rect)
    const index = getInsertIndex(pointerY, cardRects)
    const top = cardRects.length === 0
      ? 12
      : index < cardRects.length
        ? cardRects[index].top - listRect.top
        : cardRects[cardRects.length - 1].bottom - listRect.top + 6
    return {
      columnId,
      index,
      top,
      beforeTaskId: cards[index]?.id ?? null,
      afterTaskId: index === cards.length ? cards.at(-1)?.id ?? null : null,
    }
  }, [])

  const updateDropPosition = useCallback((next: DropPosition | null) => {
    setDropPosition((current) => {
      if (current && next && current.columnId === next.columnId && current.index === next.index &&
          Math.abs(current.top - next.top) < 1) return current
      return next
    })
  }, [])

  const finishDrag = useCallback(({ active, over, activatorEvent, delta }: DragEndEvent) => {
    setActiveId(null)
    overIdRef.current = null
    if (!over) { updateDropPosition(null); return }
    const task = taskById.get(String(active.id))
    if (!task) { updateDropPosition(null); return }
    const targetTask = taskById.get(String(over.id))
    const targetColumn = targetTask?.columnId ??
      (isColumnId(over.id) ? over.id : task.columnId)
    const allTasks = Array.from(taskById.values())
    const destination = getColumnTasks(allTasks, targetColumn).filter(({ id }) => id !== task.id)
    const pointerY = getPointerY(activatorEvent, delta.y)
    const measured = pointerY === null ? null : measureDropPosition(targetColumn, task.id, pointerY)
    let targetIndex = destination.length
    if (measured) {
      if (measured.beforeTaskId) {
        targetIndex = Math.max(0, destination.findIndex(({ id }) => id === measured.beforeTaskId))
      } else if (measured.afterTaskId) {
        targetIndex = destination.findIndex(({ id }) => id === measured.afterTaskId) + 1
      }
    } else if (targetTask) {
      targetIndex = destination.findIndex(({ id }) => id === targetTask.id)
      if (task.columnId === targetColumn && getColumnTasks(allTasks, task.columnId).findIndex(({ id }) => id === task.id) < targetIndex) {
        targetIndex += 1
      }
    } else if (targetColumn !== task.columnId) {
      targetIndex = 0
    }
    updateDropPosition(null)
    dispatch(moveAndReorder({
      taskId: task.id,
      toColumnId: targetColumn,
      toIndex: targetIndex,
    }))
  }, [dispatch, measureDropPosition, taskById, updateDropPosition])

  const trackOver = useCallback(({ over }: DragOverEvent) => {
    const nextId = over ? String(over.id) : null
    overIdRef.current = nextId
    if (!nextId || pointerYRef.current === null) { updateDropPosition(null); return }
    const task = taskById.get(nextId)
    const columnId = task?.columnId ?? (isColumnId(nextId) ? nextId : null)
    updateDropPosition(columnId ? measureDropPosition(columnId, activeId ?? '', pointerYRef.current) : null)
  }, [activeId, measureDropPosition, taskById, updateDropPosition])

  const trackDragMove = useCallback(({ delta, activatorEvent }: DragMoveEvent) => {
    const pointerY = getPointerY(activatorEvent, delta.y)
    pointerYRef.current = pointerY
    const currentOverId = overIdRef.current
    const task = currentOverId ? taskById.get(currentOverId) : undefined
    const columnId = task?.columnId ?? (currentOverId && isColumnId(currentOverId) ? currentOverId : null)
    updateDropPosition(pointerY === null || !columnId || !activeId
      ? null
      : measureDropPosition(columnId, activeId, pointerY))
  }, [activeId, measureDropPosition, taskById, updateDropPosition])

  const startDrag = useCallback(({ active }: { active: { id: string | number } }) => {
    setActiveId(String(active.id))
    overIdRef.current = null
    pointerYRef.current = null
    updateDropPosition(null)
    if (navigator.vibrate) navigator.vibrate(10)
  }, [updateDropPosition])

  const cancelDrag = useCallback(() => {
    setActiveId(null)
    overIdRef.current = null
    pointerYRef.current = null
    updateDropPosition(null)
  }, [updateDropPosition])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={startDrag}
      onDragOver={trackOver}
      onDragMove={trackDragMove}
      onDragCancel={cancelDrag}
      onDragEnd={finishDrag}
    >
      <div id="board" className="board-grid" aria-label="Kanban board">
        {columns.map(({ tasks: columnTasks, ...column }) => (
          <Column
            key={column.id}
            column={column}
            tasks={columnTasks}
            dropPosition={dropPosition?.columnId === column.id ? dropPosition : null}
            onCreateTask={onCreateTask}
            onEditTask={onEditTask}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} isOverlay onEdit={onEditTask} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
