"use client"

/**
 * Kinetic Luxury primitives. Everything data-forward in the app is composed
 * from these so density, hairlines and type discipline stay consistent.
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ScoreBreakdownDTO, Tier } from "@shared/schema";
import { Skyline } from "@/components/brand";

// ── Panel ──────────────────────────────────────────────────────────

export function Panel({
  children,
  className,
  raised = false,
  ...rest
}: { children: ReactNode; className?: string; raised?: boolean } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(raised ? "kl-panel-raised" : "kl-panel", className)} {...rest}>
      {children}
    </div>
  );
}

export function PanelHeader({
  title,
  right,
  sub,
  className,
}: {
  title: ReactNode;
  right?: ReactNode;
  sub?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b border-outline-variant/50 px-3 py-2.5 sm:px-4",
        className
      )}
    >
      <div className="min-w-0">
        <div className="kl-label truncate">{title}</div>
        {sub && <div className="mt-0.5 truncate text-[11px] text-on-surface-variant/70">{sub}</div>}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("kl-label", className)}>{children}</div>;
}

// ── Tier badge ─────────────────────────────────────────────────────

export function TierBadge({
  tier,
  size = "sm",
  testId,
}: {
  tier: Tier;
  size?: "sm" | "md";
  testId?: string;
}) {
  const base = cn(
    "inline-flex items-center justify-center border font-mono uppercase tracking-protocol",
    size === "md" ? "h-7 px-2.5 text-[11px]" : "h-5 px-1.5 text-[9px]"
  );
  const styles: Record<Tier, string> = {
    HOT: "border-gold/70 bg-gold/10",
    WARM: "border-gold/45 bg-gold/[0.06] text-gold",
    NURTURE: "border-outline/60 text-on-surface-variant",
    COLD: "border-outline-variant/60 text-outline",
  };
  return (
    <span className={cn(base, styles[tier])} data-testid={testId ?? `badge-tier-${tier}`}>
      {tier === "HOT" ? <span className="gold-foil font-bold">HOT</span> : tier}
    </span>
  );
}

// ── Signal chip ────────────────────────────────────────────────────

const SEVERE = /vacan|deceas|probate|auction|preforeclos|bankrupt|divorce|delinquent|evict|bank owned/i;
const CONTACT = /phone|email|mobile/i;

export function SignalChip({ label }: { label: string }) {
  const severe = SEVERE.test(label);
  const contact = CONTACT.test(label);
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap border px-1.5 font-mono text-[9px] uppercase tracking-[0.08em]",
        severe
          ? "border-gold/40 bg-gold/[0.07] text-gold-light"
          : contact
            ? "border-outline/50 text-on-surface-variant"
            : "border-outline-variant/70 text-outline"
      )}
      data-testid={`chip-signal-${label.toLowerCase().replace(/\s+/g, "-")}`}
    >
      {label}
    </span>
  );
}

// ── Metric cell ────────────────────────────────────────────────────

export function Metric({
  label,
  value,
  hint,
  tone = "default",
  className,
  testId,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "gold" | "muted" | "warn";
  className?: string;
  testId?: string;
}) {
  return (
    <div className={cn("min-w-0 px-3 py-2.5 sm:px-4", className)}>
      <div className="kl-label truncate" title={label}>
        {label}
      </div>
      <div
        className={cn(
          "num mt-1 truncate text-[17px] font-medium leading-tight",
          tone === "gold" && "text-gold",
          tone === "muted" && "text-outline",
          tone === "warn" && "text-gold-light",
          tone === "default" && "text-on-surface"
        )}
        data-testid={testId}
      >
        {value}
      </div>
      {hint && (
        <div className="mt-1 font-mono text-[10px] leading-snug text-on-surface-variant/60">
          {hint}
        </div>
      )}
    </div>
  );
}

// ── Live pulse ─────────────────────────────────────────────────────

export function LiveDot({ label = "LIVE" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" data-testid="status-live">
      <span className="pulse-dot h-1.5 w-1.5 rounded-full bg-pulse" />
      <span className="font-mono text-[9px] uppercase tracking-protocol text-pulse/90">{label}</span>
    </span>
  );
}

// ── Score component bars ───────────────────────────────────────────

export const SCORE_COMPONENTS: Array<{
  key: keyof Pick<ScoreBreakdownDTO, "equity" | "distress" | "dealSpread" | "timing" | "contactability">;
  label: string;
  max: number;
}> = [
  { key: "equity", label: "Equity", max: 35 },
  { key: "distress", label: "Distress", max: 30 },
  { key: "dealSpread", label: "Spread", max: 20 },
  { key: "timing", label: "Timing", max: 10 },
  { key: "contactability", label: "Contact", max: 5 },
];

export function ScoreBars({
  breakdown,
  compact = false,
}: {
  breakdown: ScoreBreakdownDTO;
  compact?: boolean;
}) {
  return (
    <div className={cn("space-y-2.5", compact && "space-y-2")} data-testid="chart-score-components">
      {SCORE_COMPONENTS.map((c) => {
        const v = Number(breakdown[c.key] ?? 0);
        const w = Math.max(0, Math.min(100, (v / c.max) * 100));
        return (
          <div key={c.key}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="kl-label">{c.label}</span>
              <span className="num text-[11px] text-on-surface">
                {v.toFixed(1)}
                <span className="text-outline"> / {c.max}</span>
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full bg-surface-lowest ring-1 ring-inset ring-outline-variant/50">
              <div
                className="gold-foil-fill h-full"
                style={{ width: `${w}%` }}
                data-testid={`bar-${c.key}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── HACP reasoning trail ───────────────────────────────────────────

export function ReasoningTrail({
  reasons,
  scoreVersion,
  className,
}: {
  reasons: string[];
  scoreVersion?: string;
  className?: string;
}) {
  return (
    <div className={cn("kl-well", className)} data-testid="list-reasoning-trail">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-outline-variant/50 px-3 py-2.5 sm:px-4">
        <div className="kl-label">
          HACP™ Reasoning Trail
          <span className="ml-2 normal-case tracking-normal text-outline/80">
            US Patent #10,290,222
          </span>
        </div>
        {scoreVersion && (
          <span className="num text-[10px] text-outline">model v{scoreVersion}</span>
        )}
      </div>
      {reasons.length === 0 ? (
        <div className="px-3 py-4 text-[12px] text-outline sm:px-4">
          No reasoning steps recorded for this record.
        </div>
      ) : (
        <ol className="divide-y divide-outline-variant/30">
          {reasons.map((r, i) => (
            <li
              key={i}
              className="flex gap-3 px-3 py-2.5 sm:px-4"
              data-testid={`text-reason-${i}`}
            >
              <span className="num shrink-0 pt-px text-[10px] text-gold-dark/90">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="min-w-0 text-[12px] leading-relaxed text-on-surface-variant">
                {r}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

// ── States: loading / empty / error ────────────────────────────────

export function SkeletonRows({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div data-testid="status-loading">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-outline-variant/30 px-3 py-3 sm:px-4"
        >
          {Array.from({ length: cols }).map((__, c) => (
            <div
              key={c}
              className="kl-skeleton h-3"
              style={{ flex: c === 0 ? 3 : 1, opacity: 1 - r * 0.1 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("kl-skeleton", className)} data-testid="status-loading" />;
}

export function EmptyState({
  title,
  body,
  action,
  testId,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  testId?: string;
}) {
  return (
    <div
      className="relative flex flex-col items-center overflow-hidden px-6 pb-0 pt-12 text-center"
      data-testid={testId ?? "status-empty"}
    >
      <div className="relative z-10 max-w-md">
        <h3 className="text-[15px] font-semibold tracking-tight text-on-surface">{title}</h3>
        <p className="mx-auto mt-2 max-w-sm text-[12px] leading-relaxed text-on-surface-variant/80">
          {body}
        </p>
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
      <div className="pointer-events-none mt-8 w-full max-w-2xl opacity-[0.18]">
        <Skyline height={92} windows className="text-on-surface" />
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Upstream request failed",
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div
      className="mx-auto max-w-lg px-6 py-10 text-center"
      role="alert"
      data-testid="status-error"
    >
      <div className="kl-label text-gold/80">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-on-surface-variant">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="kl-lit mt-5 h-8 border border-outline/60 bg-surface-mid px-4 font-mono text-[10px] uppercase tracking-protocol text-on-surface"
          data-testid="button-retry"
        >
          Retry
        </button>
      )}
    </div>
  );
}

// ── Buttons ────────────────────────────────────────────────────────

export function GoldButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "kl-lit inline-flex h-9 items-center justify-center gap-2 border border-gold/55 bg-gold/[0.08] px-4 font-mono text-[10px] uppercase tracking-protocol text-gold-light transition-colors hover:bg-gold/[0.14] disabled:cursor-not-allowed disabled:border-outline-variant/60 disabled:bg-transparent disabled:text-outline/70 disabled:shadow-none",
        className
      )}
    >
      {children}
    </button>
  );
}

export function GhostButton({
  children,
  className,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      className={cn(
        "kl-lit inline-flex h-9 items-center justify-center gap-2 border border-outline-variant/70 bg-surface-mid px-3.5 font-mono text-[10px] uppercase tracking-protocol text-on-surface-variant hover:text-on-surface disabled:cursor-not-allowed disabled:text-outline/60 disabled:shadow-none",
        className
      )}
    >
      {children}
    </button>
  );
}
