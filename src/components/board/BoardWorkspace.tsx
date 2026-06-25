import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../../app/hooks'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import type { BoardFilters } from '../../features/kanban/filters'
import {
  filterTasks,
  hasActiveFilters,
} from '../../features/kanban/filters'
import { deleteTask, undo } from '../../features/kanban/kanbanSlice'
import type { BoardView } from '../../features/kanban/views'
import { saveBoardView } from '../../features/kanban/views'
import { BoardFiltersBar } from '../ui/BoardFilters'
import { BoardViewSwitcher } from '../ui/BoardViewSwitcher'
import { ConfirmDialog } from '../ui/ConfirmDialog'
import { TaskModal } from '../task/TaskModal'
import { CalendarView } from './CalendarView'
import { KanbanBoard } from './KanbanBoard'
import { ListView } from './ListView'
import { TimelineView } from './TimelineView'

interface BoardWorkspaceProps {
  boardFilters: BoardFilters
  onBoardFiltersChange: (filters: BoardFilters) => void
  boardView: BoardView
  onBoardViewChange: (view: BoardView) => void
}

export function BoardWorkspace({
  boardFilters,
  onBoardFiltersChange,
  boardView,
  onBoardViewChange,
}: BoardWorkspaceProps) {
  const dispatch = useAppDispatch()
  const tasks = useAppSelector((state) => state.kanban.tasks)
  const canUndo = useAppSelector((state) => state.kanban.past.length > 0)
  const [modalTaskId, setModalTaskId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [deleteConfirmTaskId, setDeleteConfirmTaskId] = useState<string | null>(
    null,
  )
  const [inlineEditId, setInlineEditId] = useState<string | null>(null)
  const newTaskInputRef = useRef<HTMLInputElement>(null)

  const visibleTasks = useMemo(
    () => filterTasks(tasks, boardFilters),
    [tasks, boardFilters],
  )
  const filtersActive = hasActiveFilters(boardFilters)

  const deleteTaskTarget = deleteConfirmTaskId
    ? tasks.find((task) => task.id === deleteConfirmTaskId)
    : undefined

  const focusNewTaskInput = useCallback(() => {
    if (boardView !== 'kanban') {
      onBoardViewChange('kanban')
      saveBoardView('kanban')
      requestAnimationFrame(() => {
        newTaskInputRef.current?.focus()
        newTaskInputRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        })
      })
      return
    }

    newTaskInputRef.current?.focus()
    newTaskInputRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [boardView, onBoardViewChange])

  const handleOpenTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
    setModalTaskId(taskId)
  }, [])

  const handleSelectTask = useCallback((taskId: string) => {
    setSelectedTaskId(taskId)
  }, [])

  const handleRequestDelete = useCallback(() => {
    const targetId = modalTaskId ?? selectedTaskId
    if (!targetId) return
    const task = tasks.find((item) => item.id === targetId)
    if (!task) return
    setDeleteConfirmTaskId(targetId)
  }, [modalTaskId, selectedTaskId, tasks])

  const handleConfirmDelete = useCallback(() => {
    if (!deleteConfirmTaskId) return
    dispatch(deleteTask(deleteConfirmTaskId))
    setDeleteConfirmTaskId(null)
    if (modalTaskId === deleteConfirmTaskId) {
      setModalTaskId(null)
    }
    if (selectedTaskId === deleteConfirmTaskId) {
      setSelectedTaskId(null)
    }
  }, [deleteConfirmTaskId, dispatch, modalTaskId, selectedTaskId])

  const handleEscape = useCallback(() => {
    if (deleteConfirmTaskId) {
      setDeleteConfirmTaskId(null)
      return
    }
    if (modalTaskId) {
      setModalTaskId(null)
      return
    }
    if (inlineEditId) {
      setInlineEditId(null)
    }
  }, [deleteConfirmTaskId, inlineEditId, modalTaskId])

  const handleUndo = useCallback(() => {
    dispatch(undo())
    setInlineEditId(null)
  }, [dispatch])

  useEffect(() => {
    if (modalTaskId && !tasks.some((task) => task.id === modalTaskId)) {
      setModalTaskId(null)
    }
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(null)
    }
  }, [tasks, modalTaskId, selectedTaskId])

  useKeyboardShortcuts({
    onNewTask: focusNewTaskInput,
    onEscape: handleEscape,
    onDelete: handleRequestDelete,
    onUndo: handleUndo,
    canUndo,
    disabled: Boolean(deleteConfirmTaskId),
  })

  return (
    <>
      <div className="board-toolbar">
        <BoardViewSwitcher value={boardView} onChange={onBoardViewChange} />
        <BoardFiltersBar
          filters={boardFilters}
          onChange={onBoardFiltersChange}
          resultCount={visibleTasks.length}
          totalCount={tasks.length}
        />
      </div>

      {boardView === 'kanban' && (
        <KanbanBoard
          boardFilters={boardFilters}
          onOpenTask={handleOpenTask}
          onSelectTask={handleSelectTask}
          selectedTaskId={selectedTaskId}
          inlineEditId={inlineEditId}
          onInlineEditIdChange={setInlineEditId}
          newTaskInputRef={newTaskInputRef}
        />
      )}

      {boardView === 'list' && (
        <ListView
          tasks={visibleTasks}
          filtersActive={filtersActive}
          selectedTaskId={selectedTaskId}
          onOpenTask={handleOpenTask}
          onSelectTask={handleSelectTask}
          onCreateTask={focusNewTaskInput}
        />
      )}

      {boardView === 'calendar' && (
        <CalendarView
          tasks={visibleTasks}
          filtersActive={filtersActive}
          onOpenTask={handleOpenTask}
          onCreateTask={focusNewTaskInput}
        />
      )}

      {boardView === 'timeline' && (
        <TimelineView
          tasks={visibleTasks}
          filtersActive={filtersActive}
          onOpenTask={handleOpenTask}
          onCreateTask={focusNewTaskInput}
        />
      )}

      <TaskModal
        taskId={modalTaskId}
        onClose={() => setModalTaskId(null)}
        onRequestDelete={() => {
          if (modalTaskId) setDeleteConfirmTaskId(modalTaskId)
        }}
      />

      {deleteTaskTarget && (
        <ConfirmDialog
          title="Delete task?"
          message={`"${deleteTaskTarget.title}" will be permanently removed.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteConfirmTaskId(null)}
        />
      )}
    </>
  )
}