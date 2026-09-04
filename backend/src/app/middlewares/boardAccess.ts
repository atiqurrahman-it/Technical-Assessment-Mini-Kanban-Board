import { NextFunction, Request, Response } from 'express';
import { BoardRole } from '@prisma/client';
import httpStatus from 'http-status';
import { ApiError } from '../../errors/ApiErrors';
import catchAsync from '../../share/catchAsync';
import prisma from '../lib/db';
import { hasSufficientRole } from '../utils/boardRole';

/**
 * Resolves the caller's role on `req.params.boardId` and enforces a minimum
 * role for the route. This is the single choke point every board/column/task
 * route passes through, so no resource is ever reachable without an explicit
 * access check — closing off cross-board access to non-members entirely.
 *
 * A board that doesn't exist and a board the caller has no access to both
 * return 404, so a user can't distinguish "not found" from "not yours" by
 * probing ids.
 */
export const requireBoardAccess = (minRole: BoardRole = BoardRole.VIEWER) =>
  catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    const { boardId } = req.params;
    const userId = req.user!.id;

    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Board not found');
    }

    let role: BoardRole;
    if (board.ownerId === userId) {
      role = BoardRole.OWNER;
    } else {
      const membership = await prisma.boardMember.findUnique({
        where: { boardId_userId: { boardId, userId } },
      });
      if (!membership) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Board not found');
      }
      role = membership.role;
    }

    if (!hasSufficientRole(role, minRole)) {
      throw new ApiError(httpStatus.FORBIDDEN, `This action requires ${minRole} access`);
    }

    req.board = board;
    req.boardRole = role;
    next();
  });
