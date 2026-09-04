// "use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import {
  formatBytes,
  useFileUpload,
  type FileMetadata,
  type FileWithPreview,
} from "@/hook/document/use-file-upload";
import { cn } from "@/lib/utils";
import {
  FileArchiveIcon,
  FileSpreadsheetIcon,
  FileTextIcon,
  HeadphonesIcon,
  ImageIcon,
  RefreshCwIcon,
  TriangleAlert,
  UploadIcon,
  VideoIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Controller } from "react-hook-form";

import useGetDocumentUrl from "@/hook/common/all-fetch-hook/useGetDocumentUrl";
import { useApiMutation } from "@/hook/TanstackQueries/useApiMutation";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import { InputInterface } from "../interface/inputPropsType";
import DocumentView from "../modal/documentView";

interface UploadFileItem extends FileWithPreview {
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

const DocumentUpload = ({
  form,
  name,
  labelName,
  placeholder,
  required = false,
  viewOnly = false,
  disabled = false,
  disableLabelFormatting = false,
  customMessage,
  onValueChange,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024,
  accept = "*",
  multiple = false,
}: InputInterface["DocumentUpload"] & {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
}) => {
  if (multiple == false) {
    maxFiles = 1;
  }
  const placeholderText = disableLabelFormatting
    ? placeholder || labelName
    : LabelAndPlaceholderTextFormat(placeholder || labelName || "");

  const [uploadFiles, setUploadFiles] = useState<UploadFileItem[]>([]);
  const uploadQueue = useRef<Set<string>>(new Set());
  const progressIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const [previewFile, setPreviewFile] = useState<{
    name: string;
    path: string;
    type?: string;
  } | null>(null);
  const fieldValue = form.watch(name);

  const { data: previewDoc } = useGetDocumentUrl({
    rowImageUrl: previewFile?.path,
  });

  const previewUrl = previewDoc?.data?.url;

  const uploadMutation = useApiMutation({
    method: "POST",
    path: "student-portal/uploads",
    dataType: "multipart/form-data",
    onSuccess: (data: any) => {
      if (data?.statusCode === 200) {
        const responsePath = JSON.parse(data?.data?.path)?.path;
        handleUploadSuccess(responsePath);
      } else {
        handleUploadError("Upload failed. Please try again.");
      }
    },
    onError: () => {
      handleUploadError("Upload failed. Please try again.");
    },
  });

  const handlePreview = (fileItem: UploadFileItem) => {
    if (fileItem.status !== "completed") return;

    const formValue = form.getValues(name);

    let filePath = "";

    if (multiple) {
      const index = uploadFiles.findIndex((f) => f.id === fileItem.id);
      filePath = formValue?.[index];
    } else {
      filePath = formValue;
    }

    if (!filePath) return;

    setPreviewFile({
      name: fileItem.file?.name || fileItem.name,
      path: filePath,
      type: fileItem.file?.type || fileItem.type,
    });
  };

  const getInitialFiles = (): FileMetadata[] => {
    if (!fieldValue) return [];
    if (multiple && Array.isArray(fieldValue)) {
      return fieldValue.map((path, idx) => ({
        id: `initial-${idx}`,
        name: path.split("/").pop() || "file",
        size: 0,
        type: "application/octet-stream",
        url: "",
      }));
    } else if (!multiple && typeof fieldValue === "string" && fieldValue) {
      return [
        {
          id: "initial-0",
          name: fieldValue.split("/").pop() || "file",
          size: 0,
          type: "application/octet-stream",
          url: "",
        },
      ];
    }
    return [];
  };

  const [
    { isDragging, errors },
    {
      removeFile,
      clearFiles,
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      getInputProps,
    },
  ] = useFileUpload({
    maxFiles,
    maxSize,
    accept,
    multiple,
    initialFiles: getInitialFiles(),
    onFilesChange: (newFiles: FileWithPreview[]) => {
      setUploadFiles((prev) => {
        const merged = newFiles.map((file) => {
          const existing = prev.find((f) => f.id === file.id);
          if (existing) return { ...existing, ...file };
          return {
            ...file,
            progress: 0,
            status: "pending",
          } as UploadFileItem;
        });
        return merged;
      });
    },
  });

  useEffect(() => {
    if (viewOnly || disabled) return;
    if (uploadMutation.isPending) return;

    const nextPending = uploadFiles.find((f) => f.status === "pending");
    if (nextPending) {
      startUpload(nextPending);
    }
  }, [uploadFiles, uploadMutation.isPending, viewOnly, disabled]);

  const startUpload = (file: UploadFileItem) => {
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === file.id ? { ...f, status: "uploading", progress: 10 } : f,
      ),
    );

    const interval = setInterval(() => {
      setUploadFiles((prev) =>
        prev.map((f) => {
          if (f.id !== file.id || f.status !== "uploading") return f;
          const newProgress = Math.min(f.progress + Math.random() * 15 + 5, 90);
          return { ...f, progress: newProgress };
        }),
      );
    }, 500);
    progressIntervals.current.set(file.id, interval);

