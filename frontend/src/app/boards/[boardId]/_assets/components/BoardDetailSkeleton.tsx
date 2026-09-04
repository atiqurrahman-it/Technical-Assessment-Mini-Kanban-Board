import { Skeleton } from "@/components/ui/skeleton";

/** Placeholder columns matching KanbanBoard's shape, shown while a board's detail loads. */
export function BoardDetailSkeleton() {
  return (
    <div className="flex h-full items-start gap-5 overflow-hidden pb-4">
      {Array.from({ length: 4 }).map((_, col) => (
        <div
          key={col}
          className="flex w-72 shrink-0 flex-col gap-2 rounded-xl border border-border bg-muted/60 p-3.5"
        >
          <Skeleton className="mb-1 h-5 w-2/3" />
          {Array.from({ length: 3 }).map((__, row) => (
            <Skeleton key={row} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ))}
    </div>
  );
}
