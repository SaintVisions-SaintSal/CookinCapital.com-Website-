# Build CC-01: account and intake repair

## Approved boundary

Work in the existing repository, preserve its design and Commercial Lending pipeline, and validate a preview. No production database switch, migration execution, bulk enrollment, staff assignment, messaging, or production deployment. No additional npm dependency is required.

## Implementation sequence

- Auth: add `lib/auth-flow.ts`, fix signup/login/callback, add forgot-password/reset-password/complete pages. Safe relative redirects only; missing/expired confirmations are errors, never successful activation. Recovery pages remain accessible to signed-in recovery sessions.
- Intake: replace the long first-touch embed with a short form in `components/landing/prequal-page.tsx`; preserve `/apply` as the full application. Add a CAPTCHA-validated `/api/intake` receiver.
- Persistence: add an unapplied SQL migration for a private CRM outbox, atomic idempotency, rate limiting and worker leasing. No client access to the outbox.
- Delivery: queue confirmed-account CRM events and explicit inquiries. A gated worker forwards to the existing GHL workflow only after configuration approval. HTTP acceptance is not contact/opportunity creation; require a separately authenticated workflow receipt.
- Operations: add an allowlisted exception page with no guessed owner. GHL remains the system of record for contacts, stages and conversations.
- Verification: unit tests for redirects, validation, idempotency-facing contracts and delivery states; local endpoint tests; Playwright desktop/mobile checks with explicitly mocked external responses. No live test accounts or messages.

## Do not edit

Production configuration, existing GHL stages/workflows/contacts, other repositories, the unmerged redesign, PropertyRadar credentials, provider entitlements, fund/legal claims and existing customer identities are outside this repair.

## Verification commands

```sh
npm run test:intake
npm run build
npx tsc --noEmit --pretty false
npm audit --omit=dev
curl -i http://localhost:3000/auth/forgot-password
curl -i http://localhost:3000/auth/callback
curl -i http://localhost:3000/api/intake/dispatch
curl -i http://localhost:3000/operations/intake
```

Expected: tests pass; build completes; no new TypeScript diagnostics versus the recorded baseline; missing callback credentials redirect to an error page; dispatch rejects missing authorization; operator data is not public. The critical/high dependency findings were resolved with the existing dependency updates. Baseline TypeScript errors and remaining low advisories must not be represented as a clean full-project signoff.

Commit: `Build CC-01: repair account flow and stage observable intake`.

Metro and EAS are not applicable to this existing web application.
