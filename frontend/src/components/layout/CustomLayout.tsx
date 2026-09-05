"use client";

import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { AppHeader } from "./AppHeader";
import { HeaderSlotProvider } from "./HeaderSlot";

/**
 * Wraps every page. Renders the fixed `AppHeader` once for authenticated app
 * routes so individual pages no longer need to call `<AppHeader />` themselves.
 */
export function CustomLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const showHeader = pathname.startsWith("/boards") && isAuthenticated;

  return (
    <HeaderSlotProvider>
      {showHeader && <AppHeader />}
      {children}
    </HeaderSlotProvider>
  );
}
