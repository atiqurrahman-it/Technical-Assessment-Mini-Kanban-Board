"use client";

import { useEffect } from "react";
import "./globals.css";

/**
 * Root-level error boundary — only fires when the root layout itself throws,
 * which is why it renders its own <html>/<body> (it replaces layout.tsx
 * entirely rather than nesting inside it). Kept deliberately minimal — no
 * providers, no custom fonts — so it has as little as possible left to fail.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold text-gray-900">Application error</h1>
            <p className="max-w-sm text-sm text-gray-500">
              Something went wrong and the app couldn&apos;t recover on its own. Reloading
              usually fixes this.
            </p>
          </div>
          <button
            onClick={reset}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
