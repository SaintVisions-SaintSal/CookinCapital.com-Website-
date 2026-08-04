/** Numeric formatting. Every number in this product is mono + tabular. */

export const nf = (v: number, d = 0) =>
  v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export function usd(v: number | null | undefined, opts?: { compact?: boolean }): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  if (opts?.compact) {
    const abs = Math.abs(v);
    if (abs >= 1_000_000_000) return `$${nf(v / 1_000_000_000, 2)}B`;
    if (abs >= 1_000_000) return `$${nf(v / 1_000_000, 2)}M`;
    if (abs >= 10_000) return `$${nf(v / 1_000, 0)}K`;
  }
  return `$${nf(Math.round(v))}`;
}

export function pct(v: number | null | undefined, d = 1, alreadyPct = false): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return `${nf(alreadyPct ? v : v * 100, d)}%`;
}

export function ratio(v: number | null | undefined, d = 2): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return `${nf(v, d)}×`;
}

export function plain(v: number | null | undefined, d = 0): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return nf(v, d);
}

export function count(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return nf(v);
}

export function shortAddress(a: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}): string {
  return [a.address, a.city, a.state, a.zip].filter(Boolean).join(", ") || "—";
}
