import { z } from "zod";

export const taskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().max(5000).optional().or(z.literal("")),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
