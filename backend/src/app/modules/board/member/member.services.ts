import httpStatus from 'http-status';
import { BoardRole } from '@prisma/client';
import prisma from '../../../lib/db';
import { ApiError } from '../../../../errors/ApiErrors';

const addMember = async (boardId: string, payload: { email: string; role: BoardRole }) => {
  const board = await prisma.board.findUnique({ where: { id: boardId } });
  const invitee = await prisma.user.findUnique({ where: { email: payload.email } });

  if (!invitee) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No registered user with that email');
  }
  if (invitee.id === board!.ownerId) {
    throw new ApiError(httpStatus.CONFLICT, 'This user already owns the board');
  }

  const existing = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId: invitee.id } },
  });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'This user already has access to the board');
  }

  return prisma.boardMember.create({
    data: { boardId, userId: invitee.id, role: payload.role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

const listMembers = (boardId: string) =>
  prisma.boardMember.findMany({
    where: { boardId },
    orderBy: { createdAt: 'asc' },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

const updateMemberRole = async (boardId: string, userId: string, role: BoardRole) => {
  const membership = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });
  if (!membership) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not a member of the board');
  }

  return prisma.boardMember.update({
    where: { boardId_userId: { boardId, userId } },
    data: { role },
    include: { user: { select: { id: true, name: true, email: true } } },
  });
};

const removeMember = async (boardId: string, userId: string) => {
  const membership = await prisma.boardMember.findUnique({
    where: { boardId_userId: { boardId, userId } },
  });
  if (!membership) {
    throw new ApiError(httpStatus.NOT_FOUND, 'This user is not a member of the board');
  }

  await prisma.boardMember.delete({ where: { boardId_userId: { boardId, userId } } });
};

export const MemberService = { addMember, listMembers, updateMemberRole, removeMember };
