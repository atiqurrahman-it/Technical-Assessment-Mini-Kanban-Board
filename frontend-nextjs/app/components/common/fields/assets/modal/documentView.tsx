/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom/dialog";
import { DownloadIcon } from "lucide-react";

const DocumentView = ({
  previewFile,
  previewUrl,
  setPreviewFile,
}: {
  previewFile: any;
  previewUrl: any;
  setPreviewFile: (file: any) => void;
}) => {
  return (
    <div>
      <Dialog
        open={!!previewFile}
        onOpenChange={(open) => {
          if (!open) setPreviewFile(null);
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
          </DialogHeader>

          {!previewUrl && (
            <div className="flex justify-center py-10">Loading preview...</div>
          )}

          {previewFile && previewUrl && (
            <div className="flex flex-col gap-4">
              {/* IMAGE */}
              {previewFile.type?.startsWith("image/") && (
                <img
                  src={previewUrl}
                  alt={previewFile.name}
                  className="max-h-[70vh] rounded-md object-contain"
                />
              )}

              {/* PDF */}
              {previewFile.type?.includes("pdf") && (
                <iframe
                  src={previewUrl}
                  className="h-[70vh] w-full rounded-md border"
                />
              )}

              {/* VIDEO */}
              {previewFile.type?.startsWith("video/") && (
                <video
                  controls
                  src={previewUrl}
                  className="max-h-[70vh] w-full rounded-md"
                />
              )}

              {/* AUDIO */}
              {previewFile.type?.startsWith("audio/") && (
                <audio controls src={previewUrl} className="w-full" />
              )}

              {/* Unsupported File */}
              {!(
                previewFile.type?.startsWith("image/") ||
                previewFile.type?.includes("pdf") ||
                previewFile.type?.startsWith("video/") ||
                previewFile.type?.startsWith("audio/")
              ) && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <p className="text-sm text-muted-foreground">
                    Preview not available for this file type
                  </p>

                  <Button asChild>
                    <a href={previewUrl} target="_blank" download>
                      <DownloadIcon className="mr-2 size-4" />
                      Download File
                    </a>
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentView;
