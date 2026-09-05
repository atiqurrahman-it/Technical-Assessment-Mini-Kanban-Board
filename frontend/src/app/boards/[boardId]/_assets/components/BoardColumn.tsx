"use client";

import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Column } from "@/types/kanban";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { MoreHorizontal, Plus } from "lucide-react";
import { KeyboardEvent, useState } from "react";
import { useDeleteColumn, useUpdateColumn } from "../services/column.service";
import { TaskCard } from "./TaskCard";
import { TaskDialog } from "./TaskDialog";

interface BoardColumnProps {
  boardId: string;
  column: Column;
  canEdit: boolean;
}

export function BoardColumn({ boardId, column, canEdit }: BoardColumnProps) {
  // The column body itself is a drop target too, so a task can be dropped
  // into an empty column (or below the last card) — not just onto another task.
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: { type: "column", columnId: column.id },
  });
  const updateColumn = useUpdateColumn(boardId);
  const deleteColumn = useDeleteColumn(boardId);
  const [isRenaming, setIsRenaming] = useState(false);
  const [name, setName] = useState(column.name);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function submitRename() {
    setIsRenaming(false);
    const trimmed = name.trim();
    if (trimmed && trimmed !== column.name) {
      updateColumn.mutate({
        path: `boards/${boardId}/columns/${column.id}`,
        name: trimmed,
      });
    } else {
      setName(column.name);
    }
  }

  function handleRenameKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submitRename();
    if (e.key === "Escape") {
      setName(column.name);
      setIsRenaming(false);
    }
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl border border-border bg-muted/60 transition-colors hover:border-primary/50">
      <div className="flex items-center justify-between gap-2 px-3.5 pb-2 pt-3.5">
        {isRenaming ? (
          <input
            autoFocus
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value)}
            onBlur={submitRename}
            onKeyDown={handleRenameKeyDown}
            className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm font-semibold text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <button
            type="button"
            className="flex min-w-0 items-center gap-2 text-sm font-semibold text-foreground disabled:cursor-default"
            onClick={() => canEdit && setIsRenaming(true)}
            disabled={!canEdit}
          >
            <span className="truncate">{column.name}</span>
            <span className="shrink-0 rounded-full bg-background px-2 py-0.5 text-xs font-normal text-muted-foreground">
              {column.tasks.length}
            </span>
          </button>
        )}

        {canEdit && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                />
              }
            >
              <MoreHorizontal className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsRenaming(true)}>
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmingDelete(true)}
              >
                Delete column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <SortableContext
        items={column.tasks.map((t) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        <ScrollArea className="h-[320px] px-3">
          <div
            ref={setNodeRef}
            className="flex min-h-[40px] flex-col gap-2 pb-3"
          >
            {column.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                boardId={boardId}
                canEdit={canEdit}
              />
            ))}
          </div>
        </ScrollArea>
      </SortableContext>

      {canEdit && (
        <div className="px-3 pb-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setIsAddingTask(true)}
          >
            <Plus className="h-4 w-4" /> Add task
          </Button>
        </div>
      )}

      <TaskDialog
        boardId={boardId}
        columnId={column.id}
        open={isAddingTask}
        onOpenChange={setIsAddingTask}
      />

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title={`Delete "${column.name}"?`}
        description="This will permanently delete the column and all of its tasks. This can't be undone."
        confirmLabel="Delete column"
        isLoading={deleteColumn.isPending}
        onConfirm={() =>
          deleteColumn.mutate(
            { path: `boards/${boardId}/columns/${column.id}` },
            { onSuccess: () => setConfirmingDelete(false) },
          )
        }
      />
    </div>
  );
}
