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

export { Spinner }
