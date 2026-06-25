import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useCallback, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts";
import {
  filterTasks,
  hasActiveFilters,
} from "../../features/kanban/filters";
import { moveAndReorder } from "../../features/kanban/kanbanSlice";
import { DEFAULT_COLUMNS } from "../../features/kanban/types";
import { getColumnTasks, isColumnId } from "../../features/kanban/utils";
import { BoardFiltersBar } from "../ui/BoardFilters";
import type { BoardFilters } from "../../features/kanban/filters";
import { Column } from "../column/Column";
import { TaskCard } from "../task/TaskCard";
import { TaskModal } from "../task/TaskModal";

interface KanbanBoardProps {
  boardFilters: BoardFilters;
  onBoardFiltersChange: (filters: BoardFilters) => void;
}

export function KanbanBoard({
  boardFilters,
  onBoardFiltersChange,
}: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.kanban.tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
  const [modalTaskId, setModalTaskId] = useState<string | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const todoInputRef = useRef<HTMLInputElement>(null);

  const visibleTasks = useMemo(
    () => filterTasks(tasks, boardFilters),
    [tasks, boardFilters],
  );
  const filtersActive = hasActiveFilters(boardFilters);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 6 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const activeTask = activeId
    ? tasks.find((t) => t.id === activeId)
    : undefined;

  const handleNewTask = useCallback(() => {
    setInlineEditId(null);
    setModalTaskId(null);
    todoInputRef.current?.focus();
    todoInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  const handleEscape = useCallback(() => {
    if (modalTaskId) {
      setModalTaskId(null);
      return;
    }
    if (inlineEditId) {
      setInlineEditId(null);
    }
  }, [modalTaskId, inlineEditId]);

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onEscape: handleEscape,
    disabled: Boolean(modalTaskId),
  });

  function handleDragStart(event: DragStartEvent) {
    setInlineEditId(null);
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverColumnId(null);
      return;
    }
    const overId = over.id as string;
    if (isColumnId(overId)) {
      setOverColumnId(overId);
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      setOverColumnId(overTask?.columnId ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverColumnId(null);
    if (!over) return;

    const activeTaskId = active.id as string;
    const overId = over.id as string;
    const dragged = tasks.find((t) => t.id === activeTaskId);
    if (!dragged) return;

    let toColumnId = dragged.columnId;
    let toIndex = 0;

    if (isColumnId(overId)) {
      toColumnId = overId;
      toIndex = getColumnTasks(tasks, overId).length;
    } else {
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      toColumnId = overTask.columnId;
      toIndex = getColumnTasks(tasks, toColumnId).findIndex(
        (t) => t.id === overId,
      );
    }

    const fromColumnId = dragged.columnId;
    const fromIndex = getColumnTasks(tasks, fromColumnId).findIndex(
      (t) => t.id === activeTaskId,
    );

    if (fromColumnId === toColumnId && fromIndex === toIndex) return;
    if (fromColumnId === toColumnId && fromIndex < toIndex) {
      toIndex -= 1;
    }

    dispatch(moveAndReorder({ taskId: activeTaskId, toColumnId, toIndex }));
  }

  function handleDragCancel() {
    setActiveId(null);
    setOverColumnId(null);
  }

  function handleOpenModal(taskId: string) {
    setInlineEditId(null);
    setModalTaskId(taskId);
  }

  function handleCloseModal() {
    setModalTaskId(null);
  }

  return (
    <>
      <BoardFiltersBar
        filters={boardFilters}
        onChange={onBoardFiltersChange}
        resultCount={visibleTasks.length}
        totalCount={tasks.length}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="board-scroll">
          {DEFAULT_COLUMNS.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={getColumnTasks(visibleTasks, column.id)}
              filtersActive={filtersActive}
              inlineEditId={inlineEditId}
              isDropTarget={overColumnId === column.id && activeId !== null}
              inputRef={column.id === "todo" ? todoInputRef : undefined}
              onOpenModal={handleOpenModal}
              onStartInlineEdit={setInlineEditId}
              onEndInlineEdit={() => setInlineEditId(null)}
            />
          ))}
        </div>

        <DragOverlay
          dropAnimation={{
            duration: 250,
            easing: "cubic-bezier(0.18, 0.67, 0.32, 1.02)",
          }}
        >
          {activeTask ? (
            <TaskCard
              task={activeTask}
              isDragging
              isOverlay
              onOpenModal={() => { }}
              onStartInlineEdit={() => { }}
              onEndInlineEdit={() => { }}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <TaskModal taskId={modalTaskId} onClose={handleCloseModal} />
    </>
  );
}
