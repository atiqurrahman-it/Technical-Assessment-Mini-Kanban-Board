"use client";

import type { ISourceOptions } from "@tsparticles/engine";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";

export default function ParticleBg() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => setInit(true));
  }, []);

  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: true, zIndex: 0 },
      background: {
        // background: radial-gradient(50% 50% at 50% 50%, #3391FF 0%, rgba(51, 145, 255, 0.00) 100%);
        color: { value: isDark ? "#070812" : "#E0EFFF" },
      },
      particles: {
        number: { value: isDark ? 120 : 60 },
        color: { value: isDark ? "#5AA9FF" : "#1e293b" },
        size: { value: { min: 1, max: 2 } },
        move: { enable: true, speed: 0.3 },
        opacity: { value: isDark ? 0.6 : 0.4 },
      },
    }),
    [isDark],
  );

  if (!init) return null;

  return <Particles key={resolvedTheme} id="tsparticles" options={options} />;
}
