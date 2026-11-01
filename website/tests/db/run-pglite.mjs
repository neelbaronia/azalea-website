import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';

// In-memory PostgreSQL: no database URL, credentials, network, or live data.
const website = fileURLToPath(new URL('../../', import.meta.url));
const database = await PGlite.create();
const checks = [];
let currentFile = '';

async function sqlFile(file, variables = {}) {
  let sql = await readFile(file, 'utf8');
  const includes = [...sql.matchAll(/^\\ir\s+(.+)$/gm)];
  for (const include of includes) {
    const included = await sqlFile(path.resolve(path.dirname(file), include[1].trim()), variables);
    sql = sql.replace(include[0], () => included);
  }
  sql = sql.replace(/^\\(?:set|echo)\b.*$/gm, '');
  sql = sql.replace(/\\gset\s*$/gm, ';');
  return sql.replace(/:'([a-z_]+)'/g, (_, name) => {
    if (!Object.hasOwn(variables, name)) throw new Error(`Missing required psql variable ${name}`);
    return `'${String(variables[name]).replaceAll("'", "''")}'`;
  });
}

async function run(relative, variables) {
  currentFile = relative;
  return database.exec(await sqlFile(path.join(website, relative), variables));
}

async function expectFailure(relative, variables, label) {
  let failed = false;
  try {
    await run(relative, variables);
  } catch {
    failed = true;
    await database.exec('ROLLBACK;');
  }
  assert.ok(failed, label);
  checks.push(label);
}

async function snapshot(table) {
  const result = await database.query(`SELECT to_jsonb(row_value) AS value FROM public.${table} row_value ORDER BY user_id`);
  return result.rows;
}

try {
  const version = (await database.query('SELECT version() AS version')).rows[0].version;
  await run('tests/db/bootstrap.sql');
  await run('supabase/migrations/001_profiles_subscriptions.sql');
  await run('supabase/migrations/20261101000000_access_entitlements.sql');
  await run('tests/db/membership-access.sql');
  checks.push('RPC eligibility, RLS, denied client writes, expiry/revocation, paid fallback, legacy priority, profile timestamp forgery, service-role administration, auth-user cascade');
  await run('tests/db/grandfathering-fixtures.sql');

  const preview = 'supabase/scripts/preview-grandfathered-access.sql';
  const apply = 'supabase/scripts/apply-grandfathered-access.sql';
  const cutoff = '2026-09-04T05:47:16Z'; // Fixture only, never a production default.
  for (const relative of [preview, apply]) {
    for (const [variables, label] of [
      [{ grant_batch: 'test' }, 'missing cutoff'],
      [{ cutoff }, 'missing batch'],
      [{ cutoff: 'not-a-timestamp', grant_batch: 'test' }, 'malformed cutoff'],
      [{ cutoff: 'infinity', grant_batch: 'test' }, 'infinite cutoff'],
      [{ cutoff: '2999-01-01T00:00:00Z', grant_batch: 'test' }, 'future cutoff'],
      [{ cutoff: '2026-09-04 05:47:16', grant_batch: 'test' }, 'timezone-less cutoff'],
      [{ cutoff, grant_batch: '   ' }, 'blank batch'],
    ]) {
      await expectFailure(relative, variables, `${path.basename(relative)} rejects ${label}`);
    }
  }

  const before = await snapshot('access_entitlements');
  const billingBefore = await snapshot('subscriptions');
  await run(preview, { cutoff, grant_batch: 'test-reviewed-batch' });
  assert.deepEqual(await snapshot('access_entitlements'), before, 'preview must not change grants');
  checks.push('preview is read-only');
  await run(apply, { cutoff, grant_batch: 'test-reviewed-batch' });
  await run('tests/db/grandfathering-check.sql');
  const firstApply = await snapshot('access_entitlements');
  assert.equal(firstApply.length, 3);
  assert.deepEqual(await snapshot('subscriptions'), billingBefore);
  checks.push('backfill strict boundary, audited grant, revoked/expired grants preserved, Stripe rows unchanged');
  await run(apply, { cutoff, grant_batch: 'different-rerun-batch' });
  await run('tests/db/grandfathering-check.sql');
  assert.deepEqual(await snapshot('access_entitlements'), firstApply);
  checks.push('backfill idempotency preserves original grant timestamps and batch');
  console.log(JSON.stringify({ version, checks, passed: true }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ file: currentFile, error: error.message, code: error.code, position: error.position, where: error.where }, null, 2));
  process.exitCode = 1;
} finally {
  await database.close();
}
