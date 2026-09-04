"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const Accordion = AccordionPrimitive.Root;

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item ref={ref} className={cn("", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
    hideIcon?: boolean;
    iconDisplay?: "left" | "right"; // toggle position
  }
>(({ className, children, ...props }, ref) => {
  const { hideIcon = false, iconDisplay = "right", ...rest } = props;

  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        ref={ref}
        className={cn(
          "flex flex-col cursor-pointer md:flex-row flex-1 items-start md:items-start justify-start py-2 md:py-3 text-sm font-medium text-left [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...rest}
      >
        {!hideIcon && iconDisplay === "left" && (
          <ChevronDown className="w-4 h-4 mr-1 transition-transform duration-200 shrink-0 text-muted-foreground" />
        )}
        {children}
        {!hideIcon && iconDisplay === "right" && (
          <ChevronDown className="w-4 h-4  transition-transform duration-200 shrink-0 text-muted-foreground" />
        )}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
});
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };