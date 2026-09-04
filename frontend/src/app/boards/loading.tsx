import { BoardsSkeleton } from "./_assets/components/BoardsSkeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <BoardsSkeleton />
    </main>
  );
}
