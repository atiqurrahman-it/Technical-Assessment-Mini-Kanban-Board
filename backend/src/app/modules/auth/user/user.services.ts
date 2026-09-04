import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import httpStatus from 'http-status';
import prisma from '../../../lib/db';
import config from '../../../config';
import { ApiError } from '../../../../errors/ApiErrors';

const SALT_ROUNDS = 10;

const signToken = (userId: string, email: string): string =>
  jwt.sign({ id: userId, email }, config.jwt_secret, {
    expiresIn: config.jwt_expires_in,
  } as jwt.SignOptions);

const register = async (payload: { name: string; email: string; password: string }) => {
  const existing = await prisma.user.findUnique({ where: { email: payload.email } });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, 'An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(payload.password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name: payload.name, email: payload.email, passwordHash },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken: signToken(user.id, user.email),
  };
};

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  const passwordMatches = await bcrypt.compare(payload.password, user.passwordHash);
  if (!passwordMatches) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid email or password');
  }

  return {
    user: { id: user.id, name: user.name, email: user.email },
    accessToken: signToken(user.id, user.email),
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return { id: user.id, name: user.name, email: user.email };
};

/** Looks up a registered user by email — used when sharing a board with someone. */
const findByEmail = (email: string) => prisma.user.findUnique({ where: { email } });

export const UserService = { register, login, getMe, findByEmail };
