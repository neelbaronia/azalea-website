\set ON_ERROR_STOP on
begin;

create function public.membership_test_assert(condition boolean, message text)
returns void language plpgsql as $$
begin
  if condition is distinct from true then raise exception 'Assertion failed: %', message; end if;
end;
$$;

insert into auth.users (id, email)
select ('00000000-0000-0000-0000-' || lpad(number::text, 12, '0'))::uuid,
       'membership-fixture-' || number || '@example.test'
from generate_series(1, 12) as number;

insert into public.access_entitlements
  (user_id, grant_type, cutoff_at, grant_batch, expires_at, revoked_at)
values
  ('00000000-0000-0000-0000-000000000001', 'grandfathered', '2026-01-01T00:00:00Z', 'fixture', null, null),
  ('00000000-0000-0000-0000-000000000002', 'grandfathered', '2026-01-01T00:00:00Z', 'fixture', now() - interval '1 second', null),
  ('00000000-0000-0000-0000-000000000003', 'grandfathered', '2026-01-01T00:00:00Z', 'fixture', null, now()),
  ('00000000-0000-0000-0000-000000000008', 'grandfathered', '2026-01-01T00:00:00Z', 'fixture', now(), null),
  ('00000000-0000-0000-0000-000000000010', 'grandfathered', '2026-01-01T00:00:00Z', 'fixture', now() + interval '2 days', null),
  ('00000000-0000-0000-0000-000000000011', 'grandfathered', '2026-01-01T00:00:00Z', 'fixture', null, now());

insert into public.subscriptions (user_id, stripe_subscription_id, status, current_period_end, created_at)
values
  ('00000000-0000-0000-0000-000000000002', 'fixture-expired-grant-paid', 'active', now() + interval '1 day', now()),
  ('00000000-0000-0000-0000-000000000003', 'fixture-revoked-grant-paid', 'active', null, now()),
  ('00000000-0000-0000-0000-000000000004', 'fixture-older-active', 'active', now() + interval '1 day', now() - interval '1 day'),
  ('00000000-0000-0000-0000-000000000004', 'fixture-newer-canceled', 'canceled', now() + interval '1 day', now()),
  ('00000000-0000-0000-0000-000000000005', 'fixture-trial', 'trialing', null, now()),
  ('00000000-0000-0000-0000-000000000006', 'fixture-past-due', 'past_due', now() + interval '1 day', now()),
  ('00000000-0000-0000-0000-000000000007', 'fixture-expired-paid', 'active', now() - interval '1 second', now()),
  ('00000000-0000-0000-0000-000000000008', 'fixture-boundary-paid', 'active', now(), now()),
  ('00000000-0000-0000-0000-000000000009', 'fixture-active-null-expiry', 'active', null, now()),
  ('00000000-0000-0000-0000-000000000010', 'fixture-grant-wins', 'active', now() + interval '1 day', now());

select public.membership_test_assert(
  not (select prosecdef from pg_proc where oid = 'public.get_membership_access()'::regprocedure),
  'access RPC remains SECURITY INVOKER'
);
select public.membership_test_assert(
  to_regprocedure('public.get_membership_access(uuid)') is null,
  'no arbitrary-user-id RPC exists'
);
select public.membership_test_assert(
  not has_function_privilege('anon', 'public.get_membership_access()', 'EXECUTE'),
  'anonymous RPC execution denied'
);
select public.membership_test_assert(
  has_function_privilege('service_role', 'public.get_membership_access()', 'EXECUTE'),
  'service-role RPC execution permitted'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);
select public.membership_test_assert(
  public.get_membership_access() = '{"has_access":true,"source":"grandfathered","expires_at":null}'::jsonb,
  'permanent legacy grant without Stripe subscription grants access'
);
select public.membership_test_assert(
  (select count(*) from public.access_entitlements) = 1,
  'authenticated table reads expose only own entitlement'
);

do $$
begin
  begin
    insert into public.access_entitlements (user_id, grant_type, cutoff_at, grant_batch)
    values ('00000000-0000-0000-0000-000000000012', 'grandfathered', now(), 'forged');
    raise exception 'Authenticated INSERT unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    update public.access_entitlements set revoked_at = null;
    raise exception 'Authenticated UPDATE unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.access_entitlements;
    raise exception 'Authenticated DELETE unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end;
$$;

do $$
declare
  fixture record;
  result jsonb;
begin
  for fixture in select * from (values
    (2, true, 'subscription'), (3, true, 'subscription'),
    (4, true, 'subscription'), (5, true, 'subscription'),
    (6, false, null), (7, false, null), (8, false, null),
    (9, true, 'subscription'), (10, true, 'grandfathered'),
    (11, false, null), (12, false, null)
  ) as expected(number, has_access, source)
  loop
    perform set_config('request.jwt.claim.sub',
      '00000000-0000-0000-0000-' || lpad(fixture.number::text, 12, '0'), true);
    result := public.get_membership_access();
    perform public.membership_test_assert((result ->> 'has_access')::boolean = fixture.has_access,
      'access eligibility for fixture ' || fixture.number);
    perform public.membership_test_assert((result ->> 'source') is not distinct from fixture.source,
      'access source for fixture ' || fixture.number);
    if not fixture.has_access then
      perform public.membership_test_assert(result -> 'expires_at' = 'null'::jsonb,
        'denied access has no misleading expiry');
    end if;
  end loop;
end;
$$;

-- profiles.created_at is client-editable in the existing schema; it must never
-- act as a self-service legacy entitlement.
update public.profiles set created_at = '1900-01-01T00:00:00Z'
where id = '00000000-0000-0000-0000-000000000012';
select public.membership_test_assert(
  not (public.get_membership_access() ->> 'has_access')::boolean,
  'editing a profile timestamp cannot grant legacy access'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000010', true);
select public.membership_test_assert(
  (public.get_membership_access() ->> 'expires_at')::timestamptz = now() + interval '2 days',
  'finite legacy grant returns its expiry and takes precedence over paid access'
);

select set_config('request.jwt.claim.sub', '', true);
select public.membership_test_assert(
  public.get_membership_access() = '{"has_access":false,"source":null,"expires_at":null}'::jsonb,
  'missing authenticated user never receives another user grant'
);

set local role anon;
do $$
begin
  begin
    perform public.get_membership_access();
    raise exception 'Anonymous RPC unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
  begin
    perform 1 from public.access_entitlements;
    raise exception 'Anonymous table read unexpectedly succeeded';
  exception when insufficient_privilege then null; end;
end;
$$;

reset role;
set local role service_role;
insert into public.access_entitlements (user_id, grant_type, cutoff_at, grant_batch)
values ('00000000-0000-0000-0000-000000000012', 'grandfathered', now(), 'service-role-grant');
select public.membership_test_assert(
  (select count(*) from public.access_entitlements where user_id = '00000000-0000-0000-0000-000000000012') = 1,
  'service role can administer entitlements'
);
select public.membership_test_assert(
  not (public.get_membership_access() ->> 'has_access')::boolean,
  'service role without a user JWT has no implicit membership'
);
reset role;
delete from auth.users where id = '00000000-0000-0000-0000-000000000001';
select public.membership_test_assert(
  not exists (select 1 from public.access_entitlements where user_id = '00000000-0000-0000-0000-000000000001'),
  'account deletion cascades to its entitlement'
);

rollback;
\echo Membership access, RLS, and cascade assertions passed.
