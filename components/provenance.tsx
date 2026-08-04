"use client"

/**
 * Provenance UI — the governance layer, made visible.
 *
 * Every panel that renders data declares its audience and its source. The
 * `PublicSurface` wrapper enforces that declaration at runtime: if a
 * PropertyRadar-sourced field name reaches a public surface, it throws in
 * development and redacts in production.
 */

import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  assertPublicSafe,
  LICENCE_NOTE,
  type Audience,
  type DataSource,
} from "@/lib/provenance";
import { Panel, PanelHeader, SectionLabel } from "@/components/kit";

const SOURCE_META: Record<DataSource, { label: string; note: string; className: string }> = {
  rentcast: {
    label: "RentCast · Distributable",
    note: LICENCE_NOTE.rentcast,
    className: "border-pulse/25 text-pulse/80",
  },
  derived: {
    label: "Derived · HACP™",
    note: LICENCE_NOTE.derived,
    className: "border-gold/40 text-gold/90",
  },
  propertyradar: {
    label: "PropertyRadar · Internal",
    note: LICENCE_NOTE.propertyradar,
    className: "border-outline/60 text-on-surface-variant",
  },
};

export function SourceChip({
  source,
  className,
}: {
  source: DataSource;
  className?: string;
}) {
  const m = SOURCE_META[source];
  return (
    <span
      title={m.note}
      className={cn(
        "inline-flex h-5 items-center whitespace-nowrap border bg-surface-lowest/60 px-1.5 font-mono text-[9px] uppercase tracking-[0.1em]",
        m.className,
        className
      )}
      data-testid={`chip-source-${source}`}
    >
      {m.label}
    </span>
  );
}

/** Header marker for operator-only screens. Deliberate, not alarming. */
export function InternalChip({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-5 items-center gap-1.5 whitespace-nowrap border border-gold-dark/70 bg-gold-dark/[0.12] px-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-gold-light/90",
        className
      )}
      data-testid="chip-internal-only"
    >
      <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
        <rect x="0.75" y="3.25" width="6.5" height="4" stroke="currentColor" strokeWidth="1" fill="none" />
        <path d="M2.25 3.25V2.25a1.75 1.75 0 013.5 0v1" stroke="currentColor" strokeWidth="1" fill="none" />
      </svg>
      Internal — CookinCapital operators only
    </span>
  );
}

/**
 * Declares a rendering surface's audience and the field names it renders.
 * Public surfaces are validated against the provenance registry on every
 * render, so a regression surfaces immediately in development.
 */
export function PublicSurface({
  fields,
  component,
  audience = "public",
  children,
}: {
  fields: string[];
  component: string;
  audience?: Audience;
  children: ReactNode;
}) {
  assertPublicSafe(fields, component, audience);
  return <>{children}</>;
}

interface ProvenanceManifest {
  licences: Record<string, string>;
  fields: Record<string, string[]>;
  counts: { rentcast: number; propertyradar: number; derived: number };
  corpus: { properties: number; valued: number; fetchedAt: string | null };
  enforcement: string;
}

/**
 * The governance panel. This is a selling point, not boilerplate: it shows
 * the licence split, the field counts on each side of the wall, and the fact
 * that the wall is enforced in code.
 */
export function ProvenancePanel({ className }: { className?: string }) {
  const { data } = useQuery<ProvenanceManifest>({
    queryKey: ["/api/governance/provenance"],
  });

  const rows: Array<{ source: DataSource; count: number | null; body: string }> = [
    {
      source: "rentcast",
      count: data?.counts.rentcast ?? null,
      body: "Bulk-licensed property, owner-type, assessment, valuation and market data. Rendered in every investor-facing surface, exportable and syndicatable.",
    },
    {
      source: "derived",
      count: data?.counts.derived ?? null,
      body: "CookinCapital work product — Deal Intelligence Score, investment metrics, reasoning trails and compliance determinations. Ours to display.",
    },
    {
      source: "propertyradar",
      count: data?.counts.propertyradar ?? null,
      body: "Foreclosure stage, lien, probate, divorce, bankruptcy, vacancy and predictive signals. Confined to operator surfaces by contract.",
    },
  ];

  return (
    <Panel className={className} data-testid="panel-governance">
      <PanelHeader
        title="Data Governance"
        sub="Two upstream licences, one hard wall — enforced in code, not policy"
        right={<SectionLabel>Provenance</SectionLabel>}
      />
      <div className="divide-y divide-outline-variant/40">
        {rows.map((r) => (
          <div key={r.source} className="px-3 py-3 sm:px-4">
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5">
              <SourceChip source={r.source} />
              <span className="num text-[11px] text-outline">
                {r.count === null ? "—" : `${r.count} fields`}
              </span>
            </div>
            <p className="mt-2 text-[11.5px] leading-relaxed text-on-surface-variant/85">
              {r.body}
            </p>
          </div>
        ))}
      </div>
      <div className="border-t border-outline-variant/40 bg-surface-lowest/50 px-3 py-3 sm:px-4">
        <SectionLabel>Enforcement</SectionLabel>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-on-surface-variant/80">
          {data?.enforcement ??
            "Provenance is enforced at render time — a PropertyRadar-tagged field reaching a public component throws in development and is redacted in production."}
        </p>
        {data?.corpus && (
          <p className="num mt-2 text-[10.5px] text-outline">
            Corpus: {data.corpus.properties.toLocaleString()} records ·{" "}
            {data.corpus.valued.toLocaleString()} with live valuations
          </p>
        )}
      </div>
    </Panel>
  );
}
