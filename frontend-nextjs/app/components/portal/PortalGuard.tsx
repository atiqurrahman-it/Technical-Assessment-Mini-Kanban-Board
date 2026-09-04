"use client";

import { usePortalMode } from "@/store/portalModeStore";
import { EyeOff, Lock } from "lucide-react";
import type { ReactNode } from "react";

// ─── EditOnly ─────────────────────────────────────────────────────────────────

/**
 * Renders `children` **only** when the portal is in **edit mode**.
 * In view mode renders nothing (or an optional `fallback`).
 *
 * @example
 * ```tsx
 * <EditOnly>
 *   <button onClick={handleDelete}>Delete</button>
 * </EditOnly>
 * ```
 */
export function EditOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  /** Optional content to show when in view mode */
  fallback?: ReactNode;
}) {
  const { canEdit } = usePortalMode();
  if (canEdit) return <>{children}</>;
  return fallback ? <>{fallback}</> : null;
}

// ─── ViewOnly ─────────────────────────────────────────────────────────────────

/**
 * Renders `children` **only** when the portal is in **view mode**.
 * In edit mode renders nothing (or an optional `fallback`).
 */
export function ViewOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { canEdit } = usePortalMode();
  if (!canEdit) return <>{children}</>;
  return fallback ? <>{fallback}</> : null;
}

// ─── DisabledInView ───────────────────────────────────────────────────────────

/**
 * Wraps children so they are visually dimmed and non-interactive in **view mode**,
 * but fully functional in **edit mode**.
 *
 * @example
 * ```tsx
 * <DisabledInView>
 *   <FilterBar ... />
 * </DisabledInView>
 * ```
 */
export function DisabledInView({
  children,
  className = "",
  showLock = true,
}: {
  children: ReactNode;
  className?: string;
  /** Show a small lock icon overlay in view mode (default: true) */
  showLock?: boolean;
}) {
  const { canEdit } = usePortalMode();

  if (canEdit) return <>{children}</>;

  return (
    <div className={`relative ${className}`}>
      {/* Overlay to prevent interaction */}
      <div className="pointer-events-none absolute inset-0 z-10" />

      {/* Dimmed children */}
      <div className="pointer-events-none select-none opacity-40">
        {children}
      </div>

      {/* Lock badge */}
      {showLock && (
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
          <div className="flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-400 shadow-lg backdrop-blur-sm">
            <Lock className="h-3 w-3" />
            View Only
          </div>
        </div>
      )}
    </div>
  );
}

// ─── OpacityBlock ─────────────────────────────────────────────────────────────

/**
 * Conditionally dims children in view mode (without blocking interaction).
 * Useful for visual feedback without breaking layout.
 */
export function DimInView({
  children,
}: {
  children: ReactNode;
}) {
  const { canEdit } = usePortalMode();
  return (
    <div className={canEdit ? "" : "opacity-50 transition-opacity"}>
      {children}
    </div>
  );
}
