"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps `next-themes`. The product is light-mode only by design, so theming
 * is pinned to "light" (no toggle exposed) rather than left unconfigured —
 * this still gives us the `class`-based token wiring for free if that
 * changes later.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      {children}
    </NextThemesProvider>
  );
}
