"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hook/useAuth";
import { RegisterFormValues, registerSchema } from "./_assets/schema/register.schema";

export default function RegisterContainer() {
  const { register, isRegistering } = useAuth();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    await register(values.name, values.email, values.password).catch(() => {});
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground">Start organizing your work</p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <CustomField.Text form={form} name="name" labelName="Name" required />
          <CustomField.Text form={form} name="email" labelName="Email" required />
          <CustomField.Password form={form} name="password" labelName="Password" required mode="validate" />
          <Button type="submit" className="w-full" isLoading={isRegistering}>
            Create account
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
