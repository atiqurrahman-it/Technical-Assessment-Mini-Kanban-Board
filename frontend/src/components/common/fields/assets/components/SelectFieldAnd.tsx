"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { cn } from "@/lib/utils";
import { DismissableLayerBranch } from "@radix-ui/react-dismissable-layer";
import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { createPortal } from "react-dom";
import type { FieldValues, Path } from "react-hook-form";

/* -------------------------------------------------------------------------- */
/*                                   Types                                    */
/* -------------------------------------------------------------------------- */

interface Option<T = string> {
  value: T;
  label: string;
  image?: string;
  flag?: string;
  disabled?: boolean;
}

type RawOption = string | Option;
interface SelectFieldProps<T extends FieldValues> {
  form?: any; //  UseFormReturn<T>
  name?: Path<T>;

  // Controlled (optional)
  value?: string | string[];
  className?: string; // custom style class name

  onValueChange?: (value: any) => void;

  labelName?: string;
  required?: boolean;
  disabled?: boolean;
  options?: RawOption[];
  placeholder?: string;
  showSearch?: boolean;
  isImageShow?: boolean;
  isFlag?: boolean;
  type?: "single" | "multiple";
  viewOnly?: boolean;
  isLoading?: boolean;
  onSearch?: (query: string) => void;
  customMessage?: string;
  icon?: React.ReactNode;
}

/* -------------------------------------------------------------------------- */
/*                              SelectField                                   */
/* -------------------------------------------------------------------------- */

