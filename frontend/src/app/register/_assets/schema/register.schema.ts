import passwordValidation from "@/components/common/schema/passwordValidation";
import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: passwordValidation,
});

export type RegisterFormValues = z.infer<typeof registerSchema>;
