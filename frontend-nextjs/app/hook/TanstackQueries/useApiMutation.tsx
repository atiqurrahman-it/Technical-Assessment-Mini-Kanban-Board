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
  onError?: (error: any) => void;
  dataType?: "application/json" | "multipart/form-data";
  responseType?: "json" | "blob" | "arraybuffer" | "text";
  isSuccessToast?: boolean;
  isErrorToast?: boolean;
};

export const useApiMutation = ({
  responseType = "json",
  safe = true,
  method,
  path: explicitPath,
  token: explicitToken,
  onSuccess,
  onError,
  dataType,
  isSuccessToast = true,
  isErrorToast = true,
}: MutationConfig) => {
  const { token: authToken } = useAuthStore();
  const token = explicitToken || authToken || "";

  return useMutation({
    mutationFn: async (Body: any) => {
      const path = explicitPath || Body.path;

      try {
        const response = await fetch(`${API_URL}/${path}`, {
          method,
          headers:
            dataType === "multipart/form-data"
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
          body:
            dataType === "multipart/form-data"
              ? Body
              : JSON.stringify(safe ? RemoveEmptyFields(Body) : Body),
        });

        let parsedData;
        if (responseType === "blob") {
          parsedData = await response.blob();
        } else if (responseType === "arraybuffer") {
          parsedData = await response.arrayBuffer();
        } else if (responseType === "text") {
          parsedData = await response.text();
        } else {
          parsedData = await response.json().catch(() => ({}));
        }

        if (!response.ok) {
          console?.error("API mutation error", parsedData);
          throw {
            response: {
              status: response.status,
              data: parsedData,
            },
          };
        }
        return parsedData;
      } catch (error: any) {
        throw error;
      }
    },

    onSuccess: (data) => {
      // Always call the custom onSuccess if provided (e.g. for query invalidation)
      if (onSuccess) {
        onSuccess(data);
      }
      // Show success toast unless explicitly disabled
      if (isSuccessToast) {
        ToastMessageShow("success", data);
      }
    },
    onError: (error: any) => {
      console.error("API mutation error:", error);

      // Always call the custom onError if provided
      if (onError) {
        onError(error);
      }
      // Show error toast unless explicitly disabled
      if (isErrorToast) {
        ToastMessageShow("error", error);
      }
    },
  });
};
