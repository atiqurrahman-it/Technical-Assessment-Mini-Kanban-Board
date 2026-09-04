/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  DATA_SETS_KEY,
  useDataSetDetail,
} from "@/app/(user-portal)/user/my-data-sets/_assets/services/data-set.service";
import { DialogWrapper } from "@/components/common/dialog/common_dialog";
import { Button } from "@/components/ui/button";
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { getStoredCompanyId } from "@/lib/companyContext";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheetIcon, Loader2, Trash2, UploadIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface UploadFileItem {
  id: string;
  file: File;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

const ALLOWED_TYPES =
  ".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + " " + sizes[i]
  );
}

function isValidFile(file: File): { valid: boolean; reason?: string } {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (!ext || !["xlsx", "xls"].includes(ext)) {
    return {
      valid: false,
      reason: "Only Excel (.xlsx, .xls) files are accepted.",
    };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, reason: `${file.name} exceeds the 50 MB limit.` };
  }
  return { valid: true };
}

// ─── Component ───────────────────────────────────────────────────────────────

interface UploadDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadDataModal({
  open,
  onOpenChange,
}: UploadDataModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<UploadFileItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [uploadedId, setUploadedId] = useState<number | null>(null);
  const prevStatusRef = useRef<string | null>(null);
  const dragCounter = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Upload mutation ──────────────────────────────────────────────────────
  const uploadMutation = useApiMutation({
    method: "POST",
    path: "upload?schema=default",
    dataType: "multipart/form-data",
    isSuccessToast: false,
    isErrorToast: false,
    onSuccess: (data: any) => {
      setApiError(null);
      toast.success("File uploaded successfully!");
      const id = data?.data?.id;
      if (id) setUploadedId(id);
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Upload failed. Please try again.";
      setApiError(msg);
      toast.error(msg);
    },
  });

  // ── Poll processing status after upload ──────────────────────────────────
  const isUploadComplete = uploadedId !== null;
  const { data: detailData } = useDataSetDetail(uploadedId, isUploadComplete);
  const detail = detailData?.data;
  const isProcessing = detail?.status === "processing";

  // When status transitions from processing → completed/failed, refresh the list
  useEffect(() => {
    if (!isUploadComplete) return;
    const currentStatus = detail?.status;
    if (!currentStatus) return;

    const prevStatus = prevStatusRef.current;
    prevStatusRef.current = currentStatus;

    if (prevStatus === "processing" && currentStatus !== "processing") {
      queryClient.invalidateQueries({ queryKey: [DATA_SETS_KEY] });
    }
  }, [detail?.status, isUploadComplete, queryClient]);

  // ── Add file (single file upload only) ────────────────────────────────
  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    if (arr.length === 0) return;

    // Single file upload — use only the first selected/dropped file
    if (arr.length > 1) {
      toast("Only one file can be uploaded at a time. Keeping the first file.");
    }

    const file = arr[0];
    const check = isValidFile(file);
    if (!check.valid) {
      toast.error(check.reason!);
      return;
    }

    // Replace any previously selected file with the new one
    setFiles([
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        progress: 0,
        status: "pending",
      },
    ]);
  }, []);

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragging(false);
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files);
      }
    },
    [addFiles],
  );

  // ── File input change ────────────────────────────────────────────────────
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files);
      }
      // Reset so same file can be re-selected
      e.target.value = "";
    },
    [addFiles],
  );

  // ── Remove file ──────────────────────────────────────────────────────────
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  }, []);

  // ── Upload all pending files ────────────────────────────────────────────
  const handleUploadAll = useCallback(() => {
    const pending = files.filter((f) => f.status === "pending");
    if (pending.length === 0) {
      toast("No pending files to upload.");
      return;
    }

    // super_admin needs to include companyId in the request
    const companyId =
      user?.role === "super_admin" ? getStoredCompanyId() : null;

    pending.forEach((fileItem) => {
      // Mark as uploading
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileItem.id
            ? { ...f, status: "uploading", progress: 10 }
            : f,
        ),
      );

      const formData = new FormData();
      formData.append("file", fileItem.file);

      // Include companyId for super_admin uploads
      if (companyId) {
        formData.append("companyId", companyId);
      }

      uploadMutation.mutate(formData, {
        onSuccess: () => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id
                ? { ...f, status: "completed", progress: 100 }
                : f,
            ),
          );
        },
        onError: () => {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === fileItem.id ? { ...f, status: "error", progress: 0 } : f,
            ),
          );
        },
      });
    });
  }, [files, uploadMutation, user?.role]);

  // ── Close & reset ────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    onOpenChange(false);
    // Reset after dialog closes
    setTimeout(() => {
      setFiles([]);
      setIsDragging(false);
      setApiError(null);
      setUploadedId(null);
      prevStatusRef.current = null;
      dragCounter.current = 0;
    }, 300);
  }, [onOpenChange]);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const isUploading = uploadingCount > 0;

  const statusColorMap: Record<string, string> = {
    completed:
      "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    processing:
      "bg-amber-500/20 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    failed: "bg-red-500/20 text-red-700 dark:bg-red-500/20 dark:text-red-400",
    pending:
      "bg-slate-500/20 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400",
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <DialogWrapper
      open={open}
      handleOpen={(val) => {
        if (!isUploading) {
          if (!val) handleClose();
          else onOpenChange(val);
        }
      }}
      title="Upload Data"
      style="sm:max-w-lg"
    >
      <div className="space-y-5">
        {/* ── Drop zone (hidden after upload completes) ──────────────────── */}
        {!isUploadComplete && (
          <div
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragging
                ? "border-[#08F] bg-[#08F]/5"
                : "border-gray-300 dark:border-gray-600 hover:border-[#08F]/50",
            )}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ALLOWED_TYPES}
              className="hidden"
              onChange={handleInputChange}
            />
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#08F]/10">
              <div>
                <Image
                  src="/assest/logo/upload-file/UploadFile.svg"
                  alt="Upload"
                  width={130}
                  height={130}
                />
              </div>
            </div>
            <p className="mb-1 text-sm font-semibold text-[#000855] dark:text-white">
              {isDragging
                ? "Drop your file here"
                : "Drag & drop your file here"}
            </p>
            <span className="py-3">or</span>
            <p className=" text-xs text-gray-500 dark:text-gray-400">
              <span className="text-[#08F]">Click to browse</span>
            </p>
            <p className="mt-2 text-[11px] text-gray-400 dark:text-gray-500">
              Accepted format: <strong>.xlsx</strong>, <strong>.xls</strong>,
              &nbsp;|&nbsp; Max: 50 MB
            </p>
          </div>
        )}

        {/* ── File list (before upload) ──────────────────────────────────── */}
        {!isUploadComplete && files.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-[#000855] dark:text-white">
                Selected File
              </p>
            </div>

            <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
              {files.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-green-50 dark:bg-green-900/20">
                    <FileSpreadsheetIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#000855] dark:text-white">
                      {item.file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatBytes(item.file.size)}
                    </p>

                    {item.status === "error" && (
                      <p className="mt-0.5 text-xs text-red-500">
                        Upload failed
                      </p>
                    )}
                  </div>

                  {/* Status / remove */}
                  <div className="flex flex-shrink-0 items-center gap-1">
                    {item.status === "completed" && (
                      <span className="text-xs font-medium text-green-600 dark:text-green-400">
                        ✓ Done
                      </span>
                    )}

                    {(item.status === "pending" || item.status === "error") && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(item.id);
                        }}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Processing progress (shown after upload completes) ───────── */}
        {isUploadComplete && detail && (
          <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <p className="text-sm font-medium text-[#000855] dark:text-white">
              Processing Status
            </p>

            {/* Filename */}
            <div>
              <p className="font-['Inter'] text-[12px] font-medium uppercase tracking-wide text-[#000855]/50 dark:text-white/50">
                Filename
              </p>
              <p className="mt-0.5 font-['Inter'] text-[15px] font-semibold text-[#000855] dark:text-white">
                {detail.filename}
              </p>
            </div>

            {/* Status + File Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-['Inter'] text-[12px] font-medium uppercase tracking-wide text-[#000855]/50 dark:text-white/50">
                  Status
                </p>
                <span
                  className={`mt-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-medium ${statusColorMap[detail.status] || statusColorMap.pending}`}
                >
                  {detail.status.charAt(0).toUpperCase() +
                    detail.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="font-['Inter'] text-[12px] font-medium uppercase tracking-wide text-[#000855]/50 dark:text-white/50">
                  File Type
                </p>
                <p className="mt-1 font-['Inter'] text-[15px] text-[#000855] dark:text-white">
                  {detail.fileType.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Row counts */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-['Inter'] text-[12px] font-medium uppercase tracking-wide text-[#000855]/50 dark:text-white/50">
                  Total Rows
                </p>
                <p className="mt-0.5 font-['Inter'] text-[15px] text-[#000855] dark:text-white">
                  {(detail.totalRows ?? detail.rowCount ?? 0).toLocaleString(
                    "en-US",
                  )}
                </p>
              </div>
              <div>
                <p className="font-['Inter'] text-[12px] font-medium uppercase tracking-wide text-[#000855]/50 dark:text-white/50">
                  Processed Rows
                </p>
                <p className="mt-0.5 font-['Inter'] text-[15px] text-[#000855] dark:text-white">
                  {(detail.processedRows ?? 0).toLocaleString("en-US")}
                </p>
              </div>
            </div>

            {/* Progress bar */}
            {isProcessing &&
              detail.processedRows != null &&
              detail.totalRows != null && (
                <div className="w-full">
                  <div className="mb-1 flex items-center justify-between font-['Inter'] text-[13px] text-[#000855]/70 dark:text-white/70">
                    <span>Processing rows...</span>
                    <span>
                      {detail.totalRows > 0
                        ? Math.round(
                            (detail.processedRows / detail.totalRows) * 100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#0088ff] transition-all duration-500"
                      style={{
                        width: `${detail.totalRows > 0 ? Math.round((detail.processedRows / detail.totalRows) * 100) : 0}%`,
                      }}
                    />
                  </div>
                  <p className="mt-1 font-['Inter'] text-[12px] text-[#000855]/60 dark:text-white/60">
                    {detail.processedRows.toLocaleString("en-US")} /{" "}
                    {detail.totalRows.toLocaleString("en-US")} rows
                  </p>
                </div>
              )}

            {/* Error message */}
            {detail.errorMsg && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
                <p className="font-['Inter'] text-[12px] font-medium uppercase tracking-wide text-red-600 dark:text-red-400">
                  Error
                </p>
                <p className="mt-1 font-['Inter'] text-[13px] text-red-700 dark:text-red-300">
                  {detail.errorMsg}
                </p>
              </div>
            )}

            {/* Processing spinner */}
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-[#08F]">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing...</span>
              </div>
            )}

            {/* write message  */}
            <div className="space-y-1">
              <p className="text-base font-semibold text-[#000855] dark:text-white">
                Upload Complete!
              </p>

              <p className="text-sm text-[#51658f] dark:text-blue-100/70">
                Your file has been uploaded successfully. You can safely close
                this modal. Processing will continue in the background. Visit{" "}
                <Link
                  href="/user/my-data-sets"
                  className="font-medium text-[#08F] underline underline-offset-2 hover:text-[#000855] dark:hover:text-white"
                >
                  My Data Sets
                </Link>{" "}
                to check the progress and view the details.
              </p>
            </div>
          </div>
        )}

        {/* ── Actions ──────────────────────────────────────────────────────── */}

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isUploading}
            className="cursor-pointer"
          >
            {isUploadComplete ? "Close" : "Close"}
          </Button>

          {!isUploadComplete && (
            <Button
              type="button"
              onClick={handleUploadAll}
              disabled={pendingCount === 0 || isUploading}
              className="cursor-pointer bg-[#08F] text-white hover:bg-[#0077E6]"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadIcon className="mr-1.5 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          )}
        </div>
        {/* ── API Error message ───────────────────────────────────────── */}
        {apiError && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-400">
            <p className="font-medium">{apiError}</p>
          </div>
        )}
      </div>
    </DialogWrapper>
  );
}
