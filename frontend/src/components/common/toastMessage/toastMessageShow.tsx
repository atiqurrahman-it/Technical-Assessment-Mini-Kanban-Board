/* eslint-disable @typescript-eslint/no-explicit-any */
// utils/toast.ts
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import toast, { ToastOptions } from "react-hot-toast";
import { ToastMessageChange } from "./customMessageOrChangeMessage";

/**
 * Available toast notification types
 */
type ToastType = "success" | "error" | "loading" | "custom";

/**
 * Extended toast options including custom flags
 */
type ExtendedToastOptions = ToastOptions & {
  textFormat?: boolean;
  changeMessage?: boolean;
};

/**
 * Default toast configuration
 */
const defaultOptions: ExtendedToastOptions = {
  duration: 3000, // 3 seconds
  position: "top-center",
  textFormat: true,
  changeMessage: false,
};

/**
 * ToastMessageShow
 *
 *  Purpose:
 * Wrapper around `react-hot-toast` to display success, error, loading, or custom messages.
 * Supports message extraction, case formatting, and custom message transformation.
 *
 * @param type - The type of toast ("success" | "error" | "loading" | "custom")
 * @param message - The toast message (string or object, e.g. API error response)
 * @param options - Extended options (react-hot-toast options + textFormat + changeMessage)
 *
 * @returns void (displays a toast, does not return anything)
 *
 *  Example usage:
 * ```
 * ToastMessageShow("success", "Profile updated successfully");
 * ToastMessageShow("error", apiErrorResponse);
 * ToastMessageShow("error", "Something went wrong", { duration: 5000, changeMessage: true });
 * ToastMessageShow("loading", "Saving changes...", { textFormat: false });
 * ToastMessageShow("custom", "Welcome back!", { duration: 5000 });
 * ```
 */
export const ToastMessageShow = (
  type: ToastType,
  message: any,
  options: ExtendedToastOptions = {},
) => {
  const { textFormat, changeMessage, ...toastOptions } = {
    ...defaultOptions,
    ...options,
  };

  const MessageHandler = (msg: string) => {
    let finalMessage = msg;
    if (changeMessage) {
      finalMessage = ToastMessageChange(finalMessage);
    }
    if (textFormat) {
      finalMessage = LabelAndPlaceholderTextFormat(finalMessage);
    }
    return finalMessage;
  };

  switch (type) {
    case "success":
      if (typeof message !== "string") {
        message =
          message?.data?.message || message?.message || "Successfully updated";
      }
      message = MessageHandler(message);
      toast.success(message, toastOptions);
      break;

    case "error":
      if (typeof message !== "string") {
        message =
          message?.response?.data?.message ||
          message?.response?.message ||
          message?.data?.message ||
          message?.message ||
          message?.Prisma ||
          "Something went wrong";
      }
      message = MessageHandler(message);
      toast.error(message, toastOptions);
      break;

    case "loading":
      message = MessageHandler(message);
      toast.loading(message, toastOptions);
      break;

    case "custom":
      message = MessageHandler(message);
      toast(message, toastOptions);
      break;

    default:
      message = MessageHandler(message);
      toast(message, toastOptions);
  }
};

/**
 * Shortcut: Show a success toast
 *
 * @example
 * toastSuccessMessage("Profile saved!");
 * toastSuccessMessage("Saved!", { duration: 5000 });
 */
export const toastSuccessMessage = (msg: any, options?: ExtendedToastOptions) =>
  ToastMessageShow("success", msg, options);

/**
 * Shortcut: Show an error toast
 *
 * @example
 * toastErrorMessage("Failed to save profile");
 * toastErrorMessage("Something went wrong", { duration: 5000, changeMessage: true });
 */
export const toastErrorMessage = (msg: any, options?: ExtendedToastOptions) =>
  ToastMessageShow("error", msg, options);

/**
 * Shortcut: Show a loading toast
 *
 * @example
 * toastLoadingMessage("Uploading...");
 * toastLoadingMessage("Loading data...", { textFormat: false });
 */
export const toastLoadingMessage = (msg: any, options?: ExtendedToastOptions) =>
  ToastMessageShow("loading", msg, options);

/**
 * Shortcut: Show a custom toast
 *
 * @example
 * toastCustomMessage("Welcome back!", { duration: 5000 });
 */
export const toastCustomMessage = (msg: any, options?: ExtendedToastOptions) =>
  ToastMessageShow("custom", msg, options);
