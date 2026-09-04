"use client";

import { useAuth } from "@/hook/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Protected({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
