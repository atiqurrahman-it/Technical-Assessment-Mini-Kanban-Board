import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Validates `req.body` against a Zod schema and replaces it with the parsed
 * (type-coerced, unknown-keys-stripped) result. Applied inline per write
 * route: `router.post('/', validateRequest(schema), Controller.create)`.
 */
export const validateRequest =
  (schema: AnyZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body);
    next();
  };
