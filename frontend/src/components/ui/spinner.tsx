"use client"

import * as React from "react"
import { LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

function Spinner({
  className,
  ...props
}: React.ComponentProps<typeof LoaderCircle>) {
  return (
    <LoaderCircle
      data-slot="spinner"
      aria-hidden="true"
      className={cn("animate-spin", className)}
      {...props}
    />
  )
}

/** Full-height centered spinner — used only for app-shell gates (e.g. the
 * auth session check) where the page shape isn't known yet. Once content
 * has a known shape, prefer a `Skeleton`-based loading state instead. */
function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Spinner className="size-6 text-muted-foreground" />
    </div>
  )
}

export { PageSpinner, Spinner }
