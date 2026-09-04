"use client";

import { Plus } from "lucide-react";
import { FormEvent, useState } from "react";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { useCreateColumn } from "../services/column.service";

export function AddColumnForm({ boardId }: { boardId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const createColumn = useCreateColumn(boardId);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createColumn.mutate(
      { name: name.trim() },
      {
        onSuccess: () => {
          setName("");
          setIsOpen(false);
        },
      },
    );
  }

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        className="h-11 w-72 shrink-0 justify-start border border-dashed border-border text-muted-foreground hover:border-primary hover:bg-transparent hover:text-primary"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="h-4 w-4" /> Add column
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-72 shrink-0 flex-col gap-2 rounded-xl border border-border bg-muted/60 p-3"
    >
      <CustomField.Text value={name} setValue={setName} placeholder="Column name" />
      <div className="flex gap-2">
        <Button type="submit" size="sm" isLoading={createColumn.isPending}>
          Add
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
