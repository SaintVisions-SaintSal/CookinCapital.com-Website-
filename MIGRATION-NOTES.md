# cookincapital.com v2 — migration notes

Branch: `feat/saintsal-v2`. Nothing here has been pushed to `main`.
Read this before merging: it lists the decisions I made, the things that need
Cap's call, and the manual steps that must happen outside the codebase.

---

## 1. Decisions taken, so you can reverse them if you disagree

| Decision                                                                                        | Why                                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PropertyRadar search moved off the public `/properties/search` and onto `/app/properties`        | Foreclosure stage, NOD dates, probate/divorce/bankruptcy flags and lien data are licensed for internal use only. The public route is now RentCast-only and is safe to index.            |
| `rounded-full` left circular; `rounded-lg/xl/2xl/3xl` clamped to 4px globally in `globals.css`   | Pills, avatars and dots read as intentional at full radius. Cards and panels do not. The clamp is one rule in `globals.css`, so no per-component sweep was needed.                      |
| Legacy shadcn tokens (`bg-card`, `text-muted-foreground`, `text-primary`, `border-border`) kept  | They are aliased to Kinetic Luxury values in `globals.css`, so all 64 files that use them inherit the new system automatically. Rewriting them would be churn with zero visible change.  |
| `/api/campaigns` now requires `confirmed: true` and caps `limit` at `MAX_DRAW`                   | The route calls PropertyRadar with `Purchase=1`, which spends export credits, and it was reachable unauthenticated. It is now operator-gated with an explicit spend confirmation.       |
| `PROPERTY_API` (`papi_…`) left unwired                                                           | It returns 401 against every vendor probed. Wiring it would add a dependency that cannot work. Listed in `UNWIRED_KEYS` so nobody rediscovers it.                                       |
| `DNC_PROVIDER_API` intentionally left empty in `.env.example`                                     | The outbound gate fails **closed**: with no scrub provider configured, every phone channel is blocked. That is the correct posture until a vendor is contracted.                        |

---

## 2. Manual steps — these cannot be done from the repo

### 2.1 Vercel environment cleanup

`lib/env.ts` reads a canonical name and falls back to the legacy aliases, so
production cannot break mid-rename. Once the canonical names below are set in
Vercel, delete the aliases and then delete the `LEGACY_ALIASES` map.

| Canonical              | Delete after cutover                                                                                                             |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `PROPERTY_RADAR_API`   | `PROPERTYRADAR_API_KEY`, `PROPERTY_RADAR_API_KEY`, `PROPERTYRADAR_API`, `PROPERTY_RADAR_API_TOKEN`, `NEXT_PUBLIC_PROPERTY_RADAR_API` |
| `RENTCAST_API`         | `RENTCAST_API_KEY`                                                                                                               |
| `GOOGLE_MAPS_API`      | `GOOGLE_MAPS_API_KEY`, `GOOGLE_PLACES_API_KEY`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, `GOOGLE_MAPS_SECRET_KEY`                       |
| `ALPACA_API_KEY_ID`    | `ALPACA_API_KEY`, `ALPACA_KEY_ID`                                                                                                |
| `ALPACA_SECRET_KEY`    | `ALPACA_API_SECRET_KEY`                                                                                                          |
| `GHL_API_KEY`          | `GOHIGHLEVEL_API_KEY`, `HIGHLEVEL_API_KEY`                                                                                       |
| `GHL_LOCATION_ID`      | `GOHIGHLEVEL_LOCATION_ID`                                                                                                        |
| `ELEVENLABS_API_KEY`   | `ELEVEN_LABS_API_KEY`                                                                                                            |
| — (do not set)         | `PROPERTY_API`, `PROPERTY_API_KEY`, `PROPERTYAPI_KEY`                                                                            |

`NEXT_PUBLIC_PROPERTY_RADAR_API` deserves its own line: a `NEXT_PUBLIC_`
PropertyRadar key ships the credential to every browser. Delete it, and rotate
that token.

