"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Task } from "@/types/kanban";
import { TaskFormValues, taskSchema } from "../schema/task.schema";
import { useCreateTask, useUpdateTask } from "../services/task.service";

interface TaskDialogProps {
  boardId: string;
  /** Required when creating a new task; omit when editing an existing one. */
  columnId?: string;
  task?: Task;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Handles both "create a task in `columnId`" and "edit `task`" — whichever prop is set. */
export function TaskDialog({ boardId, columnId, task, open, onOpenChange }: TaskDialogProps) {
  const createTask = useCreateTask(boardId);
  const updateTask = useUpdateTask(boardId);
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (open) {
      form.reset({ title: task?.title ?? "", description: task?.description ?? "" });
    }
  }, [open, task, form]);

  const isPending = createTask.isPending || updateTask.isPending;

  function onSubmit(values: TaskFormValues) {
    const onSuccess = () => onOpenChange(false);

    if (task) {
      updateTask.mutate(
        { path: `boards/${boardId}/tasks/${task.id}`, ...values },
        { onSuccess },
      );
    } else if (columnId) {
      createTask.mutate({ columnId, ...values }, { onSuccess });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomField.Text form={form} name="title" labelName="Title" required />
          <CustomField.TextArea form={form} name="description" labelName="Description" rows={4} />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isPending}>
              {task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
