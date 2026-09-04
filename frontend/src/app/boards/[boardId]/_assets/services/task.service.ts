/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQueryClient } from "@tanstack/react-query";
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { BoardDetail } from "@/types/kanban";
import { boardDetailKey } from "./board-detail.service";

export function useCreateTask(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "POST",
    path: `boards/${boardId}/tasks`,
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}

/** `mutate({ path: \`boards/${boardId}/tasks/${taskId}\`, title, description })` */
export function useUpdateTask(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "PATCH",
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}

export function useDeleteTask(boardId: string) {
  const queryClient = useQueryClient();
  return useApiMutation({
    method: "DELETE",
    isSuccessToast: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: boardDetailKey(boardId) }),
  });
}

interface MoveTaskVars {
  path: string;
  taskId: string;
  targetColumnId: string;
  targetIndex: number;
}

/**
 * Client-side mirror of the backend's move algorithm (TaskService.moveTask
 * on the API): pull the task out of its source column, splice it into the
 * target column at `targetIndex`, renumber both. Used only to paint the drag
 * result instantly — `onSettled` refetches so the server's ordering wins.
 */
function applyOptimisticMove(
  envelope: { data: BoardDetail } | undefined,
  vars: MoveTaskVars,
): { data: BoardDetail } | undefined {
  if (!envelope?.data) return envelope;
  const board = envelope.data;

  const sourceColumn = board.columns.find((c) => c.tasks.some((t) => t.id === vars.taskId));
  const task = sourceColumn?.tasks.find((t) => t.id === vars.taskId);
  if (!sourceColumn || !task) return envelope;

  const withTaskRemovedFromSource = board.columns.map((column) =>
    column.id === sourceColumn.id && column.id !== vars.targetColumnId
      ? { ...column, tasks: column.tasks.filter((t) => t.id !== vars.taskId) }
      : column,
  );

  const nextColumns = withTaskRemovedFromSource.map((column) => {
    if (column.id !== vars.targetColumnId) return column;

    const withoutMoved = column.tasks.filter((t) => t.id !== vars.taskId);
    const index = Math.max(0, Math.min(vars.targetIndex, withoutMoved.length));
    const reordered = [...withoutMoved];
    reordered.splice(index, 0, { ...task, columnId: vars.targetColumnId });

    return { ...column, tasks: reordered.map((t, i) => ({ ...t, position: i })) };
  });

  return { ...envelope, data: { ...board, columns: nextColumns } };
}

/** Drives the Task Movement API — reordering within a column or across columns. */
export function useMoveTask(boardId: string) {
  const queryClient = useQueryClient();
  const keyPrefix = [boardDetailKey(boardId)];

  return useApiMutation({
    method: "PATCH",
    isSuccessToast: false,

    onMutate: async (vars: MoveTaskVars) => {
      await queryClient.cancelQueries({ queryKey: keyPrefix });
      const previous = queryClient.getQueriesData<{ data: BoardDetail }>({ queryKey: keyPrefix });
      queryClient.setQueriesData<{ data: BoardDetail }>({ queryKey: keyPrefix }, (old) =>
        applyOptimisticMove(old, vars),
      );
      return { previous };
    },

    onError: (_err, _vars, context) => {
      context?.previous?.forEach(([key, data]: [any, any]) => {
        queryClient.setQueryData(key, data);
      });
    },

    onSettled: () => queryClient.invalidateQueries({ queryKey: keyPrefix }),
  });
}