### 2.2 Supabase

`supabase/migrations/PROPOSED_20260804_rls_and_suppression.sql` is written but
**not applied**. It enables RLS on `public.properties` (currently off, so the
anon key can read the whole table) and creates the `outbound_suppression` and
`outbound_attempts` tables the compliance gate depends on. Enabling RLS will
break any client-side read of `properties` with the anon key — confirm every
read goes through a server route, then run it on a branch project first.

---

## 3. Compliance — what is enforced in code, and what still needs counsel

Enforced in code (`lib/compliance/outbound-gate.ts`, called by
`/api/voice/synthesize` when `purpose: "outbound"`):

- Blocks unless the lead cleared the compliance gate.
- Blocks every phone channel while `DNC_PROVIDER_API` is unset — no number is
  assumed callable.
- Blocks AI voice, SMS and ringless voicemail without prior express **written**
  consent on file, per the FCC's February 2024 declaratory ruling, and prepends
  the identification + artificial-voice + opt-out preamble to the script.
- Blocks recording in all-party-consent states — and where the consumer's state
  is unknown — unless the consent line is in the script.
- Blocks prohibited language: advance-fee requests, "save your home" style
  outcome claims, and guarantees.

Copy corrections made for the same reason: `/capital` no longer says "Save your
home" or "Quick approval", and the pre-qualification line now states plainly
that it is a soft inquiry with a hard pull only on a full application.
`/invest` no longer says investors "earn" 9–12%; it says the fund targets it,
and it now states that Rule 506(c) obliges us to verify accredited status
rather than accept self-certification.

Still needs Cap and counsel:

1. **Offering disclosure.** `/legal/disclosures` §07 is marked
   `PLACEHOLDER — PENDING SECURITIES COUNSEL REVIEW`. It must be checked against
   the Fund I PPM before any further solicitation.
2. **Substantiation file.** `$2B+ deployed`, `$3B+ distressed resolved`, `50+
   lenders`, `10,000+ businesses served`, `1000+ deals analysed` are presented as
   cumulative totals in §06. Someone needs to be able to produce the underlying
   schedule on request.
3. **DNC vendor.** Choose one, then set `DNC_PROVIDER_API`. Outbound is blocked
   until then, by design.
4. **CA data-broker registration.** If we sell or license personal information
   about consumers with whom we have no direct relationship, registration is
   required in the January 1–31 window with a $6,000 fee, and DELETE Act
   deletion processing obligations follow.
5. **Foreclosure-consultant posture.** If any homeowner-facing workflow ever
   offers, for compensation, to stop a sale or negotiate with a lender, CA DOJ
   registration and a $100,000 bond are required. Today the site does not offer
   this; keep it that way unless the registration is in hand.

---

## 4. Data honesty

`lib/intelligence/store.ts` now attaches `dataFlags` to every derived property
record: `cap_rate_implausible` (>15% in Orange County is almost always an AVM
artefact), `avm_may_exclude_land` (manufactured/mobile), `value_below_land_floor`
and `no_square_footage`. The screener marks flagged cap rates and excludes them
from the median, so a broken AVM cannot manufacture a headline yield. This was
found during QA: the unfiltered corpus put a cluster of manufactured homes with
24%+ apparent cap rates at the top of the yield sort.

---

## 5. Known gaps

- Leads live in an in-memory store (`lib/intelligence/store.ts`) seeded from the
  RentCast corpus. Supabase persistence is not wired.
- No credit-budget ledger. `MAX_DRAW` caps a single draw but nothing tracks
  cumulative spend across draws.
- The corpus is Orange County only: 2,400 records, 868 independently valued,
  21 ZIP trend series.
- The HOT lead tier is untested — the top seed score is 65.6.
- `/properties/search` has no map. A dark map with gold markers is still to do.
- `/app/markets` (Alpaca advisor) is not built.
