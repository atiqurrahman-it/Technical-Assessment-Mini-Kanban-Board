"use client";

import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ToastMessageShow } from "@/components/common/toastMessage/toastMessageShow";
import { useAuthStore } from "@/store/authStore";
import { AuthResponse } from "@/types/auth";
import { useApiMutation } from "./TanstackQueries/useApiMutation";

/** Login/register/logout actions, built on `useApiMutation` — `authStore` only holds the resulting state. */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, isAuthenticated, isLoading, setUser, setTokens, clearAuth } = useAuthStore();

  const loginMutation = useApiMutation({
    method: "POST",
    path: "auth/login",
    isSuccessToast: false,
    isErrorToast: false,
    onSuccess: (res: { data: AuthResponse }) => {
      setTokens(res.data.accessToken);
      setUser(res.data.user);
      ToastMessageShow("success", "Logged in successfully");
      void queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/boards");
    },
    onError: (err) => ToastMessageShow("error", err),
  });

  const registerMutation = useApiMutation({
    method: "POST",
    path: "auth/register",
    isSuccessToast: false,
    isErrorToast: false,
    onSuccess: (res: { data: AuthResponse }) => {
      setTokens(res.data.accessToken);
      setUser(res.data.user);
      ToastMessageShow("success", "Account created successfully");
      void queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      router.push("/boards");
    },
    onError: (err) => ToastMessageShow("error", err),
  });

  return {
    user,
    token,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending || registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    login: (email: string, password: string) => loginMutation.mutateAsync({ email, password }),
    register: (name: string, email: string, password: string) =>
      registerMutation.mutateAsync({ name, email, password }),
    signOut: () => {
      clearAuth();
      queryClient.clear();
      ToastMessageShow("success", "Logged out successfully");
      router.push("/login");
    },
  };
}
