import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(1, "Board name is required").max(120),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;
