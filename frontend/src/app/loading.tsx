import { Skeleton } from "@/components/ui/skeleton";

/**
 * Root fallback shown while a route without its own `loading.tsx` streams
 * in — a generic app-shell shape (header bar + content block) rather than
 * a bare spinner, so the page doesn't visually jump when the real content
 * mounts.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="mx-auto w-full max-w-7xl flex-1 space-y-4 px-6 py-10">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
