"use client";

import { useEffect, useRef, useState } from "react";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  risk: "Low" | "Medium" | "High";
}

interface WorldMapProps {
  pins: MapPin[];
  onPinEnter?: (pin: MapPin) => void;
  onPinLeave?: () => void;
  fill?: string;
  stroke?: string;
}

const RISK_COLOR = { Low: "#00ff88", Medium: "#f59e0b", High: "#ef4444" } as const;
const RISK_GLOW  = {
  Low: "rgba(0,255,136,0.45)",
  Medium: "rgba(245,158,11,0.45)",
  High: "rgba(239,68,68,0.45)",
} as const;

const W = 920;
const H = 490;

export function WorldMap({
  pins,
  onPinEnter,
  onPinLeave,
  fill = "#dde4ef",
  stroke = "#1a3560",
}: WorldMapProps) {
  const [paths, setPaths] = useState<string[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      import("d3-geo"),
      import("topojson-client"),
      fetch("/countries-110m.json").then((r) => r.json()),
    ]).then(([d3geo, topojson, topo]) => {
      const proj = d3geo
        .geoNaturalEarth1()
        .scale(158)
        .center([10, 5])
        .translate([W / 2, H / 2]);

      const pathGen = d3geo.geoPath().projection(proj);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const collection = (topojson as any).feature(topo, topo.objects.countries);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ps: string[] = collection.features.map((f: any) => pathGen(f) ?? "");

      projRef.current = proj;
      setPaths(ps);
      setReady(true);
    });
  }, []);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill={fill} stroke={stroke} strokeWidth={0.4} />
      ))}

      {ready &&
        pins.map((pin) => {
          const coords = projRef.current?.([pin.lng, pin.lat]) as
            | [number, number]
            | null;
          if (!coords) return null;
          const [x, y] = coords;
          const color = RISK_COLOR[pin.risk];
          const glow  = RISK_GLOW[pin.risk];

          return (
            <g
              key={pin.id}
              transform={`translate(${x},${y})`}
              onMouseEnter={() => onPinEnter?.(pin)}
              onMouseLeave={() => onPinLeave?.()}
              style={{ cursor: "pointer" }}
            >
              <circle fill={glow}>
                <animate attributeName="r" from="4" to="22" dur="1.8s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.7" to="0" dur="1.8s" repeatCount="indefinite" />
              </circle>
              <circle fill={glow}>
                <animate attributeName="r" from="4" to="13" dur="1.8s" begin="0.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.8s" begin="0.5s" repeatCount="indefinite" />
              </circle>
              <circle
                r={5.5}
                fill={color}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={1.2}
                style={{ filter: `drop-shadow(0 0 5px ${color})` }}
              />
            </g>
          );
        })}
    </svg>
  );
}
