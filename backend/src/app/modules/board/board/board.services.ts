import prisma from '../../../lib/db';

const memberSelect = {
  select: {
    id: true,
    role: true,
    createdAt: true,
    user: { select: { id: true, name: true, email: true } },
  },
};

const createBoard = (ownerId: string, payload: { name: string; description?: string }) =>
  prisma.board.create({ data: { ...payload, ownerId } });

/** Boards the user owns or has been given access to, most recently updated first. */
const getBoardsForUser = async (userId: string) => {
  const boards = await prisma.board.findMany({
    where: { OR: [{ ownerId: userId }, { members: { some: { userId } } }] },
    orderBy: { updatedAt: 'desc' },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      _count: { select: { columns: true, tasks: true } },
    },
  });

  return boards.map((board) => ({
    ...board,
    role: board.ownerId === userId ? 'OWNER' : 'MEMBER',
  }));
};

const getBoardDetail = (boardId: string) =>
  prisma.board.findUnique({
    where: { id: boardId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      members: memberSelect,
      columns: {
        orderBy: { position: 'asc' },
        include: { tasks: { orderBy: { position: 'asc' } } },
      },
    },
  });

const updateBoard = (boardId: string, payload: { name?: string; description?: string }) =>
  prisma.board.update({ where: { id: boardId }, data: payload });

const deleteBoard = (boardId: string) => prisma.board.delete({ where: { id: boardId } });

export const BoardService = { createBoard, getBoardsForUser, getBoardDetail, updateBoard, deleteBoard };
