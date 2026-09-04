import express from 'express';
import authenticate from '../../middlewares/authenticate';
import { BoardRouter } from './board/board.route';
import { ColumnRouter } from './column/column.route';
import { MemberRouter } from './member/member.route';
import { TaskRouter } from './task/task.route';

const router = express.Router();

// Every route under /boards requires a logged-in user; per-board
// authorization (owner/editor/viewer) is enforced separately by
// `requireBoardAccess` inside each feature router.
router.use(authenticate);

const BoardModuleRoutes = [
  // Nested routers use `mergeParams: true` so they can read `:boardId` from
  // this mount path — order matters: the most specific paths first.
  { path: '/:boardId/members', router: MemberRouter },
  { path: '/:boardId/columns', router: ColumnRouter },
  { path: '/:boardId/tasks', router: TaskRouter },
  { path: '/', router: BoardRouter },
];

BoardModuleRoutes.forEach((route) => router.use(route.path, route.router));

export const BoardModuleRouter = router;
