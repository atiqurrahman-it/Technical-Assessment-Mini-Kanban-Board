"use client";

import { ToastMessageShow } from "@/components/common/toastMessage/toastMessageShow";
import { useAuthStore } from "@/store/authStore";
import type {
  LoginResponse,
  MfaResendResponse,
  MfaVerifyResponse,
} from "@/types/auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_URL}/${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw { response: { status: res.status, data } };
  }

  return data as T;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    user,
    token,
    preAuthToken,
    isAuthenticated,
    isLoading,
    setUser,
    setTokens,
    clearAuth,
  } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: { email: string; password: string }) =>
      apiRequest<LoginResponse>("auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      setTokens("", data.preAuthToken);
      setUser(data.user);
      ToastMessageShow("success", "Login successful");
      router.push("/verify-otp");
    },
    onError: (err: unknown) => {
      ToastMessageShow("error", err);
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: (payload: { code: string }) =>
      apiRequest<MfaVerifyResponse>("auth/mfa/verify", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${preAuthToken}`,
        },
      }),
    onSuccess: (data) => {
      setTokens(data.data.token);
      setUser(data.data.user);
      ToastMessageShow("success", "Verification successful");
      void queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      const dashboardPath =
        data.data.user.role === "super_admin"
          ? "/super-admin"
          : data.data.user.role === "company_admin"
            ? "/company-portal"
            : "/user/my-dashboard";
      router.push(dashboardPath);
    },
    onError: (err: unknown) => {
      ToastMessageShow("error", err);
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: () =>
      apiRequest<MfaResendResponse>("auth/mfa/resend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${preAuthToken}`,
        },
      }),
    onSuccess: (data) => {
      ToastMessageShow("success", data.message || "Verification code resent");
    },
    onError: (err: unknown) => {
      ToastMessageShow("error", err);
    },
  });

  // /auth/me is now called automatically inside AuthProvider

  return {
    user,
    token,
    preAuthToken,
    isAuthenticated,
    isLoading: isLoading || loginMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isVerifyingOtp: verifyOtpMutation.isPending,
    isResendingOtp: resendOtpMutation.isPending,
    login: loginMutation.mutate,
    verifyOtp: verifyOtpMutation.mutate,
    resendOtp: resendOtpMutation.mutate,
    // refetchUserProfile is handled automatically by AuthProvider,
    signOut: () => {
      clearAuth();
      queryClient.clear();
      ToastMessageShow("success", "Logged out successfully");
      router.push("/login");
    },
  };
}
