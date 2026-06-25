import { useCallback, useMemo, useRef, useState, type RefObject } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  filterTasks,
  hasActiveFilters,
} from "../../features/kanban/filters";
import {
  findColumnAtPoint,
  findTaskAtPoint,
  getColumnElement,
  resolveInsertIndex,
} from "../../features/kanban/dnd";
import { moveAndReorder } from "../../features/kanban/kanbanSlice";
import type { ColumnId } from "../../features/kanban/types";
import { DEFAULT_COLUMNS } from "../../features/kanban/types";
import { getColumnTasks } from "../../features/kanban/utils";
import type { BoardFilters } from "../../features/kanban/filters";
import { Column } from "../column/Column";
import { TaskCard } from "../task/TaskCard";

interface KanbanBoardProps {
  boardFilters: BoardFilters;
  onOpenTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  selectedTaskId: string | null;
  inlineEditId: string | null;
  onInlineEditIdChange: (taskId: string | null) => void;
  newTaskInputRef: RefObject<HTMLInputElement | null>;
}

export function KanbanBoard({
  boardFilters,
  onOpenTask,
  onSelectTask,
  selectedTaskId,
  inlineEditId,
  onInlineEditIdChange,
  newTaskInputRef,
}: KanbanBoardProps) {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.kanban.tasks);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overColumnId, setOverColumnId] = useState<ColumnId | null>(null);
  const [overlayPos, setOverlayPos] = useState({ x: 0, y: 0 });

  const overColumnRef = useRef<ColumnId | null>(null);
  const dragListenersRef = useRef<{
    move: (event: PointerEvent) => void;
    end: (event: PointerEvent) => void;
  } | null>(null);

  const visibleTasks = useMemo(
    () => filterTasks(tasks, boardFilters),
    [tasks, boardFilters],
  );
  const filtersActive = hasActiveFilters(boardFilters);

  const activeTask = activeId
    ? tasks.find((task) => task.id === activeId)
    : undefined;

  const updateHoverTarget = useCallback(
    (x: number, y: number, excludeTaskId: string | null = null) => {
      setOverlayPos({ x, y });

      const columnId = findColumnAtPoint(x, y);
      if (!columnId) return;

      overColumnRef.current = columnId;
      setOverColumnId(columnId);

      const columnEl = getColumnElement(columnId);
      if (!columnEl) {
        setOverId(columnId);
        return;
      }

      const taskId = findTaskAtPoint(columnEl, y, excludeTaskId);
      setOverId(taskId ?? columnId);
    },
    [],
  );

  const removeDragListeners = useCallback(() => {
    const listeners = dragListenersRef.current;
    if (!listeners) return;
    window.removeEventListener("pointermove", listeners.move);
    window.removeEventListener("pointerup", listeners.end);
    window.removeEventListener("pointercancel", listeners.end);
    dragListenersRef.current = null;
  }, []);

  const endDrag = useCallback(() => {
    removeDragListeners();
    overColumnRef.current = null;
    setActiveId(null);
    setOverId(null);
    setOverColumnId(null);
  }, [removeDragListeners]);

  const commitDrop = useCallback(
    (taskId: string, x: number, y: number) => {
      const currentTasks = tasksRef.current;
      const dragged = currentTasks.find((task) => task.id === taskId);
      if (!dragged) return;

      const targetColumn =
        findColumnAtPoint(x, y) ?? overColumnRef.current ?? dragged.columnId;

      const columnEl = getColumnElement(targetColumn);
      const toIndex = columnEl
        ? resolveInsertIndex(columnEl, y, taskId)
        : getColumnTasks(currentTasks, targetColumn).length;

      const fromColumnId = dragged.columnId;
      const fromIndex = getColumnTasks(currentTasks, fromColumnId).findIndex(
        (task) => task.id === taskId,
      );

      let finalIndex = toIndex;
      if (fromColumnId === targetColumn && fromIndex < finalIndex) {
        finalIndex -= 1;
      }

      if (fromColumnId === targetColumn && fromIndex === finalIndex) return;

      dispatch(
        moveAndReorder({
          taskId,
          toColumnId: targetColumn,
          toIndex: finalIndex,
        }),
      );
    },
    [dispatch],
  );

  const handlePointerDragStart = useCallback(
    (
      taskId: string,
      element: HTMLDivElement,
      pointerId: number,
      clientX: number,
      clientY: number,
    ) => {
      onInlineEditIdChange(null);
      removeDragListeners();

      try {
        element.setPointerCapture(pointerId);
      } catch {
        // Pointer capture is optional; window listeners still handle the drop.
      }

      setActiveId(taskId);
      updateHoverTarget(clientX, clientY, taskId);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        updateHoverTarget(moveEvent.clientX, moveEvent.clientY, taskId);
      };

      const handlePointerEnd = (endEvent: PointerEvent) => {
        if (endEvent.pointerId !== pointerId) return;
        try {
          element.releasePointerCapture(endEvent.pointerId);
        } catch {
          // Ignore if capture was never established.
        }
        commitDrop(taskId, endEvent.clientX, endEvent.clientY);
        endDrag();
      };

      dragListenersRef.current = {
        move: handlePointerMove,
        end: handlePointerEnd,
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerEnd);
      window.addEventListener("pointercancel", handlePointerEnd);
    },
    [
      commitDrop,
      endDrag,
      onInlineEditIdChange,
      removeDragListeners,
      updateHoverTarget,
    ],
  );

  function handleOpenModal(taskId: string) {
    onInlineEditIdChange(null);
    onSelectTask(taskId);
    onOpenTask(taskId);
  }

  return (
    <>
      <div
        className={[
          "board-view-panel",
          "board-scroll",
          activeId && "board-scroll--dragging",
        ]
          .filter(Boolean)
          .join(" ")}
      >
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
            inputRef={column.id === "todo" ? newTaskInputRef : undefined}
            onOpenModal={handleOpenModal}
            onSelectTask={onSelectTask}
            selectedTaskId={selectedTaskId}
            onStartInlineEdit={onInlineEditIdChange}
            onEndInlineEdit={() => onInlineEditIdChange(null)}
            onPointerDragStart={handlePointerDragStart}
          />
        ))}
      </div>

      {activeTask && (
        <div
          className="kanban-drag-overlay"
          style={{
            left: overlayPos.x,
            top: overlayPos.y,
          }}
        >
          <TaskCard
            task={activeTask}
            isDragging
            isOverlay
            onOpenModal={() => {}}
            onStartInlineEdit={() => {}}
            onEndInlineEdit={() => {}}
          />
        </div>
      )}
    </>
  );
}