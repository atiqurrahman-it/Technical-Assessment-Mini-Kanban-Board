import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/custom/dialog";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { ReactNode } from "react";

interface DialogWrapperProps {
  style?: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerContent?: ReactNode;
  title?: ReactNode;
  description?: string;
  children: ReactNode;
  closer?: boolean;
  footer?: ReactNode;
}

export const DialogWrapper: React.FC<DialogWrapperProps> = ({
  open,
  setOpen,
  triggerContent,
  title,
  description,
  children,
  closer = true,
  style,
  footer
}) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {triggerContent && (
        <DialogTrigger asChild>{triggerContent}</DialogTrigger>
      )}
      {/* <DialogTrigger asChild>{triggerContent}</DialogTrigger> */}

      <DialogContent
        className={cn(
          "flex flex-col max-h-[90%] lg:max-h-[80%] overflow-hidden",
          style,
        )}
      >
        {/*TOP-RIGHT CLOSE ICON */}
        {closer && (
          <DialogClose asChild>
            <button className="cursor-pointer absolute top-3 right-3 rounded-sm opacity-70 hover:opacity-100 focus:outline-none">
              <X className="w-5 h-5" />
              <span className="sr-only">Close</span>
            </button>
          </DialogClose>
        )}
        {/* HEADER - FIXED */}
        <DialogHeader
          className={cn(
            "shrink-0 capitalize bg-background ",
            title || description ? "py-3 px-2 border-b" : "pt-2 bg-transparent",
          )}
        >
          <DialogTitle className={title ? "block" : "hidden"}>
            {title || ""}
          </DialogTitle>

          <DialogDescription className={description ? "block" : "hidden"}>
            {description || ""}
          </DialogDescription>
        </DialogHeader>

        {/* BODY - SCROLLABLE */}
        <div className="flex-1 overflow-y-auto pb-4 px-4">{children}</div>
      <DialogFooter className={footer ? "block" : "hidden"}>
        {footer}
          </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

/** Usage==>
 * - Uses controlled open/close with `open` and `handleOpen`.
 * - `triggerContent` is the element that opens the dialog.
 * - `title` and `description` show a header if provided.
 * - `children` is the main content inside the dialog.
 * - `closer` shows or hides the dialog header (default: true).
 * - `style` allows custom styling for the dialog content.
 */
