"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Wraps `next-themes`. Toggles the `dark` class on `<html>` — see the `.dark`
 * block in globals.css for the token overrides — and defaults to the user's
 * OS preference until they explicitly pick a theme via `ThemeToggle`.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}
