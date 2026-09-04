/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { LabelAndPlaceholderTextFormat } from "@/utils/format/textCaseFormate";
import {
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  startOfDay,
} from "date-fns";
import { CalendarDays, ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  DateRange,
  DropdownOption,
  DropdownProps,
} from "react-day-picker";

/* -------------------------------------------------------------------------- */
/*                                    Props                                   */
/* -------------------------------------------------------------------------- */

interface DateRangeCalendarProps {
  /** react-hook-form instance — provide together with `name` for form mode. */
  form?: any;
  /** Field name in the form — required for form mode. */
  name?: string;

  // Controlled (non-form) mode — react-day-picker style API
  /** Current range value ({ from, to }) for controlled usage. */
  selected?: DateRange | undefined;
  /** Change callback (same shape as `onValueChange`). */
  onSelect?: (value: DateRange | undefined) => void;

  // Controlled (non-form) mode — legacy aliases
  /** Current range value ({ from, to }) — alias of `selected`. */
  value?: DateRange | undefined;
  /** Setter for controlled usage — alias of `onSelect`. */
  setValue?: (value: DateRange | undefined) => void;
  /** Change callback — alias of `onSelect`. */
  onValueChange?: (value: DateRange | undefined) => void;

  /** Number of month panels shown side by side (default 2). */
  numberOfMonths?: number;

  labelName?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  viewOnly?: boolean;
  /** "previous" = disallow past dates, "future" = disallow future dates. */
  mode?: "previous" | "future" | "normal";
  disableLabelFormatting?: boolean;
  customMessage?: string;
}

/* -------------------------------------------------------------------------- */
/*                    Grid Dropdown (month: 2-col / year: 3-col)              */
/* -------------------------------------------------------------------------- */

/**
 * Replaces react-day-picker's native `<select>` dropdown with a grid panel:
 * months render in 2 columns, years in 3 columns.
 */
