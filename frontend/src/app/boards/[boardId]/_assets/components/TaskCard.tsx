"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";
import { Task } from "@/types/kanban";
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
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", columnId: task.columnId },
    disabled: !canEdit || overlay,
  });

  const style = overlay ? undefined : { transform: CSS.Transform.toString(transform), transition };

  return (
    <>
      <div
        ref={overlay ? undefined : setNodeRef}
        style={style}
        onClick={() => !isDragging && setIsEditing(true)}
        className={cn(
          "group flex cursor-pointer items-start gap-2 rounded-lg border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md",
          isDragging && "opacity-40",
          overlay && "rotate-2 shadow-lg",
        )}
      >
        {canEdit && !overlay && (
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
            className="mt-0.5 shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground/50 transition-colors hover:text-muted-foreground active:cursor-grabbing"
            aria-label="Drag to reorder task"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            {canEdit && !overlay && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmingDelete(true);
                }}
                className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Delete task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          {task.description && (
            <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">{task.description}</p>
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
                { onSuccess: () => setConfirmingDelete(false) }
              )
            }
          />
        </>
      )}
    </>
  );
}
