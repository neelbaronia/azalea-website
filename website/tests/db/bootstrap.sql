\set ON_ERROR_STOP on
-- Isolated PostgreSQL fixture for the small Supabase Auth surface these migrations use.
create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;
create schema auth;
create table auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  created_at timestamptz not null default now(),
  raw_user_meta_data jsonb not null default '{}'::jsonb
);
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;
grant usage on schema public, auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;

-- Simulate Supabase's broad defaults to prove the new migration removes client writes.
alter default privileges in schema public
  grant select, insert, update, delete on tables to anon, authenticated, service_role;
