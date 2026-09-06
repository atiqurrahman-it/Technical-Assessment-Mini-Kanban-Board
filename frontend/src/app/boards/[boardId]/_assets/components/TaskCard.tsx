"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";
import { Task } from "@/types/kanban";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteTask } from "../services/task.service";
import { TaskDialog } from "./TaskDialog";

interface TaskCardProps {
  task: Task;
  boardId: string;
  canEdit: boolean;
  /** Rendered inside a DragOverlay — skip drag wiring and hover affordances. */
  overlay?: boolean;
}

export function TaskCard({ task, boardId, canEdit, overlay }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const deleteTask = useDeleteTask(boardId);
  const { listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: { type: "task", columnId: task.columnId },
      disabled: !canEdit || overlay,
    });

  const style = overlay
    ? undefined
    : { transform: CSS.Transform.toString(transform), transition };

  return (
    <>
      <div
        ref={overlay ? undefined : setNodeRef}
        style={style}
        onClick={() => !isDragging && !canEdit && setIsEditing(true)}
        {...(canEdit && !overlay ? listeners : {})}
        className={cn(
          "group flex items-start gap-2 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
          canEdit
            ? "touch-none cursor-grab active:cursor-grabbing"
            : "cursor-pointer",
          isDragging && "opacity-40",
          overlay && "rotate-2 shadow-lg",
        )}
      >
        {canEdit && !overlay && (
          <GripVertical
            aria-hidden="true"
            className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50"
          />
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            {canEdit && !overlay && (
              <div className="flex flex-col gap-3 cursor-pointer shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Edit task"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingDelete(true);
                  }}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
              {task.description}
            </p>
          )}
        </div>
      </div>

      {!overlay && (
        <>
          <TaskDialog
            boardId={boardId}
            task={task}
            open={isEditing}
            onOpenChange={setIsEditing}
            viewOnly={!canEdit}
          />
          <ConfirmDialog
            open={confirmingDelete}
            onOpenChange={setConfirmingDelete}
            title="Delete task?"
            description={`"${task.title}" will be permanently deleted. This can't be undone.`}
            confirmLabel="Delete task"
            isLoading={deleteTask.isPending}
            onConfirm={() =>
              deleteTask.mutate(
                { path: `boards/${boardId}/tasks/${task.id}` },
                { onSuccess: () => setConfirmingDelete(false) },
              )
            }
          />
        </>
      )}
    </>
  );
}
