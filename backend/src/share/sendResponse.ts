import { Response } from 'express';
import { IGenericResponse } from '../Interface/common';

/**
 * Every controller success path (and controller-level short-circuit) goes
 * through this — never call `res.json()` directly in a controller.
 */
const sendResponse = <T>(res: Response, data: IGenericResponse<T>): void => {
  res.status(data.statuscode).json({
    statuscode: data.statuscode,
    status: data.status ?? null,
    success: data.success,
    message: data.message || null,
    pagination: data.pagination ?? null,
    data: data.data ?? null,
  });
};

export default sendResponse;
