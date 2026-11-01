-- Administrative READ-ONLY preview. Supply both values explicitly:
-- psql -X -v cutoff='ISO-8601 TIMESTAMP' -v grant_batch='AUDIT BATCH' -f this-file.sql
-- Use the same cutoff and batch for the separately authorized apply operation.
\set ON_ERROR_STOP on
begin read only;

\ir validate-grandfathering-parameters.sql

-- Echo the explicit proposal after validating it, before any candidate query.
select :'cutoff'::timestamptz as proposed_cutoff, :'grant_batch'::text as proposed_grant_batch;

select
  count(*) filter (where entitlement.user_id is null) as would_grant,
  count(*) filter (where entitlement.user_id is not null) as would_preserve_existing,
  count(*) filter (where entitlement.revoked_at is not null) as existing_revoked_preserved
from auth.users as account
left join public.access_entitlements as entitlement on entitlement.user_id = account.id
where account.created_at < :'cutoff'::timestamptz;

select
  account.id as user_id,
  account.email,
  account.created_at as account_created_at,
  case
    when entitlement.user_id is null then 'would_grant'
    when entitlement.revoked_at is not null then 'preserve_revoked'
    when entitlement.expires_at <= now() then 'preserve_expired'
    else 'preserve_existing'
  end as disposition,
  entitlement.grant_batch as existing_grant_batch,
  entitlement.cutoff_at as existing_cutoff,
  entitlement.expires_at as existing_expiry,
  entitlement.revoked_at as existing_revocation
from auth.users as account
left join public.access_entitlements as entitlement on entitlement.user_id = account.id
where account.created_at < :'cutoff'::timestamptz
order by account.created_at, account.id;

commit;
