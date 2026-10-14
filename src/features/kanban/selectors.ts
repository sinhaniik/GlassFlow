import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

const selectTasks = (state: RootState) => state.kanban.tasks

export const selectTaskCounts = createSelector([selectTasks], (tasks) => {
  const counts = { todo: 0, 'in-progress': 0, done: 0 }
  tasks.forEach((task) => { counts[task.columnId] += 1 })
  return { ...counts, total: tasks.length }
})
