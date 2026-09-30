# CC-01 QA inventory

## Claims to verify

- The four-field inquiry renders on desktop and mobile without horizontal overflow.
- Optional phone/SMS inputs begin unchecked and are not required for email-only intake.
- Privacy/terms resolve to the site's legal center, not placeholder domains.
- Submission feedback distinguishes a saved request from a sent message or approved loan.
- Failed submission remains visible and retries retain the same request ID.
- Signup sends confirmation to `/auth/callback` and never accepts an external `next` destination.
- Missing callback credentials redirect to an error, not the app.
- Recovery is a real route; success wording does not disclose account existence.
- Mismatched passwords and expired recovery sessions are visible errors.
- Homepage Get SAL goes to account creation on desktop and mobile.
- Anonymous visitors cannot view the operator queue or invoke dispatch/receipt.
- Missing provider configuration produces an unavailable state, not a successful lead.
- Hosted preview blocks live APIs and legacy application forms.

## Functional checks

Run contract unit tests, built-server HTTP checks, and Playwright interaction checks. External auth, CAPTCHA and successful intake responses in browser tests are explicitly mocked using reserved `.invalid` / `.example` domains. They cannot be used as live delivery proof.

## Visual checks

Capture inquiry, signup and recovery screens at 1440×1000 and 375×900. Verify viewport width, labels, disabled/unavailable state, success, inline errors and expanded optional contact controls. Keep the original brand components and colors.

## Adversarial checks

Reject external redirects, missing/wrong origins, oversized payloads, unknown fields, incomplete SMS consent, unauthenticated receipt/dispatch, invalid callback tokens and an uncertain network delivery. Do not call the live GHL webhook, create a user or send a message.

## Still requires live proof

Database migration/RLS/concurrency, email confirmation and password delivery, actual GHL deduplication/assignment/receipts, signed-in persistence and the final owner queue all require approved configuration and a controlled real test.
