import type { MenuProps } from "../interface/MenuProps";

/**
 * Build the header navigation items for the current user role & route.
 * Shared between the desktop nav (HeaderNav) and the mobile drawer
 * (HeaderMenuDrawer) so both always show the same menu.
 */
export function getHeaderMenuItems(
  role: string | undefined,
  pathname: string,
): MenuProps[] {
  // ── Super admin: show user portal nav when browsing /user/* routes ──
  if (role === "super_admin" && pathname.startsWith("/user/")) {
    return [
      { label: "My Dashboard", href: "/user/my-dashboard" },
      { label: "My Maps", href: "/user/my-maps" },
      { label: "My Reports", href: "/user/my-reports" },
      { label: "My Data Sets", href: "/user/my-data-sets" },
      { label: "My Declarations", href: "/user/my-declarations" },
    ];
  }

  if (role === "super_admin") {
    return [
      { label: "Dashboard", href: "/super-admin" },
      { label: "Company list", href: "/super-admin/company-list" },
      {
        label: "Company Request List",
        href: "/super-admin/company-request-list",
      },
    ];
  }

  if (role === "company_admin") {
    return [
      { label: "My Dashboard", href: "/user/my-dashboard" },
      { label: "My Maps", href: "/user/my-maps" },
      { label: "My Reports", href: "/user/my-reports" },
      { label: "My Data Sets", href: "/user/my-data-sets" },
      { label: "My Declarations", href: "/user/my-declarations" },
      { label: "Company Admin", href: "/company-portal" },
    ];
  }

  if (role === "company_user") {
    return [
      { label: "My Dashboard", href: "/user/my-dashboard" },
      { label: "My Maps", href: "/user/my-maps" },
      { label: "My Reports", href: "/user/my-reports" },
      { label: "My Data Sets", href: "/user/my-data-sets" },
      { label: "My Declarations", href: "/user/my-declarations" },
    ];
  }

  // Not logged in
  return [{ label: "Login", href: "/login" }];
}
