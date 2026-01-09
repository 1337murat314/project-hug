-- Open up RLS to allow client-side reads/writes as requested
-- VISITORS: drop restrictive policies and create permissive ones
alter table public.visitors enable row level security;

drop policy if exists "Deny all SELECT on visitors" on public.visitors;
drop policy if exists "Deny all INSERT on visitors" on public.visitors;

create policy "Public can select visitors"
  on public.visitors
  for select
  using (true);

create policy "Public can insert visitors"
  on public.visitors
  for insert
  with check (true);

create policy "Public can update visitors"
  on public.visitors
  for update
  using (true)
  with check (true);

create policy "Public can delete visitors"
  on public.visitors
  for delete
  using (true);

-- USER_SESSIONS: drop restrictive policies and create permissive ones
alter table public.user_sessions enable row level security;

drop policy if exists "Users can only read via session manager edge function" on public.user_sessions;
drop policy if exists "Block direct client inserts" on public.user_sessions;
drop policy if exists "Block direct client updates" on public.user_sessions;
drop policy if exists "Deny all DELETE on user_sessions" on public.user_sessions;

create policy "Public can select user_sessions"
  on public.user_sessions
  for select
  using (true);

create policy "Public can insert user_sessions"
  on public.user_sessions
  for insert
  with check (true);

create policy "Public can update user_sessions"
  on public.user_sessions
  for update
  using (true)
  with check (true);

create policy "Public can delete user_sessions"
  on public.user_sessions
  for delete
  using (true);
