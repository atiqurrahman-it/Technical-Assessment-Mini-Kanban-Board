"use client";

import { useEffect } from "react";

/**
 * Initialises the LocatorJS runtime in development mode so you can
 * click any component in the browser and jump straight to its source.
 *
 * Only loaded on the client and only active when NODE_ENV === "development".
 */
export default function LocatorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Dynamic import — never bundled in production builds
      import("@locator/runtime").then(({ default: setupLocatorUI }) => {
        setupLocatorUI({
          adapter: "react",
          projectPath: "/home/atiqur-rahman/Desktop/customs-analytics-platform",
          // ── Replace if your container/server path differs from local ──
          // replacePath: {
          //   from: "/app/",
          //   to: "/home/atiqur-rahman/Desktop/customs-analytics-platform/",
          // },
          targets: {
            vscode: {
              url: "vscode://file/${projectPath}${filePath}:${line}:${column}",
              label: "VSCode",
            },
            // Add Antigravity IDE if that's what you're using:
            // antigravity: {
            //   url: "antigravity://file/${projectPath}${filePath}:${line}:${column}",
            //   label: "Antigravity",
            // },
          },
          showIntro: true,
        });
      });
    }
  }, []);

  return <>{children}</>;
}
