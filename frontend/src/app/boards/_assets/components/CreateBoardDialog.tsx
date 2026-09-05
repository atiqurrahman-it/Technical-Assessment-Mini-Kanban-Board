"use client";

import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  CreateBoardFormValues,
  createBoardSchema,
} from "../schema/create-board.schema";
import { useCreateBoard } from "../services/board.service";

export function CreateBoardDialog() {
  const [open, setOpen] = useState(false);
  const createBoard = useCreateBoard();
  const form = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { name: "", description: "" },
  });

  function onSubmit(values: CreateBoardFormValues) {
    createBoard.mutate(values, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) form.reset();
      }}
    >
      <DialogTrigger render={<Button />}>
        <Plus className="h-4 w-4" /> New board
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a board</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <CustomField.Text
            form={form}
            name="name"
            labelName="Name"
            required
            placeholder="e.g. Product Launch"
          />
          <CustomField.TextArea
            form={form}
            name="description"
            labelName="Description (optional)"
            rows={3}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createBoard.isPending}>
              Create board
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
