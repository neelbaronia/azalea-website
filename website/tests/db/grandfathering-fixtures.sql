\set ON_ERROR_STOP on
insert into auth.users (id, email, created_at) values
  ('10000000-0000-0000-0000-000000000001', 'revoked@example.test', '2026-09-04T05:47:15Z'),
  ('10000000-0000-0000-0000-000000000002', 'eligible@example.test', '2026-09-04T05:47:15.999999Z'),
  ('10000000-0000-0000-0000-000000000003', 'boundary@example.test', '2026-09-04T05:47:16Z'),
  ('10000000-0000-0000-0000-000000000004', 'newer@example.test', '2026-09-04T05:47:17Z'),
  ('10000000-0000-0000-0000-000000000005', 'expired@example.test', '2026-09-04T05:47:14Z');

insert into public.access_entitlements
  (user_id, grant_type, cutoff_at, grant_batch, granted_at, expires_at, revoked_at)
values
  ('10000000-0000-0000-0000-000000000001', 'grandfathered', '2026-09-04T05:47:16Z',
   'original-revoked-batch', '2026-09-05T00:00:00Z', null, '2026-09-06T00:00:00Z'),
  ('10000000-0000-0000-0000-000000000005', 'grandfathered', '2026-09-04T05:47:16Z',
   'original-expired-batch', '2026-09-05T00:00:00Z', '2026-09-06T00:00:00Z', null);

insert into public.subscriptions (user_id, stripe_subscription_id, status, current_period_end)
values ('10000000-0000-0000-0000-000000000002', 'fixture-preserve-stripe', 'past_due', '2026-09-01T00:00:00Z');

-- Snapshot full rows so tests detect even an unrelated billing/grant field change.
create table public.grandfathering_original_grants as select * from public.access_entitlements;
create table public.grandfathering_original_subscriptions as select * from public.subscriptions;
