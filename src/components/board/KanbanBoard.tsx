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
import type { BoardFilters } from "../../features/kanban/filters";
import { Column } from "../column/Column";
import { TaskCard } from "../task/TaskCard";

interface KanbanBoardProps {
  boardFilters: BoardFilters;
  onOpenTask: (taskId: string) => void;
  shortcutsDisabled?: boolean;
}

export function KanbanBoard({
  boardFilters,
  onOpenTask,
  shortcutsDisabled = false,
}: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.kanban.tasks);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);
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
    todoInputRef.current?.focus();
    todoInputRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  }, []);

  const handleEscape = useCallback(() => {
    if (inlineEditId) {
      setInlineEditId(null);
    }
  }, [inlineEditId]);

  useKeyboardShortcuts({
    onNewTask: handleNewTask,
    onEscape: handleEscape,
    disabled: shortcutsDisabled,
  });

  function handleDragStart(event: DragStartEvent) {
    setInlineEditId(null);
    setActiveId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { over } = event;
    if (!over) {
      setOverId(null);
      setOverColumnId(null);
      return;
    }
    const nextOverId = over.id as string;
    setOverId(nextOverId);
    if (isColumnId(nextOverId)) {
      setOverColumnId(nextOverId);
    } else {
      const overTask = tasks.find((t) => t.id === nextOverId);
      setOverColumnId(overTask?.columnId ?? null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    setOverId(null);
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
    setOverId(null);
    setOverColumnId(null);
  }

  function handleOpenModal(taskId: string) {
    setInlineEditId(null);
    onOpenTask(taskId);
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        autoScroll={{
          threshold: { x: 0.12, y: 0.18 },
          acceleration: 14,
          interval: 6,
        }}
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
              activeId={activeId}
              overId={overId}
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
            duration: 320,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          }}
          style={{ cursor: "grabbing" }}
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
    </>
  );
}
