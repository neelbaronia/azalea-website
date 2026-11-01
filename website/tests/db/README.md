Run `npm run test:membership-db` from `website` for the in-memory PGlite integration tests. They execute the production migration, RPC, preview/apply SQL, and role/security assertions using synthetic users, without a live database connection.

Validated with **PostgreSQL 18.6 in PGlite 0.5.14**. The harness expands psql includes and quoted variables; it does not execute the psql client itself.

For native PostgreSQL, run `bash tests/run-membership-db-tests.sh` (or set `AZALEA_PG_BIN` to its binary directory). This starts and removes a disposable local cluster and exercises the actual psql scripts. Native PostgreSQL 14 could not start in the managed environment because `shmget` was denied, so it has not been reported as passing.
