-- Persist signed-in listener identity on analytics session rows.
--
-- This keeps anonymous listening intact for signed-out users while allowing
-- admin analytics to resolve known listeners through public.profiles/auth.users.
--
-- Backfill note:
-- Existing rows only contain device_id. That identifier is device-scoped and
-- cannot be safely mapped back to a specific auth user with high confidence, so
-- this migration does not attempt a historical backfill.

alter table if exists public.listening_sessions
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

alter table if exists public.podcast_listening_sessions
  add column if not exists user_id uuid references public.profiles(id) on delete set null;

create index if not exists listening_sessions_user_id_idx
  on public.listening_sessions (user_id);

create index if not exists podcast_listening_sessions_user_id_idx
  on public.podcast_listening_sessions (user_id);

comment on column public.listening_sessions.user_id is
  'Supabase auth user id for signed-in listeners. Null for anonymous sessions.';

comment on column public.podcast_listening_sessions.user_id is
  'Supabase auth user id for signed-in listeners. Null for anonymous sessions.';