export const SelectField = React.forwardRef(
  <T extends FieldValues>(
    {
      form,
      name,
      labelName,
      required = false,
      disabled = false,
      options = [],
      placeholder = "Select an option",
      showSearch = true,
      isImageShow = false,
      isFlag = false,
      type = "single",
      viewOnly = false,
      onValueChange,
      value,
      isLoading = false,
      onSearch,
      customMessage,
      icon,
      className,
    }: SelectFieldProps<T>,
    ref: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const isFormMode = !!(form && name);

    const normalizedOptions: Option[] = React.useMemo(() => {
      return (options || []).map((opt: any) => {
        if (typeof opt === "string") {
          return {
            label: opt,
            value: opt,
          };
        }
        return opt;
      });
    }, [options]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [searchValue, setSearchValue] = React.useState("");
    const [showMore, setShowMore] = React.useState(false);
    const [visibleBadgeCount, setVisibleBadgeCount] = React.useState(2);

    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const searchInputRef = React.useRef<HTMLInputElement>(null);
    const measureRef = React.useRef<HTMLDivElement>(null);

    const fieldValue = isFormMode ? form.watch(name) : value;

    const selectedValues = React.useMemo<string[]>(() => {
      if (type === "multiple") {
        return Array.isArray(fieldValue) ? fieldValue : [];
      }
      return fieldValue ? [fieldValue as string] : [];
    }, [fieldValue, type]);

    const selectedOptions = React.useMemo(
      () =>
        normalizedOptions.filter((opt) =>
          selectedValues.includes(opt.value as string),
        ),
      [normalizedOptions, selectedValues],
    );

    const filteredOptions = React.useMemo(() => {
      if (!showSearch || !searchValue) return normalizedOptions;
      return normalizedOptions.filter(
        (opt) =>
          opt.label.toLowerCase().includes(searchValue.toLowerCase()) ||
          opt.value
            .toString()
            .toLowerCase()
            .includes(searchValue.toLowerCase()),
      );
    }, [normalizedOptions, searchValue, showSearch]);

    /* ------------------------- Badge width calculation ------------------------ */

    React.useEffect(() => {
      if (type !== "multiple" || !measureRef.current || !triggerRef.current)
        return;

      const calc = () => {
        const available = triggerRef.current!.offsetWidth - 120;
        const badges = measureRef.current!.querySelectorAll("[data-badge]");
        let total = 0;
        let count = 0;

        badges.forEach((b) => {
          const w = (b as HTMLElement).offsetWidth + 8;
          if (total + w <= available) {
            total += w;
            count++;
          }
        });

        setVisibleBadgeCount(Math.max(1, count));
      };

      calc();
      const ro = new ResizeObserver(calc);
      ro.observe(triggerRef.current!);
      return () => ro.disconnect();
    }, [selectedOptions, showMore, type]);

    /* -------------------------------- Handlers ------------------------------- */
    const handleSelect = (newValue: string) => {
      if (type === "multiple") {
        const newValues = selectedValues.includes(newValue)
          ? selectedValues.filter((v) => v !== newValue)
          : [...selectedValues, newValue];

        if (isFormMode) {
          form.setValue(name, newValues as any, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }

        onValueChange?.(newValues);
      } else {
        if (isFormMode) {
          form.setValue(name, newValue as any, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
        }

        onValueChange?.(newValue);
        setIsOpen(false);
      }
    };

    // const handleSelect = (value: string) => {
    //   if (type === "multiple") {
    //     const newValues = selectedValues.includes(value)
    //       ? selectedValues.filter((v) => v !== value)
    //       : [...selectedValues, value]

    //     form.setValue(name, newValues as any)
    //     onValueChange?.(newValues)
    //   } else {
    //     form.setValue(name, value as any)
    //     onValueChange?.(value)
    //     setIsOpen(false)
    //   }
    // }

    const handleClear = () => {
      const emptyValue = type === "multiple" ? [] : "";
      if (isFormMode) {
        form.setValue(name, emptyValue as any);
      }
      onValueChange?.(emptyValue as any);
      setShowMore(false);
    };

    /* ----------------------- Portal dropdown position ----------------------- */

    const [dropdownStyle, setDropdownStyle] =
      React.useState<React.CSSProperties>({});
    const [dropdownDir, setDropdownDir] = React.useState<"down" | "up">("down");

    React.useEffect(() => {
      if (!isOpen || !triggerRef.current) return;

      let mounted = true;
      const updatePos = () => {
        if (!mounted || !triggerRef.current) return;
        const triggerRect = triggerRef.current!.getBoundingClientRect();
        const offset = 4; // gap
        const spaceBelow = window.innerHeight - triggerRect.bottom;
        const spaceAbove = triggerRect.top;
        const preferUp = spaceBelow < 200 && spaceAbove > spaceBelow;

        setDropdownDir(preferUp ? "up" : "down");

        // Keep dropdown within horizontal viewport bounds
        // `position: fixed` coordinates are viewport-relative — do NOT add
        // window.scrollX/scrollY, otherwise the dropdown stays stuck in the
        // viewport and doesn't follow the trigger when the page scrolls.
        let left = triggerRect.left;
        const rightOverflow = left + triggerRect.width - window.innerWidth;
        if (rightOverflow > 0) {
          left = Math.max(0, left - rightOverflow);
        }

        setDropdownStyle({
          position: "fixed",
          left,
          width: triggerRect.width,
          top: preferUp
            ? triggerRect.top - offset
            : triggerRect.bottom + offset,
          transform: preferUp ? "translateY(-100%)" : "none",
          zIndex: 9999,
        });
      };

      updatePos();
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);

      return () => {
        mounted = false;
        window.removeEventListener("scroll", updatePos, true);
        window.removeEventListener("resize", updatePos);
      };
    }, [isOpen]);

    /* ----------------------------- Outside click ----------------------------- */

    React.useEffect(() => {
      const handler = (e: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(e.target as Node) &&
          !triggerRef.current?.contains(e.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handler);
        // focus search input after a small delay to let the portal render
        requestAnimationFrame(() => searchInputRef.current?.focus());
      }

      return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);

    const displayedBadges = showMore
      ? selectedOptions
      : selectedOptions.slice(0, visibleBadgeCount);
    const hiddenCount = selectedOptions.length - visibleBadgeCount;
    const isInvalid = isFormMode ? form.formState.errors[name] : undefined;

    /* ---------------------------------- UI ---------------------------------- */

    return (
      <div ref={ref} className="w-full space-y-2">
        {labelName && (
          <label className="text-sm font-medium">
            {labelName}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {/* Hidden badge measurement */}
        {type === "multiple" && (
          <div
            ref={measureRef}
            className="absolute opacity-0 flex gap-2 pointer-events-none"
          >
            {selectedOptions.map((o) => (
              <span
                key={o.value as any}
                data-badge
                className="px-2 py-1 text-xs border rounded"
              >
                {o.label}
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <button
            ref={triggerRef}
            type="button"
            disabled={disabled || viewOnly}
            onClick={() => !disabled && !viewOnly && setIsOpen((p) => !p)}
            className={cn(
              "cursor-pointer w-full min-h-11 rounded-lg border border-input px-3 py-2 flex items-center justify-between gap-2",
              "hover:bg-muted/50 transition-colors",
              isInvalid && "border-destructive",
              disabled && "opacity-50 cursor-not-allowed",
              className,
            )}
          >
            <div className="flex gap-2 flex-1 items-center overflow-hidden">
              {icon && <div className="flex items-center justify-center flex-shrink-0">{icon}</div>}
              {selectedOptions.length === 0 && (
                <span className="text-muted-foreground truncate">{placeholder}</span>
              )}

              {/* SINGLE */}
              {type === "single" && selectedOptions[0] && (
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                  {isFlag && selectedOptions[0].flag && (
                    <span className="text-base flex-shrink-0">{selectedOptions[0].flag}</span>
                  )}
                  {isImageShow && selectedOptions[0].image && (
                    <Image
                      src={selectedOptions[0].image || "/placeholder.svg"}
                      width={20}
                      height={20}
                      className="w-5 h-5 rounded-full object-cover flex-shrink-0"
                      alt={selectedOptions[0].label}
                    />
                  )}
                  <span className="truncate">{selectedOptions[0].label}</span>
                </div>
              )}

              {/* MULTIPLE */}
              {type === "multiple" &&
                displayedBadges.map((opt) => (
                  <span
                    key={opt.value as any}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                  >
                    {isFlag && opt.flag && <span>{opt.flag}</span>}
                    {isImageShow && opt.image && (
                      <Image
                        alt={opt.label}
                        src={opt.image || "/placeholder.svg"}
                        width={16}
                        height={16}
                        className="w-4 h-4 rounded-full"
                      />
                    )}
                    {!showMore ? (
                      <span className="truncate max-w-[70px]">{opt.label}</span>
                    ) : (
                      <span>{opt.label}</span>
                    )}
                    {!viewOnly && (
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(opt.value as string);
                        }}
                      />
                    )}
                  </span>
                ))}

              {!showMore && hiddenCount > 0 && (
                <span
                  className="text-xs text-primary cursor-pointer flex items-center hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMore(true);
                  }}
                >
                  +{hiddenCount} more
                </span>
              )}

              {showMore && (
                <span
                  className="text-xs text-primary cursor-pointer flex items-center hover:underline"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMore(false);
                  }}
                >
                  show less
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {selectedOptions.length > 0 &&
                !viewOnly &&
                type === "multiple" && (
                  <X
                    className="w-4 h-4 cursor-pointer hover:text-destructive"
                    onClick={handleClear}
                  />
                )}
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ChevronDown className="w-4 h-4 transition-transform" />
              )}
            </div>
          </button>

          {/* ── Portal dropdown (escapes any parent overflow) ── */}
          {/*
            Wrapped in DismissableLayerBranch + pointerEvents: "auto" so the
            dropdown stays clickable inside Radix modals:
            - modal dialogs set body { pointer-events: none } — "auto" re-enables clicks
            - the branch makes Radix treat the dropdown as “inside” the dialog,
              so the dialog doesn’t dismiss when picking an option
          */}
          {isOpen &&
            typeof document !== "undefined" &&
            createPortal(
              <DismissableLayerBranch>
                <div
                  ref={dropdownRef}
                  style={{ ...dropdownStyle, pointerEvents: "auto" }}
                  className="bg-popover border rounded-lg shadow-md"
                  data-dropdown-dir={dropdownDir}
                >
                  {showSearch && (
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          ref={searchInputRef}
                          className="w-full pl-8 pr-3 py-2 border rounded-md text-sm bg-background"
                          placeholder="Search..."
                          value={searchValue}
                          onChange={(e) => {
                            setSearchValue(e.target.value);
                            onSearch?.(e.target.value);
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="max-h-60 overflow-y-auto">
                    {filteredOptions.length === 0 && (
                      <p className="p-3 text-sm text-center text-muted-foreground">
                        {customMessage || "No options found"}
                      </p>
                    )}

                    {filteredOptions.map((opt, index) => {
                      const active = selectedValues.includes(
                        opt.value as string,
                      );
                      return (
                        <button
                          key={opt.value + index}
                          disabled={opt.disabled}
                          onClick={() => handleSelect(opt.value as string)}
                          className={cn(
                            "cursor-pointer w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-muted",
                            active && "bg-primary/10 text-primary",
                            opt.disabled && "opacity-50 cursor-not-allowed",
                          )}
                        >
                          {type === "multiple" && (
                            <span className="w-4 h-4 border rounded flex items-center justify-center">
                              {active && <Check className="w-3 h-3" />}
                            </span>
                          )}
                          {isFlag && opt.flag && (
                            <span className="text-base">{opt.flag}</span>
                          )}
                          {isImageShow && opt.image && (
                            <Image
                              alt={opt.label}
                              src={opt.image || "/placeholder.svg"}
                              width={20}
                              height={20}
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span className="flex-1">{opt.label}</span>
                          {type === "single" && active && (
                            <Check className="w-4 h-4" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </DismissableLayerBranch>,
              document.body,
            )}
        </div>

        {isInvalid && form && name && form.formState.errors[name] && (
          <p className="text-xs text-destructive">
            {String(form.formState.errors[name]?.message)}
          </p>
        )}
      </div>
    );
  },
);

SelectField.displayName = "SelectField";
