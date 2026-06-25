import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import { createPortal } from "react-dom";
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

  const activeIdRef = useRef<string | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const captureElementRef = useRef<HTMLDivElement | null>(null);
  const overColumnRef = useRef<ColumnId | null>(null);
  const dragListenersRef = useRef<{
    move: (event: PointerEvent) => void;
    end: (event: PointerEvent) => void;
    lostCapture: (event: PointerEvent) => void;
    safetyEnd: (event: PointerEvent) => void;
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
      if (!columnId) {
        setOverColumnId(null);
        setOverId(null);
        overColumnRef.current = null;
        return;
      }

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
    document.removeEventListener("pointerup", listeners.safetyEnd, true);
    document.removeEventListener("pointercancel", listeners.safetyEnd, true);
    captureElementRef.current?.removeEventListener(
      "lostpointercapture",
      listeners.lostCapture,
    );
    dragListenersRef.current = null;
  }, []);

  const clearDragState = useCallback(() => {
    activeIdRef.current = null;
    pointerIdRef.current = null;
    captureElementRef.current = null;
    overColumnRef.current = null;
    setActiveId(null);
    setOverId(null);
    setOverColumnId(null);
    setOverlayPos({ x: 0, y: 0 });
    document.body.classList.remove("kanban-dragging");
  }, []);

  const endDrag = useCallback(() => {
    removeDragListeners();
    clearDragState();
  }, [clearDragState, removeDragListeners]);

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

  const finishDrag = useCallback(
    (endEvent: PointerEvent) => {
      const taskId = activeIdRef.current;
      const pointerId = pointerIdRef.current;
      const element = captureElementRef.current;
      if (!taskId || pointerId === null || endEvent.pointerId !== pointerId) {
        return;
      }

      try {
        element?.releasePointerCapture(endEvent.pointerId);
      } catch {
        // Ignore if capture was never established.
      }

      commitDrop(taskId, endEvent.clientX, endEvent.clientY);
      endDrag();
    },
    [commitDrop, endDrag],
  );

  useEffect(() => {
    return () => {
      removeDragListeners();
      clearDragState();
    };
  }, [clearDragState, removeDragListeners]);

  useEffect(() => {
    if (!activeId) return;

    function cancelDrag() {
      endDrag();
    }

    function handleVisibilityChange() {
      if (document.hidden) cancelDrag();
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") cancelDrag();
    }

    window.addEventListener("blur", cancelDrag);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keydown", handleEscape);
    window.addEventListener("scroll", cancelDrag, true);
    window.addEventListener("resize", cancelDrag);

    return () => {
      window.removeEventListener("blur", cancelDrag);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("scroll", cancelDrag, true);
      window.removeEventListener("resize", cancelDrag);
    };
  }, [activeId, endDrag]);

  const handlePointerDragStart = useCallback(
    (
      taskId: string,
      element: HTMLDivElement,
      pointerId: number,
      clientX: number,
      clientY: number,
    ) => {
      onInlineEditIdChange(null);
      endDrag();

      activeIdRef.current = taskId;
      pointerIdRef.current = pointerId;
      captureElementRef.current = element;

      try {
        element.setPointerCapture(pointerId);
      } catch {
        // Pointer capture is optional; document/window listeners still handle the drop.
      }

      document.body.classList.add("kanban-dragging");
      setActiveId(taskId);
      updateHoverTarget(clientX, clientY, taskId);

      const handlePointerMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== pointerId) return;
        updateHoverTarget(moveEvent.clientX, moveEvent.clientY, taskId);
      };

      const handlePointerEnd = (endEvent: PointerEvent) => {
        finishDrag(endEvent);
      };

      const handleLostCapture = (lostEvent: PointerEvent) => {
        if (lostEvent.pointerId !== pointerId) return;
        endDrag();
      };

      const handleSafetyEnd = (endEvent: PointerEvent) => {
        if (!activeIdRef.current || endEvent.pointerId !== pointerId) return;
        finishDrag(endEvent);
      };

      dragListenersRef.current = {
        move: handlePointerMove,
        end: handlePointerEnd,
        lostCapture: handleLostCapture,
        safetyEnd: handleSafetyEnd,
      };

      element.addEventListener("lostpointercapture", handleLostCapture);
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerEnd);
      window.addEventListener("pointercancel", handlePointerEnd);
      document.addEventListener("pointerup", handleSafetyEnd, true);
      document.addEventListener("pointercancel", handleSafetyEnd, true);
    },
    [endDrag, finishDrag, onInlineEditIdChange, updateHoverTarget],
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

      {activeTask &&
        createPortal(
          <div
            className="kanban-drag-overlay"
            style={{
              transform: `translate3d(${overlayPos.x}px, ${overlayPos.y}px, 0) translate(-50%, -50%)`,
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
          </div>,
          document.body,
        )}
    </>
  );
}