-- ═══════════════════════════════════════════════════════════════════
-- PROPOSED — NOT APPLIED. Review before running.
-- Target Supabase project: zqhsxjtlaymfotruvvvn
-- ═══════════════════════════════════════════════════════════════════
--
-- Two things this migration does:
--   1. Locks down `public.properties`. Row Level Security is currently OFF,
--      which means anyone holding the anon key — which ships to every browser
--      by design — can read the whole table, including any licensed distress
--      field that lands in it. Enabling RLS with no permissive anon policy
--      makes the table reachable only through the service role, i.e. only
--      through our own server routes, which already enforce the provenance
--      split.
--   2. Creates `public.outbound_suppression`, the table
--      lib/compliance/outbound-gate.ts reads before any outbound attempt.
--
-- APPLY ORDER MATTERS. Enabling RLS will break any client-side query that
-- currently reads `properties` with the anon key. Before running step 1,
-- confirm every read path goes through a server route. Run in a branch or
-- staging project first.

begin;

-- ─────────────────────────────────────────────────────────────────────
-- 1. public.properties — service-role only
-- ─────────────────────────────────────────────────────────────────────
alter table public.properties enable row level security;

-- No policy is created for anon or authenticated on purpose: with RLS enabled
-- and no permissive policy, those roles get zero rows. The service role
-- bypasses RLS, so server routes are unaffected.
--
-- If a genuinely public read is needed later, add a policy that names the
-- allowed columns via a view rather than opening the base table, e.g.:
--
--   create view public.properties_public as
--     select rc_id, formatted_address, city, state, zip_code, property_type,
--            bedrooms, bathrooms, square_footage, year_built,
--            rentcast_avm, rentcast_rent
--       from public.properties;
--   grant select on public.properties_public to anon, authenticated;
--
-- Licensed PropertyRadar fields (foreclosure stage, NOD dates, probate,
-- divorce, bankruptcy, liens, auction economics, predictive scores) must never
-- appear in such a view.

-- ─────────────────────────────────────────────────────────────────────
-- 2. public.outbound_suppression — permanent do-not-contact ledger
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.outbound_suppression (
  id           uuid primary key default gen_random_uuid(),
  -- Normalised contact point: digits only for phones, lowercased for email.
  value        text        not null,
  channel      text        not null check (channel in ('phone', 'email', 'address', 'all')),
  -- Why this contact point is suppressed. Never delete rows; suppression is
  -- permanent and an audit trail is the defence in a TCPA claim.
  reason       text        not null check (
                 reason in ('consumer_request', 'dnc_registry', 'litigator', 'bounce',
                            'unsubscribe', 'wrong_party', 'legal_hold', 'manual')
               ),
  source       text,
  radar_id     text,
  suppressed_at timestamptz not null default now(),
  created_by   uuid references auth.users (id)
);

create unique index if not exists outbound_suppression_value_channel_idx
  on public.outbound_suppression (value, channel);
create index if not exists outbound_suppression_radar_idx
  on public.outbound_suppression (radar_id);

alter table public.outbound_suppression enable row level security;

-- Operators may read the ledger and add to it. Nobody may update or delete:
-- once suppressed, always suppressed.
create policy "operators read suppression"
  on public.outbound_suppression for select
  to authenticated using (true);

create policy "operators insert suppression"
  on public.outbound_suppression for insert
  to authenticated with check (true);

comment on table public.outbound_suppression is
  'Permanent do-not-contact ledger. Checked by lib/compliance/outbound-gate.ts before every outbound attempt. Rows are never updated or deleted — retained as the audit trail for TCPA and CAN-SPAM defence.';

-- ─────────────────────────────────────────────────────────────────────
-- 3. public.outbound_attempts — what we said, to whom, and why it was allowed
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.outbound_attempts (
  id             uuid primary key default gen_random_uuid(),
  radar_id       text,
  channel        text        not null,
  contact_value  text        not null,
  allowed        boolean     not null,
  blockers       jsonb       not null default '[]'::jsonb,
  -- The exact preamble read to the consumer: AI-voice disclosure and, where
  -- required, the recording-consent line. This is the evidence that the call
  -- complied with FCC-24-17 and Cal. Penal Code §632.
  preamble       jsonb       not null default '[]'::jsonb,
  consent_ref    text,
  operator_id    uuid references auth.users (id),
  attempted_at   timestamptz not null default now()
);

create index if not exists outbound_attempts_radar_idx on public.outbound_attempts (radar_id);
create index if not exists outbound_attempts_time_idx  on public.outbound_attempts (attempted_at desc);

alter table public.outbound_attempts enable row level security;

create policy "operators read attempts"
  on public.outbound_attempts for select
  to authenticated using (true);

commit;
