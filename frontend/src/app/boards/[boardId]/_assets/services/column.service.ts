import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { boardDetailKey } from "./board-detail.service";

export function useCreateColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "POST",
    path: `boards/${boardId}/columns`,
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}

/** `mutate({ path: \`boards/${boardId}/columns/${columnId}\`, name })` — path is per-call since the columnId isn't known until render. */
export function useUpdateColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "PATCH",
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}

export function useDeleteColumn(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "DELETE",
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}
