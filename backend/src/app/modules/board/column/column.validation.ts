import { z } from 'zod';

export const createColumnSchema = z
  .object({
    name: z.string().min(1, 'Column name is required').max(80),
  })
  .strict();

// Not .strict() — the frontend's useApiMutation sends a dynamic `path` field
// alongside the body for update/delete calls (path isn't known until render
// time, so it can't be configured statically like it is for create). Zod's
// default (non-strict) parse silently strips unrecognized keys instead of
// rejecting the request.
export const updateColumnSchema = z
  .object({
    name: z.string().min(1, 'Column name is required').max(80),
  })
  .partial();

export const ColumnValidation = { createColumnSchema, updateColumnSchema };
