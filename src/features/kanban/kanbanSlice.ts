import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ColumnId, Task } from './types'
import { getColumnTasks } from './utils'

const STORAGE_KEY = 'glassflow-kanban'

interface KanbanState {
  tasks: Task[]
}

function normalizeTasks(tasks: Task[]): Task[] {
  const columns: ColumnId[] = ['todo', 'in-progress', 'done']
  return columns.flatMap((columnId) =>
    getColumnTasks(
      tasks.map((t, i) => ({ ...t, order: t.order ?? i })),
      columnId,
    ).map((task, index) => ({ ...task, order: index })),
  )
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Task[]
    if (!Array.isArray(parsed)) return []
    return normalizeTasks(parsed)
  } catch {
    return []
  }
}

function persistTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

function reindexColumn(tasks: Task[], columnId: ColumnId) {
  getColumnTasks(tasks, columnId).forEach((task, index) => {
    const match = tasks.find((t) => t.id === task.id)
    if (match) match.order = index
  })
}

const initialState: KanbanState = {
  tasks: loadTasks(),
}

const kanbanSlice = createSlice({
  name: 'kanban',
  initialState,
  reducers: {
    addTask(state, action: PayloadAction<Task>) {
      state.tasks.push(action.payload)
      reindexColumn(state.tasks, action.payload.columnId)
      persistTasks(state.tasks)
    },
    updateTask(state, action: PayloadAction<Partial<Task> & { id: string }>) {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (index === -1) return
      const { id: _, createdAt: __, ...updates } = action.payload
      state.tasks[index] = {
        ...state.tasks[index],
        ...updates,
        createdAt: state.tasks[index].createdAt,
        updatedAt: new Date().toISOString(),
      }
      persistTasks(state.tasks)
    },
    deleteTask(state, action: PayloadAction<string>) {
      const task = state.tasks.find((t) => t.id === action.payload)
      if (!task) return
      const columnId = task.columnId
      state.tasks = state.tasks.filter((t) => t.id !== action.payload)
      reindexColumn(state.tasks, columnId)
      persistTasks(state.tasks)
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
      const task = state.tasks.find((t) => t.id === taskId)
      if (!task) return

      const fromColumnId = task.columnId
      task.columnId = toColumnId
      task.updatedAt = new Date().toISOString()

      if (fromColumnId !== toColumnId) {
        reindexColumn(state.tasks, fromColumnId)
      }

      const targetTasks = getColumnTasks(state.tasks, toColumnId).filter(
        (t) => t.id !== taskId,
      )
      const clampedIndex = Math.max(0, Math.min(toIndex, targetTasks.length))
      targetTasks.splice(clampedIndex, 0, task)
      targetTasks.forEach((t, index) => {
        const match = state.tasks.find((x) => x.id === t.id)
        if (match) match.order = index
      })

      persistTasks(state.tasks)
    },
  },
})

export const { addTask, updateTask, deleteTask, moveAndReorder } =
  kanbanSlice.actions
export default kanbanSlice.reducer