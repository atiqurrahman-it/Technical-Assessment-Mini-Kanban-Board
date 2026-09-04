import { Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { BoardSummary } from "@/types/kanban";

export function BoardCard({ board }: { board: BoardSummary }) {
  return (
    <Link
      href={`/boards/${board.id}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
          {board.name}
        </h3>
        {board.role === "OWNER" && <Badge variant="secondary">Owner</Badge>}
      </div>

      {board.description && (
        <p className="line-clamp-2 text-sm text-muted-foreground">{board.description}</p>
      )}

      <div className="mt-auto flex items-center gap-4 pt-2 text-xs text-muted-foreground">
        <span>{board._count.columns} columns</span>
        <span>{board._count.tasks} tasks</span>
        {board.role !== "OWNER" && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {board.owner.name}
          </span>
        )}
      </div>
    </Link>
  );
}
