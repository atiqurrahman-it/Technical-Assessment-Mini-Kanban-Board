/** Standard success/data envelope every controller responds with via `sendResponse`. */
export interface IGenericResponse<T> {
  statuscode: number;
  success: boolean;
  status?: string | null;
  message?: string | null;
  pagination?: {
    currentPage?: number;
    perPage?: number;
    totalItems?: number;
    totalPages?: number;
  } | null;
  data?: T | null;
}

/** Standard error envelope produced by the global error handler. */
export interface IGenericErrorResponse {
  success: false;
  message: string;
  errorMessage: IGenericErrorMessages[];
  stack?: string;
}

export interface IGenericErrorMessages {
  path: string | number;
  message: string;
}
