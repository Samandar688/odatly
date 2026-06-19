create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) > 0),
  description text not null default '',
  icon text not null default '🌱',
  target text not null default '1 daqiqa',
  category text not null default 'Boshqa',
  color text not null default '#3CB878',
  reminder_time text not null default '',
  days_of_week text[] not null default array['Du','Se','Cho','Pa','Ju']::text[],
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint habits_days_not_empty check (array_length(days_of_week, 1) > 0)
);

create table if not exists public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  log_date date not null,
  status text not null check (status in ('done', 'missed')),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  note text not null default '',
  mood text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, log_date)
);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references public.habits(id) on delete cascade,
  reminder_time text not null,
  is_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists habits_user_id_idx on public.habits(user_id);
create index if not exists habit_logs_user_id_idx on public.habit_logs(user_id);
create index if not exists habit_logs_habit_date_idx on public.habit_logs(habit_id, log_date desc);
create index if not exists reminders_user_id_idx on public.reminders(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists habits_set_updated_at on public.habits;
create trigger habits_set_updated_at
before update on public.habits
for each row execute function public.set_updated_at();

drop trigger if exists habit_logs_set_updated_at on public.habit_logs;
create trigger habit_logs_set_updated_at
before update on public.habit_logs
for each row execute function public.set_updated_at();

drop trigger if exists reminders_set_updated_at on public.reminders;
create trigger reminders_set_updated_at
before update on public.reminders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;
alter table public.reminders enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
with check (auth.uid() = id);

drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own"
on public.habits for select
using (auth.uid() = user_id);

drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own"
on public.habits for insert
with check (auth.uid() = user_id);

drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own"
on public.habits for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "habit_logs_select_own" on public.habit_logs;
create policy "habit_logs_select_own"
on public.habit_logs for select
using (auth.uid() = user_id);

drop policy if exists "habit_logs_insert_own" on public.habit_logs;
create policy "habit_logs_insert_own"
on public.habit_logs for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits
    where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
  )
);

drop policy if exists "habit_logs_update_own" on public.habit_logs;
create policy "habit_logs_update_own"
on public.habit_logs for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits
    where habits.id = habit_logs.habit_id
      and habits.user_id = auth.uid()
  )
);

drop policy if exists "reminders_select_own" on public.reminders;
create policy "reminders_select_own"
on public.reminders for select
using (auth.uid() = user_id);

drop policy if exists "reminders_insert_own" on public.reminders;
create policy "reminders_insert_own"
on public.reminders for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits
    where habits.id = reminders.habit_id
      and habits.user_id = auth.uid()
  )
);

drop policy if exists "reminders_update_own" on public.reminders;
create policy "reminders_update_own"
on public.reminders for update
using (auth.uid() = user_id)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.habits
    where habits.id = reminders.habit_id
      and habits.user_id = auth.uid()
  )
);
