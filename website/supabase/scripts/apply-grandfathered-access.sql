-- Administrative write operation; run only after reviewing the matching preview.
-- No cutoff is supplied by this script. Nothing modifies Stripe subscriptions.
-- psql -X -v cutoff='ISO-8601 TIMESTAMP' -v grant_batch='AUDIT BATCH' -f this-file.sql
\set ON_ERROR_STOP on
begin;

\ir validate-grandfathering-parameters.sql

create temporary table grandfathering_parameters (
  cutoff_at timestamptz not null,
  grant_batch text not null check (btrim(grant_batch) <> '')
) on commit drop;

-- Missing variables, invalid timestamps, and an empty audit batch fail before grants.
insert into grandfathering_parameters (cutoff_at, grant_batch)
values (:'cutoff'::timestamptz, :'grant_batch');

insert into public.access_entitlements (user_id, grant_type, cutoff_at, grant_batch)
select account.id, 'grandfathered', parameters.cutoff_at, parameters.grant_batch
from auth.users as account
cross join grandfathering_parameters as parameters
where account.created_at < parameters.cutoff_at
-- Re-running a batch never renews an expired grant, revokes a grant, or restores
-- one that an administrator revoked. Every existing grant is left unchanged.
on conflict (user_id) do nothing
returning user_id, grant_type, cutoff_at, grant_batch, granted_at, expires_at, revoked_at;

commit;
