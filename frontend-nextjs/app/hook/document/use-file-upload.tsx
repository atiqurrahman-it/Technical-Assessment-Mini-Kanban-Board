"use client";

import React from "react";

import { useCallback, useRef, useState } from "react";

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

export interface FileWithPreview extends FileMetadata {
  file: File;
  preview?: string;
}

interface UseFileUploadOptions {
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  multiple?: boolean;
  initialFiles?: FileMetadata[];
  onFilesChange?: (files: FileWithPreview[]) => void;
}

interface UseFileUploadState {
  isDragging: boolean;
  errors: string[];
}

interface UseFileUploadActions {
  removeFile: (fileId: string) => void;
  clearFiles: () => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  openFileDialog: () => void;
  getInputProps: () => {
    type: string;
    multiple: boolean;
    accept?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
}

export function useFileUpload(
  options: UseFileUploadOptions = {},
): [UseFileUploadState, UseFileUploadActions] {
  const {
    maxFiles = 5,
    maxSize = 10 * 1024 * 1024,
    accept = "*",
    multiple = true,
    initialFiles = [],
    onFilesChange,
  } = options;

  const [state, setState] = useState<UseFileUploadState>({
    isDragging: false,
    errors: [],
  });

  const [files, setFiles] = useState<FileWithPreview[]>(
    initialFiles.map((file) => ({
      ...file,
      file: new File([], file.name, { type: file.type }),
      preview: file.url,
    })),
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const validateFiles = useCallback(
    (filesToValidate: File[]) => {
      const newErrors: string[] = [];

      if (!multiple && filesToValidate.length > 1) {
        newErrors.push("Only one file is allowed");
        return { valid: [], errors: newErrors };
      }

      if (files.length + filesToValidate.length > maxFiles) {
        newErrors.push(`Maximum ${maxFiles} files allowed`);
        return { valid: [], errors: newErrors };
      }

      const validFiles = filesToValidate.filter((file) => {
        if (file.size > maxSize) {
          newErrors.push(`${file.name} exceeds maximum file size`);
          return false;
        }

        if (accept !== "*") {
          const acceptedTypes = accept.split(",").map((type) => type.trim());
          const isAccepted = acceptedTypes.some((type) => {
            if (type.endsWith("/*")) {
              const [category] = type.split("/");
              return file.type.startsWith(category);
            }
            return file.type === type;
          });

          if (!isAccepted) {
            newErrors.push(`${file.name} is not an accepted file type`);
            return false;
          }
        }

        return true;
      });

      return { valid: validFiles, errors: newErrors };
    },
    [files.length, maxFiles, maxSize, accept, multiple],
  );

  const processFiles = useCallback(
    (filesToProcess: File[]) => {
      const { valid: validFiles, errors } = validateFiles(filesToProcess);

      if (errors.length > 0) {
        setState((prev) => ({ ...prev, errors }));
      }

      const newFiles: FileWithPreview[] = validFiles.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file,
        preview:
          file.type.startsWith("image/") || file.type.startsWith("video/")
            ? URL.createObjectURL(file)
            : undefined,
      }));

      setFiles((prev) => {
        const updated = [...prev, ...newFiles];
        onFilesChange?.(updated);
        return updated;
      });

      // Clear errors after 5 seconds
      if (errors.length > 0) {
        setTimeout(() => {
          setState((prev) => ({ ...prev, errors: [] }));
        }, 5000);
      }
    },
    [validateFiles, onFilesChange],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setState((prev) => ({ ...prev, isDragging: true }));
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setState((prev) => ({ ...prev, isDragging: false }));
    }
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
      setState((prev) => ({ ...prev, isDragging: false }));

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [processFiles],
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      processFiles(selectedFiles);
      // Reset input
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [processFiles],
  );

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const removeFile = useCallback(
    (fileId: string) => {
      setFiles((prev) => {
        const updated = prev.filter((file) => file.id !== fileId);
        onFilesChange?.(updated);
        return updated;
      });
    },
    [onFilesChange],
  );

  const clearFiles = useCallback(() => {
    setFiles([]);
    onFilesChange?.([]);
  }, [onFilesChange]);

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: "file",
      multiple,
      accept: accept === "*" ? undefined : accept,
      onChange: handleInputChange,
    }),
    [multiple, accept, handleInputChange],
  );

  return [
    state,
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
  ];
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
