export type ColumnId = 'todo' | 'in-progress' | 'done'

export type AccentColor = 'pink' | 'orange' | 'purple' | 'mint'

export interface Task {
  id: string
  title: string
  description?: string
  columnId: ColumnId
  accent: AccentColor
  order: number
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: ColumnId
  title: string
  accent: AccentColor
}

export const DEFAULT_COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', accent: 'pink' },
  { id: 'in-progress', title: 'In Progress', accent: 'orange' },
  { id: 'done', title: 'Done', accent: 'mint' },
]