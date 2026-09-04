"use client";

import { LayoutGrid } from "lucide-react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppHeader } from "@/components/layout/AppHeader";
import { BoardCard } from "./_assets/components/BoardCard";
import { BoardsSkeleton } from "./_assets/components/BoardsSkeleton";
import { CreateBoardDialog } from "./_assets/components/CreateBoardDialog";
import { useBoards } from "./_assets/services/board.service";

export default function BoardsContainer() {
  return (
    <AuthGuard>
      <AppHeader />
      <BoardsList />
    </AuthGuard>
  );
}

function BoardsList() {
  const { data: response, isLoading } = useBoards();
  const boards = response?.data ?? [];

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Your boards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Boards you own or that have been shared with you.
          </p>
        </div>
        <CreateBoardDialog />
      </div>

      {isLoading ? (
        <BoardsSkeleton />
      ) : boards.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">
          <LayoutGrid className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">No boards yet</p>
          <p className="text-sm text-muted-foreground">Create your first board to get started.</p>
        </div>
      )}
    </main>
  );
}
