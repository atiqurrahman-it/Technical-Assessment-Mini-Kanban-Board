import { ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { ApiError } from '../../errors/ApiErrors';
import { handlePrismaError } from '../../errors/HandlePrismaError';
import handleZodError from '../../errors/HandleZodError';
import { IGenericErrorMessages } from '../../Interface/common';
import { errorLogger } from '../../share/logger';
import config from '../config';

/**
 * Registered last in app.ts. Every thrown/rejected error in the app funnels
 * here (via catchAsync or Express's own sync-error handling) and comes out
 * as one consistent JSON shape.
 */
const globalErrorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  errorLogger.error(error?.message || 'Unknown error', error);

  let statusCode = 500;
  let message = 'Something went wrong!';
  let errorMessage: IGenericErrorMessages[] = [];

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const handled = handlePrismaError(error);
    statusCode = handled.statusCode;
    message = handled.message;
    errorMessage = handled.errorMessage;
  } else if (error instanceof ZodError) {
    const handled = handleZodError(error);
    statusCode = handled.statusCode;
    message = handled.message;
    errorMessage = handled.errorMessage;
  } else if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    errorMessage = [{ path: '', message: error.message }];
  } else if (error instanceof Error) {
    message = error.message;
    errorMessage = [{ path: '', message: error.message }];
  }

  const responseBody: Record<string, unknown> = { success: false, message, errorMessage };
  if (config.env === 'development' && error?.stack) {
    responseBody.stack = error.stack;
  }

  res.status(statusCode).json(responseBody);
};

export default globalErrorHandler;
