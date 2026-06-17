import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ColumnId, Task } from './types'

const STORAGE_KEY = 'glassflow-kanban'

interface KanbanState {
  tasks: Task[]
}

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Task[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persistTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
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
      persistTasks(state.tasks)
    },
    updateTask(state, action: PayloadAction<Partial<Task> & { id: string }>) {
      const index = state.tasks.findIndex((t) => t.id === action.payload.id)
      if (index === -1) return
      state.tasks[index] = {
        ...state.tasks[index],
        ...action.payload,
        updatedAt: new Date().toISOString(),
      }
      persistTasks(state.tasks)
    },
    deleteTask(state, action: PayloadAction<string>) {
      state.tasks = state.tasks.filter((t) => t.id !== action.payload)
      persistTasks(state.tasks)
    },
    moveTask(
      state,
      action: PayloadAction<{ id: string; columnId: ColumnId }>,
    ) {
      const task = state.tasks.find((t) => t.id === action.payload.id)
      if (!task) return
      task.columnId = action.payload.columnId
      task.updatedAt = new Date().toISOString()
      persistTasks(state.tasks)
    },
  },
})

export const { addTask, updateTask, deleteTask, moveTask } = kanbanSlice.actions
export default kanbanSlice.reducer