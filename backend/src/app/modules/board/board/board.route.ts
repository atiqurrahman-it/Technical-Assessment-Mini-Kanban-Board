import express from 'express';
import { BoardRole } from '@prisma/client';
import { requireBoardAccess } from '../../../middlewares/boardAccess';
import { validateRequest } from '../../../middlewares/validationRequest';
import { BoardController } from './board.controller';
import { BoardValidation } from './board.validation';

const router = express.Router();

// Create
router.post('/', validateRequest(BoardValidation.createBoardSchema), BoardController.createBoard);

// List boards visible to the caller
router.get('/', BoardController.getBoards);

// Single board (with columns/tasks/members) — any member can view
router.get('/:boardId', requireBoardAccess(BoardRole.VIEWER), BoardController.getBoard);

// Rename / edit description — owner only
router.patch(
  '/:boardId',
  requireBoardAccess(BoardRole.OWNER),
  validateRequest(BoardValidation.updateBoardSchema),
  BoardController.updateBoard,
);

// Delete — owner only
router.delete('/:boardId', requireBoardAccess(BoardRole.OWNER), BoardController.deleteBoard);

export const BoardRouter = router;
