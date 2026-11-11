-- Drawing Music: opt-in authenticated rooms for ORIGINAL DEMO playback only.
-- This migration is intentionally not applied to any shared Supabase project by this commit.
-- Public room metadata (excluding email/profile) is visible to authenticated users.
create table if not exists public.dm_listening_rooms (
 id uuid primary key default gen_random_uuid(),
 host_id uuid not null references auth.users(id) on delete cascade,
 title text not null check (char_length(title) between 1 and 50),
 track_id text not null default 'afterglow'
  check (track_id in ('afterglow','nightdrive','paperplanets','tidal','martianrain','signal')),
 position_seconds numeric not null default 0 check(position_seconds>=0 and position_seconds<=14400),
 playing boolean not null default false,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists dm_rooms_active_idx on public.dm_listening_rooms(active,created_at desc);
alter table public.dm_listening_rooms enable row level security;
revoke all on public.dm_listening_rooms from anon;
grant select,insert,update on public.dm_listening_rooms to authenticated;
create policy "dm_rooms_read_signed_in" on public.dm_listening_rooms
 for select to authenticated using ((select auth.uid()) is not null);
create policy "dm_rooms_host_create" on public.dm_listening_rooms
 for insert to authenticated with check (host_id=(select auth.uid()));
create policy "dm_rooms_host_update" on public.dm_listening_rooms
 for update to authenticated using (host_id=(select auth.uid()))
 with check (host_id=(select auth.uid()));

create table if not exists public.dm_room_members (
 room_id uuid not null references public.dm_listening_rooms(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 consent_at timestamptz not null,
 joined_at timestamptz not null default now(),
 primary key(room_id,user_id)
);
create index if not exists dm_members_user_idx on public.dm_room_members(user_id);
alter table public.dm_room_members enable row level security;
revoke all on public.dm_room_members from anon;
grant select,insert,delete on public.dm_room_members to authenticated;
create policy "dm_member_read_self_or_host" on public.dm_room_members
 for select to authenticated using (
  user_id=(select auth.uid()) or exists (
   select 1 from public.dm_listening_rooms room
   where room.id=room_id and room.host_id=(select auth.uid())
  )
 );
create policy "dm_member_join_with_consent" on public.dm_room_members
 for insert to authenticated with check (
  user_id=(select auth.uid()) and consent_at is not null and exists (
   select 1 from public.dm_listening_rooms room where room.id=room_id and room.active
  )
 );
create policy "dm_member_leave_or_host_remove" on public.dm_room_members
 for delete to authenticated using (
  user_id=(select auth.uid()) or exists (
   select 1 from public.dm_listening_rooms room
   where room.id=room_id and room.host_id=(select auth.uid())
  )
 );
