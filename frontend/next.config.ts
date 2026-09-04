import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal `.next/standalone` server bundle for the Docker image.
  output: "standalone",
  // Pins the workspace root so Turbopack doesn't get confused by an
  // unrelated lockfile elsewhere on the host (e.g. in a parent directory).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
