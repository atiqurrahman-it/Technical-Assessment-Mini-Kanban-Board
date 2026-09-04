import express from 'express';
import { UserRouter } from './user/user.route';

const router = express.Router();

const AuthRoutes = [{ path: '/', router: UserRouter }];

AuthRoutes.forEach((route) => router.use(route.path, route.router));

export const AuthRouter = router;
