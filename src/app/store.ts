import { configureStore } from '@reduxjs/toolkit'
import kanbanReducer from '../features/kanban/kanbanSlice'
import themeReducer from '../features/theme/themeSlice'

export const store = configureStore({
  reducer: {
    kanban: kanbanReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch