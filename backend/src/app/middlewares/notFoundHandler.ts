import { Request, Response } from 'express';
import httpStatus from 'http-status';

/** Final handler for any route that matched nothing above it. */
const notFoundHandler = (req: Request, res: Response): void => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessage: [{ path: req.originalUrl, message: 'API route not found' }],
  });
};

export default notFoundHandler;
