import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ColumnId, Task } from './types.ts'
import { getColumnTasks, isValidDateOnly, moveTask, normalizeTask } from './utils.ts'

const STORAGE_KEY = 'glassflow-kanban'

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const seenIds = new Set<string>()
    const tasks = parsed
      .map((task, index) => normalizeTask(task, index))
      .filter((task): task is Task => {
        if (!task || seenIds.has(task.id)) return false
        seenIds.add(task.id)
        return true
      })

    return (['todo', 'in-progress', 'done'] as const).flatMap((columnId) =>
      getColumnTasks(tasks, columnId).map((task, order) => ({ ...task, order })),
    )
  } catch {
    return []
  }
}

export const kanbanStorageKey = STORAGE_KEY

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState: { tasks: loadTasks() },
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
      if (!isValidDateOnly(action.payload.dueDate ?? '')) return
      state.tasks.push(action.payload)
      reindexColumn(state.tasks, action.payload.columnId)
    },
    updateTask(state, action: PayloadAction<Partial<Task> & { id: string }>) {
      const task = state.tasks.find(({ id }) => id === action.payload.id)
      if (!task) return
      const dueDate = action.payload.dueDate ?? task.dueDate
      if (!isValidDateOnly(dueDate ?? '')) return
      Object.assign(task, action.payload, {
        id: task.id,
        dueDate,
        updatedAt: new Date().toISOString(),
        createdAt: task.createdAt,
      })
    },
    deleteTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find(({ id }) => id === action.payload)
      if (!task) return
      const columnId = task.columnId
      state.tasks = state.tasks.filter(({ id }) => id !== action.payload)
      reindexColumn(state.tasks, columnId)
    },
    restoreTask(state, action: PayloadAction<Task>) {
      const task = action.payload
      if (state.tasks.some(({ id }) => id === task.id)) return
      state.tasks
        .filter((item) => item.columnId === task.columnId && item.order >= task.order)
        .forEach((item) => { item.order += 1 })
      state.tasks.push({ ...task })
      reindexColumn(state.tasks, task.columnId)
    },
    moveAndReorder(
      state,
      action: PayloadAction<{
        taskId: string
        toColumnId: ColumnId
        toIndex: number
      }>,
    ) {
      const { taskId, toColumnId, toIndex } = action.payload
      const reordered = moveTask(state.tasks, taskId, toColumnId, toIndex)
      if (reordered === state.tasks) return
      const moved = reordered.find(({ id }) => id === taskId)
      if (moved) moved.updatedAt = new Date().toISOString()
      state.tasks = reordered
    },
  },
})

function reindexColumn(tasks: Task[], columnId: ColumnId) {
  getColumnTasks(tasks, columnId).forEach((task, order) => {
    task.order = order
  })
}

export const { addTask, updateTask, deleteTask, restoreTask, moveAndReorder } =
  kanbanSlice.actions
export default kanbanSlice.reducer
