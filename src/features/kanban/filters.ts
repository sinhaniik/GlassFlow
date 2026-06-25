import type { Task } from './types'
import { getDueDateInfo } from './utils'

export interface BoardFilters {
  query: string
  priorityHigh: boolean
  dueToday: boolean
  completed: boolean
  labelFeatures: boolean
}

export const DEFAULT_BOARD_FILTERS: BoardFilters = {
  query: '',
  priorityHigh: false,
  dueToday: false,
  completed: false,
  labelFeatures: false,
}

export type ToggleBoardFilters = Omit<BoardFilters, 'query'>

export const DEFAULT_TOGGLE_FILTERS: ToggleBoardFilters = {
  priorityHigh: false,
  dueToday: false,
  completed: false,
  labelFeatures: false,
}

export function hasActiveToggleFilters(filters: BoardFilters): boolean {
  return (
    filters.priorityHigh ||
    filters.dueToday ||
    filters.completed ||
    filters.labelFeatures
  )
}

export function hasActiveFilters(filters: BoardFilters): boolean {
  return filters.query.trim().length > 0 || hasActiveToggleFilters(filters)
}

export function matchesTaskFilters(task: Task, filters: BoardFilters): boolean {
  const query = filters.query.trim().toLowerCase()
  if (query) {
    const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase()
    if (!haystack.includes(query)) return false
  }

  if (filters.priorityHigh && (task.priority ?? 'low') !== 'high') {
    return false
  }

  if (filters.dueToday) {
    if (!task.dueDate) return false
    const { status } = getDueDateInfo(task.dueDate)
    if (status !== 'today') return false
  }

  if (filters.completed && task.columnId !== 'done') {
    return false
  }

  if (filters.labelFeatures) {
    const haystack = `${task.title} ${task.description ?? ''}`.toLowerCase()
    if (!haystack.includes('feature')) return false
  }

  return true
}

export function filterTasks(tasks: Task[], filters: BoardFilters): Task[] {
  if (!hasActiveFilters(filters)) return tasks
  return tasks.filter((task) => matchesTaskFilters(task, filters))
}