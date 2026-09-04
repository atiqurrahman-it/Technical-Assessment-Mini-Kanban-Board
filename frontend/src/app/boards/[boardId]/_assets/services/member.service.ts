import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { boardDetailKey } from "./board-detail.service";

export function useAddMember(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "POST",
    path: `boards/${boardId}/members`,
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}

/** `mutate({ path: \`boards/${boardId}/members/${userId}\`, role })` */
export function useUpdateMemberRole(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "PATCH",
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}

export function useRemoveMember(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "DELETE",
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}
