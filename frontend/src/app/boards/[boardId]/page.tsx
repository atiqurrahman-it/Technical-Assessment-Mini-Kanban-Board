import BoardDetailContainer from "./container";

export default async function BoardDetailPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const { boardId } = await params;
  return <BoardDetailContainer boardId={boardId} />;
}