const GridDropdown = ({
  options = [],
  value,
  onChange,
  disabled,
  "aria-label": ariaLabel,
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const numericValue = Number(value);
  // Month dropdowns always have 12 options → 2 columns; years → 3 columns.
  const columns = options.length <= 12 ? 2 : 3;
  const selected = options.find((o) => o.value === numericValue);

  // Close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleSelect = (opt: DropdownOption) => {
    setOpen(false);
    // react-day-picker reads `e.target.value` in handleMonthChange/
    // handleYearChange, so we emulate a change event.
    onChange?.({
      target: { value: String(opt.value) },
    } as React.ChangeEvent<HTMLSelectElement>);
  };

  return (
    <div ref={rootRef} className="relative" data-disabled={disabled}>
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-(--cell-size) items-center gap-1 rounded-(--cell-radius) px-2 text-sm font-medium text-foreground select-none transition-colors",
          "hover:bg-muted",
          open && "bg-muted",
        )}
      >
        <span className="whitespace-nowrap">{selected?.label ?? "—"}</span>
        <ChevronDown
          size={14}
          className={cn(
            "text-muted-foreground transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-1/2 z-50 grid -translate-x-1/2 gap-0.5 rounded-lg border border-border bg-popover p-1.5 shadow-xl"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(52px, 1fr))`,
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === numericValue;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                disabled={opt.disabled}
                onClick={() => handleSelect(opt)}
                className={cn(
                  "rounded-md px-2 py-1 text-center text-xs transition-colors",
                  isSelected
                    ? "bg-primary font-medium text-primary-foreground"
                    : "text-foreground hover:bg-muted",
                  opt.disabled && "cursor-not-allowed opacity-40",
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                 Component                                  */
/* -------------------------------------------------------------------------- */

const formatRange = (range: DateRange | undefined): string | undefined => {
  if (!range?.from) return undefined;
  if (!range.to) return format(range.from, "MMM dd, yyyy");
  return `${format(range.from, "MMM dd, yyyy")} – ${format(range.to, "MMM dd, yyyy")}`;
};

export const DateRangeCalendar = ({
  form,
  name,
  selected,
  onSelect,
  value,
  setValue,
  onValueChange,
  numberOfMonths = 2,
  labelName,
  placeholder,
  required = false,
  disabled = false,
  viewOnly = false,
  mode = "normal",
  disableLabelFormatting = false,
  customMessage,
}: DateRangeCalendarProps) => {
  const isFormMode = !!(form && name);
  const [localValue, setLocalValue] = useState<DateRange | undefined>(
    undefined,
  );
  const [open, setOpen] = useState(false);

  // Resolve the effective value from whichever mode is active.
  // Priority: form > `selected` > `value` > local state.
  const currentValue: DateRange | undefined = isFormMode
    ? form.watch(name)
    : selected !== undefined
      ? selected
      : value !== undefined
        ? value
        : localValue;

  const commit = (val: DateRange | undefined) => {
    if (isFormMode && name) {
      form.setValue(name, val, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }
    onSelect?.(val);
    onValueChange?.(val);
    setValue?.(val);
    setLocalValue(val);
  };

  const today = startOfDay(new Date());
  const disabledMatcher = (date: Date) => {
    if (mode === "previous") return isBefore(date, today);
    if (mode === "future") return isAfter(date, today);
    return false;
  };

  const placeholderText = disableLabelFormatting
    ? placeholder || "Select date range"
    : LabelAndPlaceholderTextFormat(placeholder || "Select date range");

  const error = isFormMode ? form?.formState?.errors?.[name] : undefined;
  const dayCount =
    currentValue?.from && currentValue.to
      ? differenceInCalendarDays(currentValue.to, currentValue.from) + 1
      : 0;

  return (
    <div className="w-full space-y-1.5">
      {labelName && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {disableLabelFormatting
            ? labelName
            : LabelAndPlaceholderTextFormat(labelName)}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      {viewOnly ? (
        <div className="min-h-10 px-3 py-2 rounded-lg border bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <CalendarDays
            size={14}
            className="text-cyan-500 dark:text-cyan-400"
          />
          {formatRange(currentValue) || "—"}
        </div>
      ) : (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              disabled={disabled}
              className={cn(
                "cursor-pointer w-full min-h-10 px-3 py-2 rounded-[10px] border flex items-center justify-between gap-2 text-sm font-medium leading-6 transition-colors",
                "border-white bg-white/16 text-[#000855] backdrop-blur-md hover:bg-white/25",
                "dark:border-white/20 dark:bg-transparent dark:text-white dark:hover:bg-white/10",
                disabled && "opacity-50 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "flex items-center gap-2 truncate",
                  !currentValue && "opacity-70",
                )}
              >
                <CalendarDays size={15} className="flex-shrink-0" />
                {formatRange(currentValue) || placeholderText}
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                {currentValue && !disabled && (
                  <X
                    size={14}
                    className="text-slate-400 hover:text-red-500 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      commit(undefined);
                    }}
                  />
                )}
                <ChevronDown
                  size={14}
                  className={cn(
                    "opacity-70 transition-transform duration-200",
                    open && "rotate-180",
                  )}
                />
              </span>
            </button>
          </PopoverTrigger>

          <PopoverContent align="start" sideOffset={8} className="w-auto p-2">
            <Calendar
              mode="range"
              numberOfMonths={numberOfMonths}
              defaultMonth={
                currentValue?.from ??
                (mode === "previous" ? new Date() : undefined)
              }
              selected={currentValue}
              onSelect={(range) => commit(range)}
              disabled={disabledMatcher}
              showOutsideDays={false}
              captionLayout="dropdown"
              components={{ Dropdown: GridDropdown }}
            />

            <div className="flex items-center justify-between px-1 pt-1 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {dayCount > 0
                  ? `${dayCount} day${dayCount > 1 ? "s" : ""} selected`
                  : "Select start & end date"}
              </span>
              {currentValue && (
                <button
                  type="button"
                  onClick={() => commit(undefined)}
                  className="text-xs font-medium text-primary underline-offset-4 hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      )}

      {error ? (
        <p className="text-xs text-red-500">{String(error?.message || "")}</p>
      ) : customMessage ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {customMessage}
        </p>
      ) : null}
    </div>
  );
};

export default DateRangeCalendar;