    const formData = new FormData();
    formData.append("file", file.file);

    uploadMutation.mutate(formData, {
      onSuccess: (data: any) => {
        const int = progressIntervals.current.get(file.id);
        if (int) clearInterval(int);
        progressIntervals.current.delete(file.id);

        if (data?.statusCode === 200) {
          const responsePath = JSON.parse(data?.data?.path)?.path;
          setUploadFiles((prev) =>
            prev.map((f) =>
              f.id === file.id
                ? { ...f, progress: 100, status: "completed", error: undefined }
                : f,
            ),
          );
          updateFormValue(responsePath);
        } else {
          handleUploadErrorForFile(file.id, "Upload failed. Please try again.");
        }
      },
      onError: () => {
        const int = progressIntervals.current.get(file.id);
        if (int) clearInterval(int);
        progressIntervals.current.delete(file.id);
        handleUploadErrorForFile(file.id, "Upload failed. Please try again.");
      },
    });
  };

  const handleUploadErrorForFile = (fileId: string, errorMsg: string) => {
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, status: "error", error: errorMsg, progress: 0 }
          : f,
      ),
    );
  };

  const handleUploadSuccess = (path: string) => {
  };

  const handleUploadError = (errorMsg: string) => {
    const uploadingId = uploadFiles.find((f) => f.status === "uploading")?.id;
    if (uploadingId) {
      handleUploadErrorForFile(uploadingId, errorMsg);
    }
  };

  const updateFormValue = (path: string) => {
    if (multiple) {
      const current = form.getValues(name) || [];
      const newValue = Array.isArray(current) ? [...current, path] : [path];

      form.setValue(name, newValue, { shouldValidate: true });
      onValueChange?.(newValue);
    } else {
      form.setValue(name, path, { shouldValidate: true });
      onValueChange?.(path);
    }
  };

  const removeUploadFile = (fileId: string) => {
    const fileToRemove = uploadFiles.find((f) => f.id === fileId);
    if (!fileToRemove) return;

    const int = progressIntervals.current.get(fileId);
    if (int) clearInterval(int);
    progressIntervals.current.delete(fileId);

    setUploadFiles((prev) => prev.filter((f) => f.id !== fileId));
    removeFile(fileId);

    if (multiple) {
      const current = form.getValues(name) || [];
      const newValue = current.filter((_: any, index: number) => index !== 0);
      form.setValue(name, newValue, { shouldValidate: true });
      onValueChange?.(newValue);
    } else {
      form.setValue(name, "", { shouldValidate: true });
      onValueChange?.("");
    }
  };

  const retryUpload = (fileId: string) => {
    setUploadFiles((prev) =>
      prev.map((f) =>
        f.id === fileId
          ? { ...f, status: "pending", progress: 0, error: undefined }
          : f,
      ),
    );
  };

  const getFileIcon = (file: File | FileMetadata) => {
    const type = file instanceof File ? file.type : file.type;
    if (type.startsWith("image/")) return <ImageIcon className="size-4" />;
    if (type.startsWith("video/")) return <VideoIcon className="size-4" />;
    if (type.startsWith("audio/")) return <HeadphonesIcon className="size-4" />;
    if (type.includes("pdf")) return <FileTextIcon className="size-4" />;
    if (type.includes("word") || type.includes("doc"))
      return <FileTextIcon className="size-4" />;
    if (type.includes("excel") || type.includes("sheet"))
      return <FileSpreadsheetIcon className="size-4" />;
    if (type.includes("zip") || type.includes("rar"))
      return <FileArchiveIcon className="size-4" />;
    return <FileTextIcon className="size-4" />;
  };

  const completedCount = uploadFiles.filter(
    (f) => f.status === "completed",
  ).length;
  const errorCount = uploadFiles.filter((f) => f.status === "error").length;
  const uploadingCount = uploadFiles.filter(
    (f) => f.status === "uploading",
  ).length;
  const pendingCount = uploadFiles.filter((f) => f.status === "pending").length;

  const inputProps = getInputProps();

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="space-y-3">
          {labelName && (
            <FieldLabel>
              {disableLabelFormatting
                ? labelName
                : LabelAndPlaceholderTextFormat(labelName)}
              {required && <span className="text-[#ff0000]">&nbsp;*</span>}
            </FieldLabel>
          )}

          <div
            className={cn(
              "w-full",
              viewOnly && "pointer-events-none opacity-60",
            )}
          >
            <div
              className={cn(
                "relative rounded-lg border border-dashed p-8 text-center transition-colors",
                isDragging && !disabled && !viewOnly
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50",
                (disabled || viewOnly) && "cursor-not-allowed opacity-60",
              )}
              onDragEnter={
                !disabled && !viewOnly ? handleDragEnter : undefined
              }
              onDragLeave={
                !disabled && !viewOnly ? handleDragLeave : undefined
              }
              onDragOver={!disabled && !viewOnly ? handleDragOver : undefined}
              onDrop={!disabled && !viewOnly ? handleDrop : undefined}
            >
              <input
                {...inputProps}
                className="sr-only"
                disabled={disabled || viewOnly}
              />

              <div className="flex flex-col items-center gap-4">
                <div
                  className={cn(
                    "flex h-16 w-16 items-center justify-center rounded-full",
                    isDragging ? "bg-primary/10" : "bg-muted",
                  )}
                >
                  <UploadIcon
                    className={cn(
                      "h-6",
                      isDragging ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Upload your files</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop files here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Support for multiple file types up to{" "}
                    {formatBytes(maxSize)} each
                  </p>
                </div>

                <Button
                  onClick={openFileDialog}
                  disabled={disabled || viewOnly}
                  type="button"
                  className="cursor-pointer"
                  size="sm"
                >
                  <UploadIcon />
                  Select files
                </Button>
              </div>
            </div>

            {uploadFiles.length > 0 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium">Upload Progress</h4>
                  <div className="flex items-center gap-2">
                    {completedCount > 0 && (
                      <Badge variant="default">
                        Completed: {completedCount}
                      </Badge>
                    )}
                    {errorCount > 0 && (
                      <Badge variant="destructive">
                        Failed: {errorCount}
                      </Badge>
                    )}
                    {(uploadingCount > 0 || pendingCount > 0) && (
                      <Badge variant="secondary">
                        Uploading: {uploadingCount + pendingCount}
                      </Badge>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => {
                    progressIntervals.current.forEach((int) =>
                      clearInterval(int),
                    );
                    progressIntervals.current.clear();
                    clearFiles();
                    setUploadFiles([]);
                    form.setValue(name, multiple ? [] : "", {
                      shouldValidate: true,
                    });
                  }}
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={viewOnly}
                >
                  Clear all
                </Button>
              </div>
            )}

            {uploadFiles.length > 0 && (
              <div className="mt-4 space-y-3">
                <DocumentView
                  previewFile={previewFile}
                  setPreviewFile={setPreviewFile}
                  previewUrl={previewUrl}
                />
                {uploadFiles.map((fileItem) => (
                  <div
                    key={fileItem.id}
                    className="rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="relative flex-shrink-0 group">
                        {fileItem.preview &&
                        fileItem.file?.type?.startsWith("image/") ? (
                          <div className="relative">
                            <img
                              src={fileItem.preview || "/placeholder.svg"}
                              alt={fileItem.file.name}
                              className="h-12 w-12 rounded-lg border object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-muted-foreground">
                            {getFileIcon(
                              fileItem.file || {
                                name: fileItem.name,
                                type: fileItem.type,
                              },
                            )}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="inline-flex flex-col justify-center gap-1 truncate font-medium">
                            <span className="text-sm">
                              {fileItem.file?.name || fileItem.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {fileItem.file?.size
                                ? formatBytes(fileItem.file.size)
                                : "Unknown size"}
                            </span>
                          </p>
                          <div className="flex items-center gap-2">
                            {!viewOnly && (
                              <Button
                                onClick={() => removeUploadFile(fileItem.id)}
                                variant="ghost"
                                size="icon"
                                className="size-6 text-muted-foreground hover:bg-transparent hover:opacity-100"
                                type="button"
                              >
                                <XIcon className="size-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {fileItem.status === "uploading" && (
                          <div className="mt-2">
                            <Progress
                              value={fileItem.progress}
                              className="h-1"
                            />
                          </div>
                        )}

                        {fileItem.status === "error" && fileItem.error && (
                          <div className="mt-2 flex items-center gap-2 rounded-lg border border-destructive bg-destructive/5 px-3 py-2">
                            <TriangleAlert className="size-4 flex-shrink-0 text-destructive" />
                            <span className="flex-1 text-xs text-destructive">
                              {fileItem.error}
                            </span>
                            {!viewOnly && (
                              <Button
                                onClick={() => retryUpload(fileItem.id)}
                                variant="ghost"
                                size="icon"
                                className="size-6 flex-shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                type="button"
                              >
                                <RefreshCwIcon className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {errors.length > 0 && (
              <Alert variant="destructive" className="mt-5">
                <TriangleAlert className="size-4" />
                <AlertTitle>File upload error(s)</AlertTitle>
                <AlertDescription>
                  {errors.map((error, index) => (
                    <p key={index} className="last:mb-0">
                      {error}
                    </p>
                  ))}
                </AlertDescription>
              </Alert>
            )}
          </div>

          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          {!fieldState.invalid && customMessage && (
            <p className="text-sm text-muted-foreground">{customMessage}</p>
          )}
        </Field>
      )}
    />
  );
};

export default DocumentUpload;
