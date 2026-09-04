import { z } from 'zod';

export const createTaskSchema = z
  .object({
    columnId: z.string().min(1, 'columnId is required'),
    title: z.string().min(1, 'Task title is required').max(200),
    description: z.string().max(5000).optional(),
  })
  .strict();

// Not .strict() below — the frontend's useApiMutation sends a dynamic `path`
// (and for move, `taskId`) field alongside the body for these calls, since
// the URL isn't known until render time. Zod's default (non-strict) parse
// silently strips unrecognized keys instead of rejecting the request.
export const updateTaskSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
});

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1, 'targetColumnId is required'),
  targetIndex: z.number().int().min(0, 'targetIndex must be 0 or greater'),
});

export const TaskValidation = { createTaskSchema, updateTaskSchema, moveTaskSchema };
