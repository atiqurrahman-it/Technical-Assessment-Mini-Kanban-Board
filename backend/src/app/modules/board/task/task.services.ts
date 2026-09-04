import httpStatus from 'http-status';
import { Prisma, Task } from '@prisma/client';
import prisma from '../../../lib/db';
import { ApiError } from '../../../../errors/ApiErrors';
import { ColumnService } from '../column/column.services';

type TxClient = Prisma.TransactionClient;

const createTask = async (
  boardId: string,
  createdById: string,
  payload: { columnId: string; title: string; description?: string },
) => {
  await ColumnService.assertColumnInBoard(boardId, payload.columnId);

  const position = await prisma.task.count({ where: { columnId: payload.columnId } });
  return prisma.task.create({
    data: {
      boardId,
      columnId: payload.columnId,
      title: payload.title,
      description: payload.description,
      position,
      createdById,
    },
  });
};

/** Throws 404 if the task doesn't exist or belongs to a different board than the URL implies. */
const assertTaskInBoard = async (boardId: string, taskId: string) => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task || task.boardId !== boardId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Task not found on this board');
  }
  return task;
};

const updateTask = async (
  boardId: string,
  taskId: string,
  payload: { title?: string; description?: string },
) => {
  await assertTaskInBoard(boardId, taskId);
  return prisma.task.update({ where: { id: taskId }, data: payload });
};

/**
 * Writes `position = 0..n-1` (and `columnId`) for every task in
 * `orderedTasks`, in that order. Unconditional — kanban columns are small
 * enough that re-writing the whole list on every move is simpler and cheap,
 * and it avoids subtle bugs from trying to skip "unchanged" rows.
 */
const applyColumnOrder = (tx: TxClient, columnId: string, orderedTasks: Task[]) =>
  Promise.all(
    orderedTasks.map((task, index) =>
      tx.task.update({ where: { id: task.id }, data: { columnId, position: index } }),
    ),
  );

const deleteTask = async (boardId: string, taskId: string) => {
  const task = await assertTaskInBoard(boardId, taskId);

  await prisma.$transaction(async (tx) => {
    await tx.task.delete({ where: { id: taskId } });

    const remaining = await tx.task.findMany({
      where: { columnId: task.columnId },
      orderBy: { position: 'asc' },
    });
    await applyColumnOrder(tx, task.columnId, remaining);
  });
};

/**
 * Reorders a task within its column, or moves it to a specific index in a
 * different column. Both cases are handled as one operation: pull the task
 * out of its source list, splice it into the target list at `targetIndex`
 * (clamped to the list's bounds), then rewrite `position` (0..n-1) for every
 * task in whichever column(s) were touched. Wrapped in a transaction so a
 * concurrent move can't observe or produce a half-written ordering.
 *
 * Plain integer re-indexing (rather than fractional/"lexo" positions) is a
 * deliberate choice: it sidesteps float-precision drift over many moves and
 * keeps "what order are these tasks in" trivial to reason about, at the cost
 * of an O(column size) write per move — a non-issue for kanban-sized lists.
 */
const moveTask = async (
  boardId: string,
  taskId: string,
  payload: { targetColumnId: string; targetIndex: number },
) =>
  prisma.$transaction(async (tx) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task || task.boardId !== boardId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Task not found on this board');
    }

    const targetColumn = await tx.column.findUnique({ where: { id: payload.targetColumnId } });
    if (!targetColumn || targetColumn.boardId !== boardId) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Target column not found on this board');
    }

    const sourceColumnId = task.columnId;
    const targetColumnId = payload.targetColumnId;

    if (sourceColumnId === targetColumnId) {
      const siblings = (
        await tx.task.findMany({ where: { columnId: sourceColumnId }, orderBy: { position: 'asc' } })
      ).filter((t) => t.id !== taskId);

      const index = Math.max(0, Math.min(payload.targetIndex, siblings.length));
      siblings.splice(index, 0, task);

      await applyColumnOrder(tx, sourceColumnId, siblings);
    } else {
      const sourceSiblings = await tx.task.findMany({
        where: { columnId: sourceColumnId, id: { not: taskId } },
        orderBy: { position: 'asc' },
      });
      const targetSiblings = await tx.task.findMany({
        where: { columnId: targetColumnId },
        orderBy: { position: 'asc' },
      });

      const index = Math.max(0, Math.min(payload.targetIndex, targetSiblings.length));
      targetSiblings.splice(index, 0, task);

      await applyColumnOrder(tx, sourceColumnId, sourceSiblings);
      await applyColumnOrder(tx, targetColumnId, targetSiblings);
    }

    return tx.task.findUnique({ where: { id: taskId } });
  });

export const TaskService = { createTask, updateTask, deleteTask, moveTask, assertTaskInBoard };
