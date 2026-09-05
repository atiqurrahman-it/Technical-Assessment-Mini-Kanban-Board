import { useQueryClient } from "@tanstack/react-query";
import useFetchData from "@/hook/TanstackQueries/useFetchData";
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { BoardSummary } from "@/types/kanban";

export const BOARDS_QUERY_KEY = "boards";

export interface Pagination {
  currentPage: number;
  perPage: number;
  totalItems: number;
  totalPages: number;
}

/** Boards the current user owns or has been given access to. */
export function useBoards({ page = 1, pageSize = 9 }: { page?: number; pageSize?: number } = {}) {
  return useFetchData<{ data: BoardSummary[]; pagination: Pagination }>({
    path: "boards",
    queryKey: BOARDS_QUERY_KEY,
    filterData: { page, pageSize },
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
