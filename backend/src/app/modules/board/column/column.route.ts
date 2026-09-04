import express from 'express';
import { BoardRole } from '@prisma/client';
import { requireBoardAccess } from '../../../middlewares/boardAccess';
import { validateRequest } from '../../../middlewares/validationRequest';
import { ColumnController } from './column.controller';
import { ColumnValidation } from './column.validation';

// mergeParams so this router (mounted at /boards/:boardId/columns) can read :boardId
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  requireBoardAccess(BoardRole.EDITOR),
  validateRequest(ColumnValidation.createColumnSchema),
  ColumnController.createColumn,
);

router.patch(
  '/:columnId',
  requireBoardAccess(BoardRole.EDITOR),
  validateRequest(ColumnValidation.updateColumnSchema),
  ColumnController.updateColumn,
);

router.delete('/:columnId', requireBoardAccess(BoardRole.EDITOR), ColumnController.deleteColumn);

export const ColumnRouter = router;
