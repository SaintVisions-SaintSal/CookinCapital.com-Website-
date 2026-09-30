# CC-01 verification

Verified September 29, 2026. This branch is not approved for production promotion.

## Passed

- `npm run test:intake`: 27 unit/contract checks passed.
- `npm run build`: completed after the route wiring and dependency fixes.
- Ten built-server checks passed: recovery and reset routes return 200; missing callback and unauthenticated completion redirect; operations returns 404 anonymously; dispatch and receipt reject unauthenticated POSTs; intake rejects missing origin; protected dashboard redirects; webhook health no longer claims a verified CRM connection.
- Eight Playwright scenarios passed: desktop inquiry, mobile width, failed-submit retry identity, signup callback destination, recovery callback/non-enumeration wording, mismatched passwords/expired recovery session, mobile recovery, and the mobile Get SAL link.
- Browser success responses used explicitly mocked external auth/CAPTCHA/intake services. No real account, contact, email or SMS was created.
- `git diff --check`: no whitespace errors.
- Preview safety checks: API POST returns 503; full application routes render the disconnected review screen instead of loading a live GHL form; operations is still 404 without allowlisted auth.
- `npm audit --omit=dev`: zero critical, high or moderate advisories; four low advisories remain in the existing AI SDK dependency tree.

## Not a full green build

The independent TypeScript check still reports 45 pre-existing diagnostics. Its output matches the pre-repair baseline with no additional diagnostics. The repository's existing `ignoreBuildErrors: true` means a successful Next.js build is not equivalent to type-check success; that setting was not introduced or changed by this repair.

No isolated database migration/concurrency/RLS execution, real email delivery, actual GHL workflow completion, signed-in persistence, staff assignment or provider entitlement test was performed.

## Corrections discovered during browser verification

The original `/prequal` route used GHL form `t0RuqARBjSTCU6Nmonvq`; the older `PreQualPage` component referred to a different form and was not routed there. The branch now explicitly connects `/prequal` to the new short inquiry component. Any earlier finding about placeholder links in form `gPGc1pTZGRvxybqPpDRL` applies to that legacy component's form, not proof about the actual live `/prequal` form.

Browser QA also caught an error-state bug where CAPTCHA reset cleared the failed-submit message. The reset callback now updates only the CAPTCHA token, and the failed-submit/retry check passes.

## Package and deployment handling

Next.js was upgraded from 16.0.10 to 16.3.7; compatible dependency audit fixes were applied. Use the tested npm lockfile with `npm ci`. The stale parallel pnpm lockfile was removed.

The private hosted review runs with `CC_PREVIEW_MODE=true`, no real provider keys and no auth database binding. Do not treat it as customer onboarding proof or promote its build artifacts to production.
