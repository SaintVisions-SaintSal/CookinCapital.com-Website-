"use client"

/**
 * Inline SVG sparkline for 12-month market trend series. No chart library —
 * a single path, a gold gradient fill, and an optional last-point marker.
 */

import { cn } from "@/lib/utils";

export function Sparkline({
  values,
  labels,
  width = 220,
  height = 44,
  className,
  testId,
}: {
  values: Array<number | null | undefined>;
  labels?: string[];
  width?: number;
  height?: number;
  className?: string;
  testId?: string;
}) {
  const pts = values
    .map((v, i) => ({ v, i }))
    .filter((p): p is { v: number; i: number } => typeof p.v === "number" && Number.isFinite(p.v));

  if (pts.length < 2) {
    return (
      <div
        className={cn("flex items-center font-mono text-[10px] text-outline", className)}
        style={{ height }}
        data-testid={testId}
      >
        Insufficient history
      </div>
    );
  }

  const min = Math.min(...pts.map((p) => p.v));
  const max = Math.max(...pts.map((p) => p.v));
  const span = max - min || 1;
  const pad = 3;
  const x = (i: number) => pad + (i / (values.length - 1)) * (width - pad * 2);
  const y = (v: number) => height - pad - ((v - min) / span) * (height - pad * 2);

  const line = pts.map((p, k) => `${k === 0 ? "M" : "L"}${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(pts[pts.length - 1]!.i).toFixed(1)} ${height - pad} L${x(pts[0]!.i).toFixed(1)} ${height - pad} Z`;
  const last = pts[pts.length - 1]!;
  const rising = last.v >= pts[0]!.v;
  const gradId = `spark-${Math.abs(hash(String(values.join(","))))}`;

  return (
    <svg
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className={cn("overflow-visible", className)}
      role="img"
      aria-label={
        labels?.length
          ? `Trend from ${labels[pts[0]!.i]} to ${labels[last.i]}`
          : "12-month trend"
      }
      data-testid={testId}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--gold))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--gold))" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      <path
        d={line}
        fill="none"
        stroke="hsl(var(--gold))"
        strokeWidth="1.25"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={rising ? 1 : 0.75}
      />
      <circle cx={x(last.i)} cy={y(last.v)} r="2" fill="hsl(var(--gold-light))" />
    </svg>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return h;
}
