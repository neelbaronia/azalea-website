# Grandfathered membership access

An account has access when the server finds either a valid explicit access grant
or an active/trialing subscription whose period has not ended. Grandfathered
access is independent of Stripe billing. Granting it does not cancel, refund,
create, or modify a subscription.

## Policy

The cutoff is an explicit UTC timestamp chosen for the membership rollout.
Eligibility uses `auth.users.created_at < cutoff`, never an editable profile
field. The app repository introduced its membership gate on September 4, 2026
UTC; that commit date alone does not establish the production rollout date.
There is no default cutoff and no automatic grant to future signups.

Backfills create permanent grants, with a recorded cutoff and batch label.
Re-running a batch preserves all existing grants, including revoked and expired
ones. Revocation and temporary grants are administrator operations.

## Rollout

1. Apply `supabase/migrations/20261101000000_access_entitlements.sql` to the
   Supabase project that already contains `profiles` and `subscriptions`.
   This creates the table and resolver but grants no accounts access.
2. Deploy the website changes with `PENDING_ACCOUNT_CLEANUP_PAUSED=1` and
   drain in-flight requests from the previous deployment before any grants are
   applied. This pauses both expired-checkout webhooks and canceled-signup
   cleanup; explicit user-requested account deletion is unaffected. Grant
   reads and the Auth admin delete API are separate operations, so the pause
   closes that race during this one-time backfill. Build/release the iOS app using
   `get_membership_access()`. Existing app versions that query only
   `subscriptions` cannot recognize a grandfathered grant.
3. Choose the actual cutoff and a descriptive audit batch label. Preview using
   an administrative database connection, replacing both placeholders:

   ```sh
   psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 \
     -v cutoff='EXPLICIT_UTC_TIMESTAMP' \
     -v grant_batch='EXPLICIT_AUDIT_BATCH' \
     -f supabase/scripts/preview-grandfathered-access.sql
   ```

4. Review the count, candidate accounts, and existing grant disposition. Apply
   the identical parameters with `apply-grandfathered-access.sql` in place of
   the preview filename. Confirm the selected existing account resolves to
   `has_access: true` from its own authenticated session.
5. Re-enable automated cleanup by setting `PENDING_ACCOUNT_CLEANUP_PAUSED=0`
   and redeploying the website after the backfill has committed. Use the same
   pause-and-drain procedure before any later bulk grant operation.

Signed-in users can read their own grant but cannot create, edit, or delete
grants. The resolver has no user-ID parameter. Stripe cleanup must retain users
with a valid grant; errors checking access must stop destructive cleanup.

## Billing and reversal

An existing paying subscriber may qualify for grandfathered access and still
have a real Stripe subscription. The account page keeps billing management
available. Decide any cancellation or refund policy separately.

To revoke a grant, set `revoked_at = now()` for the exact user UUID using an
administrative connection. Keep the row for audit and to prevent a backfill
rerun from re-granting access. Revoking a grant does not remove independently
valid paid access. A successful app refresh removes cached access when the
server reports no access; offline caches can delay observing a revocation.

Account deletion cascades to the grant. Clearing listening history or library
contents must leave the grant intact.

## Validation

Run `npm test`, `npm run test:membership-db`, and `npx tsc --noEmit` from
`website/`. The database suite runs the migration, policies, resolver and
backfill SQL in an isolated in-memory PostgreSQL engine via PGlite; it does not
connect to Supabase. It tests denied self-grants, account isolation, expiry,
revocation, cutoff boundaries, preview safety, billing preservation and reruns.
`tests/run-membership-db-tests.sh` provides a separate native PostgreSQL runner.

In this session the embedded suite used PostgreSQL 18.6. Native PostgreSQL 14
could not initialize because the session denied shared-memory allocation.
The website tests and TypeScript checks passed. The full website build is
blocked by unchanged `:global(*)` selectors in the two data-licensing CSS
modules; those errors are outside this change.
