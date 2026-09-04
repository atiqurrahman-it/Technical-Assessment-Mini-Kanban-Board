/* eslint-disable @typescript-eslint/no-explicit-any */

import { ToastMessageShow } from "@/components/common/toastMessage/toastMessageShow";
import { useAuthStore } from "@/store/authStore";
import { RemoveEmptyFields } from "@/utils/inputFiled/RemoveEmptyFields";
import { useMutation } from "@tanstack/react-query";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

type MutationConfig = {
  safe?: boolean;
  method: "POST" | "PATCH" | "DELETE" | "PUT";
  path?: string;
  token?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any, variables: any, context: any) => void;
  dataType?: "application/json" | "multipart/form-data";
  responseType?: "json" | "blob" | "arraybuffer" | "text";
  isSuccessToast?: boolean;
  isErrorToast?: boolean;
  /** Optional optimistic-update hooks, passed straight through to useMutation — used by move/reorder actions. */
  onMutate?: (variables: any) => any;
  onSettled?: () => void;
};

/**
 * The one hook every POST/PATCH/PUT/DELETE goes through. `path` can be set
 * here (static endpoints) or per-call via `mutate({ path: ..., ...body })`
 * (endpoints whose URL isn't known until the caller has an id) — either way
 * it's stripped from the JSON body server-side, since our Zod schemas parse
 * with unknown keys stripped rather than `.strict()`.
 */
export const useApiMutation = ({
  responseType = "json",
  safe = true,
  method,
  path: explicitPath,
  token: explicitToken,
  onSuccess,
  onError,
  onMutate,
  onSettled,
  dataType,
  isSuccessToast = true,
  isErrorToast = true,
}: MutationConfig) => {
  const { token: authToken } = useAuthStore();
  const token = explicitToken || authToken || "";

  return useMutation({
    mutationFn: async (Body: any) => {
      const path = explicitPath || Body.path;

      const response = await fetch(`${API_URL}/${path}`, {
        method,
        headers:
          dataType === "multipart/form-data"
            ? { Authorization: `Bearer ${token}` }
            : { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:
          dataType === "multipart/form-data"
            ? Body
            : JSON.stringify(safe ? RemoveEmptyFields(Body) : Body),
      });

      let parsedData;
      if (responseType === "blob") parsedData = await response.blob();
      else if (responseType === "arraybuffer") parsedData = await response.arrayBuffer();
      else if (responseType === "text") parsedData = await response.text();
      else parsedData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw { response: { status: response.status, data: parsedData } };
      }
      return parsedData;
    },

    onMutate,
    onSettled,

    onSuccess: (data) => {
      onSuccess?.(data);
      if (isSuccessToast) ToastMessageShow("success", data);
    },
    onError: (error: any, variables, context) => {
      onError?.(error, variables, context);
      if (isErrorToast) ToastMessageShow("error", error);
    },
  });
};
