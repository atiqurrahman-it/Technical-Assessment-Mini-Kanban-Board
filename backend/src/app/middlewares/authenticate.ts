import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import { ApiError } from '../../errors/ApiErrors';
import { IJwtPayload } from '../lib/type';
import config from '../config';
import prisma from '../lib/db';
import catchAsync from '../../share/catchAsync';

/**
 * Verifies the `Authorization: Bearer <token>` header, re-checks the user
 * still exists (a JWT alone can outlive an account), and attaches the
 * decoded identity to `req.user`.
 */
const authenticate = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication token is required');
  }

  let payload: IJwtPayload;
  try {
    payload = jwt.verify(token, config.jwt_secret) as IJwtPayload;
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid or expired token');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'User no longer exists');
  }

  req.user = { id: user.id, email: user.email };
  next();
});

export default authenticate;
