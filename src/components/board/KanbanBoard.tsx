import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { moveAndReorder } from '../../features/kanban/kanbanSlice'
import { DEFAULT_COLUMNS } from '../../features/kanban/types'
import { getColumnTasks, isColumnId } from '../../features/kanban/utils'
import { Column } from '../column/Column'
import { TaskCard } from '../task/TaskCard'

export function KanbanBoard() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((state) => state.kanban.tasks)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId)
    : undefined

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)
    if (!over) return

    const activeTaskId = active.id as string
    const overId = over.id as string
    const dragged = tasks.find((t) => t.id === activeTaskId)
    if (!dragged) return

    let toColumnId = dragged.columnId
    let toIndex = 0

    if (isColumnId(overId)) {
      toColumnId = overId
      toIndex = getColumnTasks(tasks, overId).length
    } else {
      const overTask = tasks.find((t) => t.id === overId)
      if (!overTask) return
      toColumnId = overTask.columnId
      toIndex = getColumnTasks(tasks, toColumnId).findIndex(
        (t) => t.id === overId,
      )
    }

    const fromColumnId = dragged.columnId
    const fromIndex = getColumnTasks(tasks, fromColumnId).findIndex(
      (t) => t.id === activeTaskId,
    )

    if (fromColumnId === toColumnId && fromIndex === toIndex) return
    if (fromColumnId === toColumnId && fromIndex < toIndex) {
      toIndex -= 1
    }

    dispatch(moveAndReorder({ taskId: activeTaskId, toColumnId, toIndex }))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {DEFAULT_COLUMNS.map((column) => (
          <Column
            key={column.id}
            column={column}
            tasks={getColumnTasks(tasks, column.id)}
          />
        ))}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'ease' }}>
        {activeTask ? (
          <TaskCard task={activeTask} isDragging />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}