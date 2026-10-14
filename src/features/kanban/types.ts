export type ColumnId = 'todo' | 'in-progress' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface Task {
  id: string
  title: string
  description?: string
  columnId: ColumnId
  priority: TaskPriority
  dueDate?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: ColumnId
  title: string
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To do' },
  { id: 'in-progress', title: 'In progress' },
  { id: 'done', title: 'Done' },
]
