-- Per-user practice history. Each row belongs to the signed-in user who created it.
create table public.practice_records (
  id uuid primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  provider text not null check (char_length(provider) <= 40),
  performance text check (char_length(performance) <= 40),
  difficulty text not null check (difficulty in ('easy', 'normal', 'hard')),
  success boolean not null,
  seats text not null check (char_length(seats) <= 200),
  elapsed_ms double precision not null check (elapsed_ms >= 0),
  seat_time_ms double precision check (seat_time_ms >= 0),
  first_click_ms double precision check (first_click_ms >= 0),
  failures integer not null default 0 check (failures >= 0),
  amount integer not null default 0 check (amount >= 0),
  practiced_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index practice_records_user_practiced_idx on public.practice_records (user_id, practiced_at desc);

alter table public.practice_records enable row level security;
create policy "Users read own records" on public.practice_records for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add own records" on public.practice_records for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users delete own records" on public.practice_records for delete to authenticated using ((select auth.uid()) = user_id);

revoke all on public.practice_records from anon;
grant select, insert, delete on public.practice_records to authenticated;
