\set ON_ERROR_STOP on
do $$
begin
  if (select count(*) from public.access_entitlements) <> 3 then
    raise exception 'Backfill should insert exactly one eligible new grant';
  end if;
  if not exists (
    select 1 from public.access_entitlements
    where user_id = '10000000-0000-0000-0000-000000000002'
      and grant_type = 'grandfathered'
      and cutoff_at = '2026-09-04T05:47:16Z'::timestamptz
      and grant_batch = 'test-reviewed-batch'
      and expires_at is null and revoked_at is null
  ) then
    raise exception 'Eligible grant lacks the reviewed cutoff and audit batch';
  end if;
  if exists (
    select 1 from public.access_entitlements
    where user_id in ('10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004')
  ) then
    raise exception 'Cutoff boundary or newer signup incorrectly grandfathered';
  end if;
  if exists (
    select * from public.grandfathering_original_grants
    except select * from public.access_entitlements
  ) then
    raise exception 'Existing revoked/expired grants must remain byte-for-byte unchanged';
  end if;
  if exists (
    (select * from public.grandfathering_original_subscriptions except select * from public.subscriptions)
    union all
    (select * from public.subscriptions except select * from public.grandfathering_original_subscriptions)
  ) then
    raise exception 'Backfill must never change Stripe subscription records';
  end if;
end;
$$;
\echo Grandfathering boundary, audit, preservation, and billing assertions passed.
