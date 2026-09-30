# CC-01: activation and handoff

## State of this branch

This branch is a preview repair, not an operational cutover. No database was switched, no migration was applied, no staff member was assigned, no workflow was activated and no message was sent.

Use `npm ci` and the npm lockfile. The stale parallel pnpm lockfile was removed to avoid deploying a different dependency graph from the tested one. Next.js was updated to 16.3.7 and compatible audit fixes were applied; review the verification report for remaining advisories.

## Configuration required before activation

No secret belongs in this repository.

- `CC_SITE_ORIGIN`: the exact approved origin, including scheme and no trailing slash. Configure per preview/production environment; this avoids internal proxy hostnames in callbacks and validates the form origin.
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the approved auth project, not a guessed replacement.
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`: the same project as browser auth. The intake adapter rejects a URL mismatch.
- `CC_INTAKE_HASH_SECRET`: random server-only secret of at least 32 characters for rate-key hashing.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`: a matched Cloudflare Turnstile pair with the approved hostname. Server verification requires hostname equality and action `cc-intake`.
- `GHL_LOCATION_ID`: the verified existing CookinCapital location.
- `CC_GHL_INTAKE_WEBHOOK_URL`: the reviewed existing workflow's inbound URL, restricted to the configured GHL location. No hardcoded webhook is used by the new intake.
- `CC_CRM_DELIVERY_ENABLED`: absent/false by default. Set true only after reviewing the actual GHL triggers, idempotency, message content, consent gates and routing.
- `CC_INTAKE_DISPATCH_SECRET`: separate random secret of at least 32 characters. The worker accepts `Authorization: Bearer <secret>`.
- `CC_GHL_RECEIPT_SECRET`: separate random secret of at least 32 characters. GHL completion callbacks send it in `x-cc-receipt-secret`.
- `CC_OPERATOR_USER_IDS`: comma-separated verified Supabase user UUIDs. Empty means no one can view the operator queue. Do not substitute a GHL staff ID or email.
- `CC_PREVIEW_MODE=true`: limits the hosted review to approved screens, blocks API traffic and legacy forms, and suppresses analytics. Never promote a preview build without rebuilding in the approved production configuration.

## Auth project decision

The original auth project's unavailability must be resolved before launch. Either restore that project or explicitly approve identity/schema migration. Changing environment variables alone is not a migration.

Before enabling signup, verify the Supabase redirect allowlist for the intended hostname's `/auth/callback`. The signup code passes a PKCE callback. Recovery passes `/auth/callback?flow=recovery`; preserve that flow parameter in the email template. Token-hash templates are supported with `token_hash` plus `type=signup`, `email` or `recovery`. Use Supabase's confirmation URL/template instructions for the selected project rather than inventing a mail link.

Run a controlled test for verification required and immediate-session configurations, wrong/expired links, password recovery, logout/login, saved work and tenant boundaries. A mocked browser check is not email-delivery or identity-migration proof.

## Outbox migration

Review and apply `supabase/migrations/202609290001_cc_intake_outbox.sql` only to the approved project. It creates two private tables and two service-role-only functions; it does not alter existing pipeline tables or user data.

Public intake is CAPTCHA-validated, length-bounded and same-origin. A receipt is returned only after durable database acknowledgement. A repeated request key returns the existing reference; reusing the key with a changed payload returns a conflict. The database function uses a transaction-scoped advisory lock to serialize same-key requests. Rate limits are five new events per normalized-email hash per ten minutes; retries with the same key do not consume another slot.

SQL concurrency, RLS permissions and migrations must be verified on an isolated database before production. The migration file itself is not proof that those tests have passed.

## Existing GHL workflow contract

Do not replace the Commercial Lending pipeline or bulk-enroll contacts.

- Read `event_id` first. Implement durable deduplication keyed to that ID before any contact, opportunity, task or message action. An HTTP Idempotency-Key header alone is not proof that GHL deduplicates.
- Upsert contacts using reviewed location duplicate settings. Reconcile existing email/phone conflicts; do not assume upsert guarantees one contact under every location configuration. Official behavior: https://marketplace.gohighlevel.com/docs/ghl/contacts/upsert-contact
- Treat `event_type=signup` and `activity` as product activity, not lending applications.
- Create/update a lending opportunity only when `create_lending_opportunity=true`, using the verified existing pipeline/stage IDs. Never reset an existing opportunity's stage or owner solely because the customer submitted another inquiry.
- Assign a new inquiry only after Heather's identity and ownership are confirmed. Preserve existing assigned owners.
- Service SMS requires `consent.service_sms=true`, a usable number, DND/opt-out checks and the approved service-message workflow. Marketing consent is always false in this release.
- Do not send automated customer messages until exact copy, sender identity, opt-out handling and stop-on-reply rules are approved.
- After the contact and any required capital opportunity are verified, POST to `/api/intake/receipt` using the secret header and body:

```json
{
  "eventId": "<inbound event_id>",
  "contactId": "<verified GHL contact ID>",
  "opportunityId": "<verified GHL opportunity ID for capital inquiries>"
}
```

Do not send `opportunityId` for account-only activity. A capital inquiry cannot be marked confirmed without it. Duplicate identical receipts are accepted; conflicting receipts are rejected.

## Automation and failure handling

Once approved, configure a server scheduler to POST `/api/intake/dispatch` with its bearer secret at the agreed interval. No durable scheduler is enabled by this branch.

Each run leases at most five pending events. Outcomes are explicit:

- `pending`: durably saved, not sent.
- `processing`: leased by one worker.
- `accepted`: the GHL webhook returned success; CRM completion is not yet proven.
- `confirmed`: the authenticated receipt supplied CRM IDs.
- `failed`: rejected, ambiguous transport or an expired worker lease. Manual reconciliation is required before re-queuing.

Ambiguous timeouts are not blindly retried. This deliberately avoids duplicate contacts and messages until downstream idempotency is verified. Re-queue only after confirming the existing GHL outcome; this release has no public retry action.

## Heather's daily use

The protected `/operations/intake` page is an integration exception view, not a replacement CRM. It shows pending, unconfirmed and failed requests and links back to GHL's pipeline and conversations. It does not assign Heather automatically.

Inside GHL, configure and validate the remaining operational views: newly assigned inquiries, unread replies, tasks due today and overdue follow-ups. Their creation remains pending authenticated access to the workflow/staff microfrontends and confirmation of the assignment identity.

## Release gates

- [ ] Auth project/identity ownership decision.
- [ ] Isolated migration, concurrency and RLS tests.
- [ ] Authenticated saved-research and saved-deal schema reconciliation.
- [ ] Correct Turnstile hostname and secret pair.
- [ ] Review existing GHL automation and duplicate settings.
- [ ] Verify owner, stage IDs and authenticated receipt contract.
- [ ] Approve a controlled test inbox/contact.
- [ ] Real signup, verification, recovery, CRM record and delivery proof.
- [ ] Baseline TypeScript defects and remaining dependency advisories reviewed.
- [ ] Explicit production promotion and messaging activation approval.
