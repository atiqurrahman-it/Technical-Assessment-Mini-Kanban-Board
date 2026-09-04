"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { CustomField } from "@/components/common/fields/cusInputField";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hook/useAuth";
import { LoginFormValues, loginSchema } from "./_assets/schema/login.schema";

export default function LoginContainer() {
  const { login, isLoggingIn } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    await login(values.email, values.password).catch(() => {
      // useAuth's mutation already surfaces the error toast.
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LayoutDashboard className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your boards</p>
        </div>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <CustomField.Text form={form} name="email" labelName="Email" required />
          <CustomField.Password form={form} name="password" labelName="Password" required />
          <Button type="submit" className="w-full" isLoading={isLoggingIn}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
