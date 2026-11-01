#!/usr/bin/env bash
set -euo pipefail

# Starts a disposable LOCAL PostgreSQL cluster. Never accepts or reads a live DB URL.
website_root="$(cd "$(dirname "$0")/.." && pwd)"
pg_bin="${AZALEA_PG_BIN:-/opt/homebrew/bin}"
for executable in initdb pg_ctl psql; do
  if [[ ! -x "$pg_bin/$executable" ]]; then
    printf 'Missing %s; set AZALEA_PG_BIN to a PostgreSQL binary directory.\n' "$executable" >&2
    exit 1
  fi
done

test_root="$(mktemp -d /tmp/azalea-membership-db.XXXXXX)"
cleanup() {
  "$pg_bin/pg_ctl" -D "$test_root/data" -m fast -w stop > /dev/null 2>&1 || true
  rm -rf "$test_root"
}
trap cleanup EXIT

"$pg_bin/initdb" -D "$test_root/data" --auth=trust --no-locale --encoding=UTF8 > "$test_root/init.log"
# Unix socket only, unique socket directory: no TCP listener or network dependency.
"$pg_bin/pg_ctl" -D "$test_root/data" -l "$test_root/server.log" \
  -o "-h '' -k $test_root -p 55439" -w start > /dev/null
psql_command=("$pg_bin/psql" -X -h "$test_root" -p 55439 -U "$(id -un)" -d postgres -v ON_ERROR_STOP=1)

run_sql() {
  if ! "${psql_command[@]}" "$@" > "$test_root/result.log" 2>&1; then
    cat "$test_root/result.log" >&2
    return 1
  fi
}
expect_failure() {
  if "${psql_command[@]}" "$@" > "$test_root/expected-failure.log" 2>&1; then
    printf 'Expected SQL operation to fail: %s\n' "$*" >&2
    return 1
  fi
}

run_sql -f "$website_root/tests/db/bootstrap.sql"
run_sql -f "$website_root/supabase/migrations/001_profiles_subscriptions.sql"
run_sql -f "$website_root/supabase/migrations/20261101000000_access_entitlements.sql"
run_sql -f "$website_root/tests/db/membership-access.sql"
run_sql -f "$website_root/tests/db/grandfathering-fixtures.sql"

cutoff='2026-09-04T05:47:16Z' # Test fixture boundary only; never a production default.
preview="$website_root/supabase/scripts/preview-grandfathered-access.sql"
apply="$website_root/supabase/scripts/apply-grandfathered-access.sql"

for script in "$preview" "$apply"; do
  expect_failure -v grant_batch=test -f "$script"
  expect_failure -v cutoff="$cutoff" -f "$script"
  expect_failure -v cutoff=not-a-timestamp -v grant_batch=test -f "$script"
  expect_failure -v cutoff=infinity -v grant_batch=test -f "$script"
  expect_failure -v cutoff='2999-01-01T00:00:00Z' -v grant_batch=test -f "$script"
  expect_failure -v cutoff='2026-09-04 05:47:16' -v grant_batch=test -f "$script"
  expect_failure -v cutoff="$cutoff" -v grant_batch='   ' -f "$script"
done

before_preview="$("${psql_command[@]}" -Atc 'select md5(jsonb_agg(to_jsonb(entitlement) order by user_id)::text) from public.access_entitlements entitlement')"
run_sql -v cutoff="$cutoff" -v grant_batch=test-reviewed-batch -f "$preview"
after_preview="$("${psql_command[@]}" -Atc 'select md5(jsonb_agg(to_jsonb(entitlement) order by user_id)::text) from public.access_entitlements entitlement')"
[[ "$before_preview" = "$after_preview" ]] || { printf 'Preview changed entitlements.\n' >&2; exit 1; }

run_sql -v cutoff="$cutoff" -v grant_batch=test-reviewed-batch -f "$apply"
run_sql -f "$website_root/tests/db/grandfathering-check.sql"
after_first_apply="$("${psql_command[@]}" -Atc 'select md5(jsonb_agg(to_jsonb(entitlement) order by user_id)::text) from public.access_entitlements entitlement')"
run_sql -v cutoff="$cutoff" -v grant_batch=different-rerun-batch -f "$apply"
after_second_apply="$("${psql_command[@]}" -Atc 'select md5(jsonb_agg(to_jsonb(entitlement) order by user_id)::text) from public.access_entitlements entitlement')"
[[ "$after_first_apply" = "$after_second_apply" ]] || { printf 'Re-running backfill changed existing entitlements.\n' >&2; exit 1; }
run_sql -f "$website_root/tests/db/grandfathering-check.sql"

printf 'Membership database tests passed (local PostgreSQL, no live connections).\n'
