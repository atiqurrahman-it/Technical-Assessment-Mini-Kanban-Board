"use client";

import { BoardDetail, Task } from "@/types/kanban";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { useState } from "react";
import { useMoveTask } from "../services/task.service";
import { AddColumnForm } from "./AddColumnForm";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";

type DroppableData = { type: "task" | "column"; columnId: string };

/**
 * Orchestrates drag-and-drop for one board. Each column is a droppable
 * (`useDroppable`, so an empty column or the space below the last card can
 * receive a drop) wrapping a `SortableContext` of its tasks. On drop, this
 * figures out the target column + insertion index from whatever was dropped
 * on, then hands off to `useMoveTask` — the same shape the backend's move
 * endpoint expects.
 */
export function KanbanBoard({ board }: { board: BoardDetail }) {
  const moveTask = useMoveTask(board.id);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const canEdit = board.myRole !== "VIEWER";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function findTask(taskId: string): Task | null {
    for (const column of board.columns) {
      const task = column.tasks.find((t) => t.id === taskId);
      if (task) return task;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(findTask(String(event.active.id)));
  }

  function handleDragCancel() {
    setActiveTask(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveTask(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overData = over.data.current as DroppableData | undefined;
    if (!overData) return;

    const sourceColumn = board.columns.find((c) =>
      c.tasks.some((t) => t.id === activeId),
    );
    const targetColumn = board.columns.find((c) => c.id === overData.columnId);
    if (!sourceColumn || !targetColumn) return;

    // Dropped on a task → insert at that task's position; dropped on the
    // column body itself (e.g. an empty column) → append to the end.
    let targetIndex: number;
    if (overData.type === "column") {
      targetIndex = targetColumn.tasks.length;
    } else {
      const withoutActive = targetColumn.tasks.filter((t) => t.id !== activeId);
      const overIndex = withoutActive.findIndex(
        (t) => t.id === String(over.id),
      );
      targetIndex = overIndex === -1 ? withoutActive.length : overIndex;
    }

    const isNoOp =
      sourceColumn.id === targetColumn.id &&
      sourceColumn.tasks.findIndex((t) => t.id === activeId) === targetIndex;
    if (isNoOp) return;

    moveTask.mutate({
      path: `boards/${board.id}/tasks/${activeId}/move`,
      taskId: activeId,
      targetColumnId: targetColumn.id,
      targetIndex,
    });
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3  h-full items-start  overflow-x-auto pb-4">
        {board.columns.map((column) => (
          <BoardColumn
            key={column.id}
            boardId={board.id}
            column={column}
            canEdit={canEdit}
          />
        ))}
        {canEdit && <AddColumnForm boardId={board.id} />}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            boardId={board.id}
            canEdit={canEdit}
            overlay
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
