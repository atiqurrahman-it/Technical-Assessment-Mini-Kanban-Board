/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/errorHandler.ts
import toast from "react-hot-toast";
import { removeToken, removePreAuthToken, removeStoredUser } from "@/lib/cookie";

export const handleApiError = (error: any) => {
  const status = error?.response?.status;

  if (status === 401) {
    toast.error("Unauthorized. Redirecting to login...");
    removeToken();
    removePreAuthToken();
    removeStoredUser();
    localStorage.clear();
    window.location.href = `/login`;
    return;
  }

  if (status === 403) {
    toast.error("Access denied.");
    window.location.href = "/forbidden";
    return;
  }

  // toast.error(message);

  return false;
  // console.error("API error:", error);
};
