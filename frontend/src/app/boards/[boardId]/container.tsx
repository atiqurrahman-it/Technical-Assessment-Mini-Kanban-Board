"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppHeader } from "@/components/layout/AppHeader";
import { Badge } from "@/components/ui/badge";
import { BoardDetailSkeleton } from "./_assets/components/BoardDetailSkeleton";
import { KanbanBoard } from "./_assets/components/KanbanBoard";
import { ShareBoardDialog } from "./_assets/components/ShareBoardDialog";
import { useBoardDetail } from "./_assets/services/board-detail.service";

export default function BoardDetailContainer({ boardId }: { boardId: string }) {
  return (
    <AuthGuard>
      <BoardDetailContent boardId={boardId} />
    </AuthGuard>
  );
}

function BoardDetailContent({ boardId }: { boardId: string }) {
  const { data: response, isLoading, isError } = useBoardDetail(boardId);
  const board = response?.data;

  if (isLoading) {
    return (
      <>
        <AppHeader />
        <main className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden px-6 py-6">
          <BoardDetailSkeleton />
        </main>
      </>
    );
  }

  if (isError || !board) {
    return (
      <>
        <AppHeader />
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium text-foreground">This board isn&apos;t available</p>
          <p className="text-sm text-muted-foreground">
            It may not exist, or you don&apos;t have access to it.
          </p>
          <Link href="/boards" className="text-sm font-medium text-primary hover:underline">
            Back to your boards
          </Link>
        </div>
      </>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <AppHeader>
        <div className="hidden items-center gap-2 border-l border-border pl-6 sm:flex">
          <Link href="/boards" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="max-w-xs truncate font-medium text-foreground">{board.name}</span>
          {board.myRole === "VIEWER" && <Badge variant="secondary">View only</Badge>}
        </div>
      </AppHeader>

      <main className="flex flex-1 flex-col overflow-hidden px-6 py-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="min-w-0 sm:hidden">
            <h1 className="truncate text-lg font-semibold text-foreground">{board.name}</h1>
          </div>
          {board.description && (
            <p className="hidden truncate text-sm text-muted-foreground sm:block">{board.description}</p>
          )}
          <ShareBoardDialog board={board} />
        </div>

        <div className="flex-1 overflow-hidden">
          <KanbanBoard board={board} />
        </div>
      </main>
    </div>
  );
}
