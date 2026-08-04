"use client"

/**
 * CookinCapital brand marks — Kinetic Luxury / Gotham language.
 * Geometric, sharp, monochrome-first, `currentColor` throughout so the marks
 * inherit gold on obsidian without hard-coding a palette.
 */

interface MarkProps {
  className?: string;
  size?: number;
}

/**
 * Primary mark: three ascending towers cut from a single square, with a
 * horizontal capital bar striking through — tower + skyline + capital.
 * Reads cleanly at 24px.
 */
export function CookinMark({ className = "", size = 28 }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="CookinCapital"
      role="img"
      className={className}
      data-testid="img-brand-mark"
    >
      <rect x="0.75" y="0.75" width="30.5" height="30.5" stroke="currentColor" strokeWidth="1.5" />
      {/* three towers, ascending */}
      <rect x="6" y="18" width="4.5" height="9" fill="currentColor" />
      <rect x="13.75" y="10" width="4.5" height="17" fill="currentColor" />
      <rect x="21.5" y="14" width="4.5" height="13" fill="currentColor" />
      {/* spire on the tallest */}
      <path d="M16 10V5" stroke="currentColor" strokeWidth="1.5" />
      {/* capital bar */}
      <path d="M4 21.25H28" stroke="currentColor" strokeWidth="1.25" opacity="0.55" />
    </svg>
  );
}

export function CookinLogo({
  compact = false,
  className = "",
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} data-testid="link-logo">
      <CookinMark size={compact ? 24 : 28} className="text-gold shrink-0" />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-[15px] font-bold tracking-[-0.01em] text-on-surface">
            Cookin<span className="text-gold">Capital</span>
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-protocol text-outline">
            Deal Intelligence
          </span>
        </span>
      )}
    </span>
  );
}

/**
 * Structural skyline motif. Used as a thin footer band and, at larger scale,
 * as the empty-state illustration. Same geometric vocabulary as the mark:
 * flat-topped towers, occasional spire, uniform gutters.
 */
export function Skyline({
  className = "",
  height = 48,
  windows = false,
}: {
  className?: string;
  height?: number;
  windows?: boolean;
}) {
  // x, width, height (of 100 units tall viewBox), spire
  const towers: Array<[number, number, number, boolean]> = [
    [0, 26, 30, false],
    [28, 18, 46, false],
    [48, 14, 62, true],
    [64, 22, 38, false],
    [88, 16, 54, false],
    [106, 30, 26, false],
    [138, 20, 70, true],
    [160, 26, 42, false],
    [188, 14, 58, false],
    [204, 24, 34, false],
    [230, 18, 66, false],
    [250, 30, 44, true],
    [282, 22, 28, false],
    [306, 16, 52, false],
    [324, 28, 38, false],
    [354, 20, 60, false],
    [376, 24, 32, false],
  ];
  const W = 400;

  return (
    <svg
      viewBox={`0 0 ${W} 100`}
      preserveAspectRatio="none"
      height={height}
      width="100%"
      fill="none"
      aria-hidden="true"
      className={className}
      data-testid="img-skyline"
    >
      {towers.map(([x, w, h, spire], i) => (
        <g key={i}>
          <rect x={x} y={100 - h} width={w} height={h} fill="currentColor" />
          {spire && (
            <path
              d={`M${x + w / 2} ${100 - h}V${Math.max(2, 100 - h - 16)}`}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          )}
          {windows &&
            Array.from({ length: Math.max(0, Math.floor((h - 8) / 12)) }).map((_, r) =>
              Array.from({ length: Math.max(1, Math.floor(w / 9)) }).map((__, c) => {
                // Deterministic lit-window pattern — no randomness across renders.
                const lit = (i * 7 + r * 5 + c * 3) % 4 === 0;
                if (!lit) return null;
                return (
                  <rect
                    key={`${r}-${c}`}
                    x={x + 3 + c * 9}
                    y={100 - h + 6 + r * 12}
                    width="3"
                    height="4"
                    className="text-gold"
                    fill="hsl(var(--gold))"
                    opacity="0.75"
                  />
                );
              })
            )}
        </g>
      ))}
    </svg>
  );
}

/** Thin skyline band that sits at the base of the app shell. */
export function SkylineFooter() {
  return (
    <div className="pointer-events-none relative select-none" aria-hidden="true">
      <div className="absolute inset-x-0 bottom-0 h-px bg-outline-variant/60" />
      <Skyline
        height={44}
        windows
        className="text-surface-high/70 [mask-image:linear-gradient(to_top,black,transparent)]"
      />
    </div>
  );
}
