-- Independent access grants: billing subscriptions remain Stripe-authoritative.
create table public.access_entitlements (
  user_id uuid primary key references auth.users (id) on delete cascade,
  grant_type text not null check (grant_type = 'grandfathered'),
  cutoff_at timestamptz not null,
  grant_batch text not null check (btrim(grant_batch) <> ''),
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz
);

alter table public.access_entitlements enable row level security;

-- Supabase projects may have permissive default table grants. Remove those
-- explicitly; an authenticated user must never be able to grant themselves access.
revoke all on table public.access_entitlements from public, anon, authenticated;
grant select on table public.access_entitlements to authenticated;
grant all on table public.access_entitlements to service_role;

create policy "Users read own access entitlements"
  on public.access_entitlements
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- No user-id argument: the authenticated caller can resolve only their own access.
create or replace function public.get_membership_access()
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  caller_id uuid := auth.uid();
  access_expires_at timestamptz;
begin
  if caller_id is null then
    return pg_catalog.jsonb_build_object(
      'has_access', false, 'source', null, 'expires_at', null
    );
  end if;

  select entitlement.expires_at into access_expires_at
  from public.access_entitlements as entitlement
  where entitlement.user_id = caller_id
    and entitlement.grant_type = 'grandfathered'
    and entitlement.revoked_at is null
    and (entitlement.expires_at is null or entitlement.expires_at > pg_catalog.now());

  if found then
    return pg_catalog.jsonb_build_object(
      'has_access', true, 'source', 'grandfathered', 'expires_at', access_expires_at
    );
  end if;

  select subscription.current_period_end into access_expires_at
  from public.subscriptions as subscription
  where subscription.user_id = caller_id
    and subscription.status in ('active', 'trialing')
    and (subscription.current_period_end is null or subscription.current_period_end > pg_catalog.now())
  order by subscription.current_period_end desc nulls first, subscription.created_at desc
  limit 1;

  if found then
    return pg_catalog.jsonb_build_object(
      'has_access', true, 'source', 'subscription', 'expires_at', access_expires_at
    );
  end if;

  return pg_catalog.jsonb_build_object(
    'has_access', false, 'source', null, 'expires_at', null
  );
end;
$$;

revoke all on function public.get_membership_access() from public, anon;
grant execute on function public.get_membership_access() to authenticated, service_role;
