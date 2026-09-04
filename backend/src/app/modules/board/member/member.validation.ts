import { z } from 'zod';

// OWNER is deliberately excluded — ownership is transferred by convention,
// not granted through the sharing endpoints.
const shareableRole = z.enum(['EDITOR', 'VIEWER']);

export const addMemberSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    role: shareableRole.default('EDITOR'),
  })
  .strict();

// Not .strict() — the frontend's useApiMutation sends a dynamic `path`
// field alongside the body for this call, since the userId isn't known
// until render time. Zod's default (non-strict) parse silently strips
// unrecognized keys instead of rejecting the request.
export const updateMemberSchema = z.object({
  role: shareableRole,
});

export const MemberValidation = { addMemberSchema, updateMemberSchema };
