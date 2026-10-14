import { lazy, Suspense, useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { addTask, deleteTask, moveAndReorder, restoreTask, updateTask } from '../../features/kanban/kanbanSlice'
import type { ColumnId, Task } from '../../features/kanban/types'
import { createTask, getColumnTasks } from '../../features/kanban/utils'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import { AppHeader } from '../layout/AppHeader'
import { UndoToast } from '../ui/UndoToast'
import { BoardSummary } from './BoardSummary'
import { KanbanBoard } from './KanbanBoard'

const TaskModal = lazy(() => import('../task/TaskModal').then(({ TaskModal: Component }) => ({ default: Component })))
const KeyboardHelp = lazy(() => import('../ui/KeyboardHelp').then(({ KeyboardHelp: Component }) => ({ default: Component })))

export function BoardWorkspace() {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((state) => state.kanban.tasks)
  const [editor, setEditor] = useState<{ task: Task; isNew: boolean } | null>(null)
  const [deletedTask, setDeletedTask] = useState<Task | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

  useEffect(() => {
    if (!deletedTask) return
    const timeout = window.setTimeout(() => setDeletedTask(null), 5000)
    return () => window.clearTimeout(timeout)
  }, [deletedTask])

  const createInColumn = useCallback((columnId: ColumnId = 'todo') => {
    setEditor({
      task: createTask('', columnId, getColumnTasks(tasks, columnId).length),
      isNew: true,
    })
  }, [tasks])
  const editTask = useCallback((task: Task) => {
    setEditor({ task, isNew: false })
  }, [])
  const openSearch = useCallback(() => setSearchOpen(true), [])
  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setQuery('')
  }, [])
  const openHelp = useCallback(() => setHelpOpen(true), [])

  function saveTask(task: Task) {
    if (editor?.isNew) dispatch(addTask(task))
    else dispatch(updateTask(task))
    setEditor(null)
  }

  function removeTask(task: Task) {
    dispatch(deleteTask(task.id))
    setDeletedTask(task)
    setEditor(null)
  }

  function undoDelete() {
    if (!deletedTask) return
    dispatch(restoreTask(deletedTask))
    setDeletedTask(null)
  }

  function moveTask(columnId: ColumnId) {
    if (!editor || editor.isNew) return
    dispatch(moveAndReorder({
      taskId: editor.task.id,
      toColumnId: columnId,
      toIndex: getColumnTasks(tasks, columnId).length,
    }))
    setEditor(null)
  }

  useKeyboardShortcuts({ onNewTask: createInColumn, onSearch: openSearch, onShowHelp: openHelp })

  return (
    <div className="app-shell">
      <AppHeader
        onCreateTask={createInColumn}
        onSearch={openSearch}
        searchOpen={searchOpen}
        query={query}
        onQueryChange={setQuery}
        onCloseSearch={closeSearch}
      />
      <BoardSummary />
      <KanbanBoard
        onCreateTask={createInColumn}
        onEditTask={editTask}
        query={query}
      />
      <Suspense fallback={null}>
        {editor && (
          <TaskModal
            key={editor.task.id}
            task={editor.task}
            isNew={editor.isNew}
            onClose={() => setEditor(null)}
            onSave={saveTask}
            onMove={moveTask}
            onDelete={() => removeTask(editor.task)}
          />
        )}
      </Suspense>
      {deletedTask && <UndoToast key={deletedTask.id} onUndo={undoDelete} />}
      <Suspense fallback={null}>
        {helpOpen && <KeyboardHelp onClose={() => setHelpOpen(false)} />}
      </Suspense>
    </div>
  )
}
