"use client";

import { usePortalMode } from "@/store/portalModeStore";
import { EyeOff, Pencil } from "lucide-react";

export default function PortalModeToggle() {
  const { mode, setMode, showToggle } = usePortalMode();

  if (!showToggle) return null;

  const isEditMode = mode === "edit";

  const handleToggle = () => {
    setMode(isEditMode ? "view" : "edit");
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isEditMode}
      aria-label={isEditMode ? "Switch to View mode" : "Switch to Edit mode"}
      className={`
        group relative z-50 flex min-w-[240px]
        cursor-pointer items-center justify-between gap-2
        rounded-[10px] border px-3.5 py-1.5
        text-xs font-semibold shadow-lg backdrop-blur-sm
        transition-all duration-300
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#08F]/50

        ${
          isEditMode
            ? `
              border-white bg-[#08F] text-white
              shadow-[0_0_11.491px_0_#FFF_inset,0_0_6.566px_0_#FFF,0_0_3.83px_0_#FFF,0_0_1.915px_0_#08F_inset,0_0_0.547px_0_#08F,0_0_0.274px_0_#08F]
              hover:opacity-90

              dark:border-[rgba(0,229,255,0.58)]
              dark:bg-[#000855]
              dark:text-[#00E5FF]
              dark:shadow-[0_0_20px_0_#08F_inset,0_0_0.547px_0_#08F,0_0_0.274px_0_#08F]
            `
            : `
              border-[rgba(0,136,255,0.25)]
              bg-white/80 text-[#51658f]
              shadow-[0_2px_8px_rgba(0,80,200,0.08)]
              hover:bg-white/90

              dark:border-[rgba(0,212,255,0.2)]
              dark:bg-[rgba(3,13,35,0.7)]
              dark:text-[#5AA9FF]
              dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)]
              dark:hover:bg-[rgba(3,13,35,0.85)]
            `
        }
      `}
    >
      {/* Icon + Label */}
      <span className="flex items-center gap-2">
        {isEditMode ? (
          <Pencil aria-hidden="true" className="h-3.5 w-3.5 animate-pulse" />
        ) : (
          <EyeOff aria-hidden="true" className="h-3.5 w-3.5" />
        )}

        <span className="whitespace-nowrap font-['Inter'] text-[13px] font-semibold leading-[24px]">
          {isEditMode ? "Edit Mode" : "View Mode"}
        </span>
      </span>

      {/* Toggle */}
      <span
        aria-hidden="true"
        className={`
          ml-1 flex h-5 w-9 rounded-full p-0.5
          transition-colors duration-300
          ${
            isEditMode
              ? "bg-white/30 dark:bg-[#00E5FF]/30"
              : "bg-[#08F]/15 dark:bg-[#5AA9FF]/20"
          }
        `}
      >
        <span
          className={`
            h-4 w-4 rounded-full bg-white shadow
            transition-transform duration-300 ease-in-out
            ${isEditMode ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </span>

      {/* Tooltip */}
      <span
        aria-hidden="true"
        className="
          pointer-events-none absolute -bottom-7 left-1/2
          -translate-x-1/2 whitespace-nowrap
          rounded-md border border-white/10
          bg-gray-900 px-2 py-0.5
          text-[10px] text-white
          opacity-0 shadow-lg
          transition-opacity duration-200
          group-hover:opacity-100

          dark:border-[rgba(0,212,255,0.2)]
          dark:bg-[#030d1f]
          dark:text-gray-200
        "
      >
        {isEditMode
          ? "Click to switch to View mode"
          : "Click to enable Edit mode"}
      </span>
    </button>
  );
}
