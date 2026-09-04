// TopProgressBarProvider.tsx
"use client"; // must be client component

import NextTopLoader from "nextjs-toploader";
import React from "react";

export default function TopProgressBarProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NextTopLoader color="#164ceeff" height={4} showSpinner={false} />
      {children}
    </>
  );
}
