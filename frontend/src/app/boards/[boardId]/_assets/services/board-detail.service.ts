import { useQueryClient } from "@tanstack/react-query";
import useFetchData from "@/hook/TanstackQueries/useFetchData";
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { BOARDS_QUERY_KEY } from "@/app/boards/_assets/services/board.service";
import { BoardDetail } from "@/types/kanban";

export const boardDetailKey = (boardId: string) => ["board-detail", boardId];

export function useBoardDetail(boardId: string) {
  return useFetchData<{ data: BoardDetail }>({
    path: `boards/${boardId}`,
    queryKey: boardDetailKey(boardId),
    enabled: !!boardId,
  });
}

export function useUpdateBoard(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "PATCH",
    path: `boards/${boardId}`,
    isSuccessToast: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) });
      queryClient.invalidateQueries({ queryKey: [BOARDS_QUERY_KEY] });
    },
  });
}
