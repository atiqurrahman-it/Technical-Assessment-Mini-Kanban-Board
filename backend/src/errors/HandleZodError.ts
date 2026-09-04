import { ZodError } from 'zod';
import { IGenericErrorMessages } from '../Interface/common';

interface IZodErrorResult {
  statusCode: number;
  message: string;
  errorMessage: IGenericErrorMessages[];
}

const handleZodError = (error: ZodError): IZodErrorResult => ({
  statusCode: 400,
  message: 'Validation error',
  errorMessage: error.issues.map((issue) => ({
    path: issue.path[issue.path.length - 1],
    message: issue.message,
  })),
});

export default handleZodError;
