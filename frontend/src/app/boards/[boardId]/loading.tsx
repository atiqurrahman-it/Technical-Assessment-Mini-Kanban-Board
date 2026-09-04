import { BoardDetailSkeleton } from "./_assets/components/BoardDetailSkeleton";

export default function Loading() {
  return (
    <main className="flex h-screen flex-col overflow-hidden px-6 py-6">
      <BoardDetailSkeleton />
    </main>
  );
}
