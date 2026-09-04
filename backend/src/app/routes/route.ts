import express from 'express';
import { AuthRouter } from '../modules/auth/route';
import { BoardModuleRouter } from '../modules/board/route';

const router = express.Router();

const modulesRoute = [
  { path: '/auth', router: AuthRouter },
  { path: '/boards', router: BoardModuleRouter },
];

modulesRoute.forEach((route) => router.use(route.path, route.router));

export default router;
