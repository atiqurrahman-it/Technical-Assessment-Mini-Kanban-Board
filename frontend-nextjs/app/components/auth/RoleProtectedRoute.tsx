"use client";

import { useAuthStore } from "@/store/authStore";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AllowedRole = "super_admin" | "company_admin" | "company_user";

interface RoleProtectedRouteProps {
  /** The role(s) required to access this route. Accepts a single role or an array of roles. */
  allowedRole: AllowedRole | AllowedRole[];
  /** Override the fallback redirect path when user's role doesn't match */
  redirectUnauthorizedTo?: string;
  children: React.ReactNode;
}

/**
 * Guards a route by requiring specific user role(s).
 *
 * - Shows a loading spinner while auth state is being determined.
 * - Redirects unauthenticated users to `/login`.
 * - Redirects users with a mismatched role to their appropriate dashboard.
 * - Renders `children` only when the user has one of the `allowedRole`(s).
 *
 * @example
 * ```tsx
 * // Single role
 * <RoleProtectedRoute allowedRole="super_admin">
 *   <SuperAdminPage />
 * </RoleProtectedRoute>
 *
 * // Multiple roles
 * <RoleProtectedRoute allowedRole={["super_admin", "company_admin", "company_user"]}>
 *   <UserPortalPage />
 * </RoleProtectedRoute>
 * ```
 */
export function RoleProtectedRoute({
  children,
  allowedRole,
  redirectUnauthorizedTo,
}: RoleProtectedRouteProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  // Normalize allowedRole to an array for uniform handling
  const allowedRoles = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

  // Track when client hydration is complete so SSR & first client render match
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    // Authenticated but role not in the allowed list → redirect to their appropriate dashboard
    if (user && !allowedRoles.includes(user.role)) {
      const redirectPath =
        redirectUnauthorizedTo ??
        (user.role === "super_admin"
          ? "/super-admin"
          : user.role === "company_admin"
            ? "/company-portal"
            : "/user/my-dashboard");

      router.replace(redirectPath);
    }
  }, [isAuthenticated, isLoading, user, router, allowedRoles, redirectUnauthorizedTo]);

  // Show loading state during SSR + initial client render to prevent hydration mismatch
  if (!mounted || isLoading || !isAuthenticated || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Role not in allowed list — prevent flash of content before redirect completes
  if (!allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
