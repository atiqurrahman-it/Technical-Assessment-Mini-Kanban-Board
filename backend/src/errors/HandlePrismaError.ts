import { Prisma } from '@prisma/client';
import { IGenericErrorMessages } from '../Interface/common';

interface IPrismaErrorResult {
  statusCode: number;
  message: string;
  errorMessage: IGenericErrorMessages[];
}

/** Maps the handful of Prisma error codes we actually hit to a clean API error shape. */
export const handlePrismaError = (
  error: Prisma.PrismaClientKnownRequestError,
): IPrismaErrorResult => {
  switch (error.code) {
    case 'P2002': {
      const target = (error.meta?.target as string[] | undefined)?.join(', ') || 'field';
      return {
        statusCode: 409,
        message: `A record with this ${target} already exists`,
        errorMessage: [{ path: target, message: 'Duplicate value' }],
      };
    }
    case 'P2025':
    case 'P2001':
      return {
        statusCode: 404,
        message: 'Record not found',
        errorMessage: [{ path: '', message: (error.meta?.cause as string) || 'Not found' }],
      };
    case 'P2003':
      return {
        statusCode: 400,
        message: 'Invalid reference to a related record',
        errorMessage: [{ path: (error.meta?.field_name as string) || '', message: error.message }],
      };
    default:
      return {
        statusCode: 500,
        message: 'Database error',
        errorMessage: [{ path: '', message: error.message }],
      };
  }
};
