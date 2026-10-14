import { configureStore } from '@reduxjs/toolkit'
import kanbanReducer, { kanbanStorageKey } from '../features/kanban/kanbanSlice.ts'

export const store = configureStore({
  reducer: {
    kanban: kanbanReducer,
  },
})

let previousTasks = store.getState().kanban.tasks
store.subscribe(() => {
  const tasks = store.getState().kanban.tasks
  if (tasks === previousTasks) return
  previousTasks = tasks
  try {
    localStorage.setItem(kanbanStorageKey, JSON.stringify(tasks))
  } catch {
    // Keep the in-memory board usable when storage is unavailable.
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
