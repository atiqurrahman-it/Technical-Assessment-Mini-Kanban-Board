"use client";

import NextTopLoader from "nextjs-toploader";

/** Thin indigo progress bar at the top of the viewport during route changes. */
export default function TopProgressBarProvider({ children }: { children: React.ReactNode }) {
  return (
    <>
      <NextTopLoader color="#4f46e5" height={3} shadow={false} showSpinner={false} />
      {children}
    </>
  );
}
