import BoardDetailContainer from "./container";

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  return (
    <div className="mx-auto max-w-7xl ">
      <BoardDetailContainer boardId={boardId} />;
    </div>
  );
}
