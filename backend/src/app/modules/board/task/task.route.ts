import express from 'express';
import { BoardRole } from '@prisma/client';
import { requireBoardAccess } from '../../../middlewares/boardAccess';
import { validateRequest } from '../../../middlewares/validationRequest';
import { TaskController } from './task.controller';
import { TaskValidation } from './task.validation';

// mergeParams so this router (mounted at /boards/:boardId/tasks) can read :boardId
const router = express.Router({ mergeParams: true });

router.post(
  '/',
  requireBoardAccess(BoardRole.EDITOR),
  validateRequest(TaskValidation.createTaskSchema),
  TaskController.createTask,
);

router.patch(
  '/:taskId',
  requireBoardAccess(BoardRole.EDITOR),
  validateRequest(TaskValidation.updateTaskSchema),
  TaskController.updateTask,
);

router.delete('/:taskId', requireBoardAccess(BoardRole.EDITOR), TaskController.deleteTask);

// The Task Movement API — reorder within a column or move across columns.
router.patch(
  '/:taskId/move',
  requireBoardAccess(BoardRole.EDITOR),
  validateRequest(TaskValidation.moveTaskSchema),
  TaskController.moveTask,
);

export const TaskRouter = router;
