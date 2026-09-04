import httpStatus from 'http-status';
import prisma from '../../../lib/db';
import { ApiError } from '../../../../errors/ApiErrors';

const createColumn = async (boardId: string, name: string) => {
  const position = await prisma.column.count({ where: { boardId } });
  return prisma.column.create({ data: { boardId, name, position } });
};

/** Throws 404 if the column doesn't exist or belongs to a different board than the URL implies. */
const assertColumnInBoard = async (boardId: string, columnId: string) => {
  const column = await prisma.column.findUnique({ where: { id: columnId } });
  if (!column || column.boardId !== boardId) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Column not found on this board');
  }
  return column;
};

const updateColumn = async (boardId: string, columnId: string, name: string) => {
  await assertColumnInBoard(boardId, columnId);
  return prisma.column.update({ where: { id: columnId }, data: { name } });
};

/** Deletes a column (cascading its tasks) and compacts the remaining columns' positions. */
const deleteColumn = async (boardId: string, columnId: string) => {
  await assertColumnInBoard(boardId, columnId);

  await prisma.$transaction(async (tx) => {
    await tx.column.delete({ where: { id: columnId } });

    const remaining = await tx.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
    });

    await Promise.all(
      remaining.map((column, index) =>
        column.position === index
          ? Promise.resolve()
          : tx.column.update({ where: { id: column.id }, data: { position: index } }),
      ),
    );
  });
};

export const ColumnService = { createColumn, updateColumn, deleteColumn, assertColumnInBoard };
