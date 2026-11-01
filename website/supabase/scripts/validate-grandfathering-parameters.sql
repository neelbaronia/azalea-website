-- Included within the preview/apply transaction. These settings are local to
-- this transaction and let validation read psql's safely quoted input values.
select pg_catalog.set_config('azalea.grandfathering_cutoff', :'cutoff', true) as validated_cutoff_input \gset
select pg_catalog.set_config('azalea.grandfathering_batch', :'grant_batch', true) as validated_batch_input \gset

do $$
declare
  cutoff_input text := pg_catalog.current_setting('azalea.grandfathering_cutoff');
  cutoff_value timestamptz;
begin
  if cutoff_input !~ '[Tt ][0-9]{2}:[0-9]{2}(:[0-9]{2}([.][0-9]+)?)?([Zz]|[+-][0-9]{2}:[0-9]{2})$' then
    raise exception 'cutoff must be an explicit timestamp with Z or a numeric timezone offset';
  end if;

  cutoff_value := cutoff_input::timestamptz;
  if not pg_catalog.isfinite(cutoff_value) or cutoff_value > pg_catalog.now() then
    raise exception 'cutoff must be finite and cannot be in the future';
  end if;

  if pg_catalog.btrim(pg_catalog.current_setting('azalea.grandfathering_batch')) = '' then
    raise exception 'grant_batch must be a nonempty audit identifier';
  end if;
end;
$$;
