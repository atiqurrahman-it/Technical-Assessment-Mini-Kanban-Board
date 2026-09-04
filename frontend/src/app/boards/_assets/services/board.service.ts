import { useQueryClient } from "@tanstack/react-query";
import useFetchData from "@/hook/TanstackQueries/useFetchData";
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { BoardSummary } from "@/types/kanban";

export const BOARDS_QUERY_KEY = "boards";

/** Boards the current user owns or has been given access to. */
export function useBoards() {
  return useFetchData<{ data: BoardSummary[] }>({
    path: "boards",
    queryKey: BOARDS_QUERY_KEY,
  });
}

export function useCreateBoard() {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "POST",
    path: "boards",
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [BOARDS_QUERY_KEY] }),
  });
}
