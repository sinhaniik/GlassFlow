export type ColumnId = 'todo' | 'in-progress' | 'done'

export type AccentColor = 'pink' | 'orange' | 'purple' | 'mint'

export type TaskPriority = 'high' | 'low'

export interface Task {
  id: string
  title: string
  description?: string
  columnId: ColumnId
  accent: AccentColor
  priority?: TaskPriority
  order: number
  createdAt: string
  updatedAt: string
  dueDate?: string
}

export interface ArchivedTask extends Task {
  archivedAt: string
}

export interface BackupData {
  version: 1
  exportedAt: string
  tasks: Task[]
  archive: ArchivedTask[]
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

export const ACCENT_COLORS: AccentColor[] = [
  'pink',
  'orange',
  'purple',
  'mint',
]

export const TASK_PRIORITIES: TaskPriority[] = ['high', 'low']