create extension if not exists citext with schema extensions;

create type public.app_role as enum ('admin', 'player');
create type public.media_type as enum ('youtube', 'link');

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  login_name extensions.citext not null unique,
  first_name text not null check (char_length(trim(first_name)) between 1 and 80),
  last_name text not null check (char_length(trim(last_name)) between 1 and 120),
  role public.app_role not null default 'player',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.players (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles(id) on delete cascade,
  position text check (position is null or char_length(trim(position)) between 1 and 40),
  shirt_number smallint check (shirt_number is null or shirt_number between 1 and 99),
  avatar_path text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.periods (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  sort_order integer not null check (sort_order > 0),
  is_current boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index periods_single_current_idx on public.periods (is_current) where is_current;
create unique index periods_sort_order_idx on public.periods (sort_order);

create table public.progress_entries (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  period_id uuid not null references public.periods(id) on delete restrict,
  points integer not null check (points > 0),
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.player_questions (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  period_id uuid references public.periods(id) on delete restrict,
  question text not null check (char_length(trim(question)) between 1 and 500),
  answer text not null check (char_length(trim(answer)) between 1 and 4000),
  category text check (category is null or char_length(trim(category)) between 1 and 60),
  sort_order integer not null default 1 check (sort_order > 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.player_media (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references public.players(id) on delete restrict,
  period_id uuid references public.periods(id) on delete restrict,
  title text not null check (char_length(trim(title)) between 1 and 120),
  description text check (description is null or char_length(description) <= 2000),
  url text not null check (char_length(trim(url)) between 8 and 2048),
  media_type public.media_type not null,
  sort_order integer not null default 1 check (sort_order > 0),
  created_by uuid not null references public.profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index players_active_order_idx on public.players (active, shirt_number);
create index progress_player_period_idx on public.progress_entries (player_id, period_id);
create index progress_period_idx on public.progress_entries (period_id);
create index progress_created_at_idx on public.progress_entries (created_at desc);
create index questions_player_period_sort_idx on public.player_questions (player_id, period_id, sort_order);
create index questions_period_idx on public.player_questions (period_id);
create index media_player_period_sort_idx on public.player_media (player_id, period_id, sort_order);
create index media_period_idx on public.player_media (period_id);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger players_set_updated_at before update on public.players
for each row execute function private.set_updated_at();
create trigger periods_set_updated_at before update on public.periods
for each row execute function private.set_updated_at();
create trigger progress_set_updated_at before update on public.progress_entries
for each row execute function private.set_updated_at();
create trigger questions_set_updated_at before update on public.player_questions
for each row execute function private.set_updated_at();
create trigger media_set_updated_at before update on public.player_media
for each row execute function private.set_updated_at();

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

create or replace function private.current_player_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.players where profile_id = (select auth.uid()) limit 1;
$$;

create or replace function private.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin() or exists (
    select 1 from public.players
    where profile_id = (select auth.uid()) and active
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.current_player_id() from public;
revoke all on function private.is_active_member() from public;
grant execute on function private.is_admin() to authenticated;
grant execute on function private.current_player_id() to authenticated;
grant execute on function private.is_active_member() to authenticated;

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.periods enable row level security;
alter table public.progress_entries enable row level security;
alter table public.player_questions enable row level security;
alter table public.player_media enable row level security;

create policy profiles_select_self_or_admin on public.profiles
for select to authenticated using (
  (id = (select auth.uid()) and (select private.is_active_member()))
  or (select private.is_admin())
);
create policy profiles_update_admin on public.profiles
for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy players_select_team_or_self on public.players
for select to authenticated using (
  (active and (select private.is_active_member()))
  or (select private.is_admin())
);
create policy players_update_admin on public.players
for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy periods_select_members on public.periods
for select to authenticated using ((select private.is_active_member()));
create policy periods_update_admin on public.periods
for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy periods_delete_admin on public.periods
for delete to authenticated using ((select private.is_admin()));

create policy progress_select_owner_or_admin on public.progress_entries
for select to authenticated using (
  (player_id = (select private.current_player_id()) and (select private.is_active_member()))
  or (select private.is_admin())
);
create policy progress_insert_admin on public.progress_entries
for insert to authenticated with check ((select private.is_admin()));
create policy progress_update_admin on public.progress_entries
for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy progress_delete_admin on public.progress_entries
for delete to authenticated using ((select private.is_admin()));

create policy questions_select_owner_or_admin on public.player_questions
for select to authenticated using (
  (player_id = (select private.current_player_id()) and (select private.is_active_member()))
  or (select private.is_admin())
);
create policy questions_insert_admin on public.player_questions
for insert to authenticated with check ((select private.is_admin()));
create policy questions_update_admin on public.player_questions
for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy questions_delete_admin on public.player_questions
for delete to authenticated using ((select private.is_admin()));

create policy media_select_owner_or_admin on public.player_media
for select to authenticated using (
  (player_id = (select private.current_player_id()) and (select private.is_active_member()))
  or (select private.is_admin())
);
create policy media_insert_admin on public.player_media
for insert to authenticated with check ((select private.is_admin()));
create policy media_update_admin on public.player_media
for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy media_delete_admin on public.player_media
for delete to authenticated using ((select private.is_admin()));

revoke all on public.profiles, public.players, public.periods, public.progress_entries, public.player_questions, public.player_media from anon;
grant select, update on public.profiles, public.players to authenticated;
grant select, update, delete on public.periods to authenticated;
grant select, insert, update, delete on public.progress_entries, public.player_questions, public.player_media to authenticated;

create or replace function public.get_my_context()
returns table (
  role public.app_role,
  player_id uuid,
  full_name text,
  active boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.role,
    pl.id,
    concat_ws(' ', p.first_name, p.last_name),
    case when p.role = 'admin' then true else coalesce(pl.active, false) end
  from public.profiles p
  left join public.players pl on pl.profile_id = p.id
  where p.id = (select auth.uid());
$$;

create or replace function public.get_team_growth_summary()
returns table (
  current_period_id uuid,
  current_period_name text,
  player_id uuid,
  first_name text,
  last_name text,
  position text,
  shirt_number smallint,
  avatar_path text,
  current_points bigint,
  total_points bigint
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    current_period.id,
    current_period.name,
    pl.id,
    pr.first_name,
    pr.last_name,
    pl.position,
    pl.shirt_number,
    pl.avatar_path,
    coalesce(sum(pe.points) filter (where pe.period_id = current_period.id), 0)::bigint,
    coalesce(sum(pe.points), 0)::bigint
  from public.players pl
  join public.profiles pr on pr.id = pl.profile_id
  left join public.periods current_period on current_period.is_current
  left join public.progress_entries pe on pe.player_id = pl.id
  where pl.active and private.is_active_member()
  group by current_period.id, current_period.name, pl.id, pr.first_name, pr.last_name
  order by pl.shirt_number nulls last, lower(pr.last_name), lower(pr.first_name);
$$;

create or replace function public.create_period_and_make_current(period_name text)
returns public.periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_period public.periods;
  cleaned_name text := trim(period_name);
begin
  if not private.is_admin() then
    raise exception 'Alleen een admin kan perioden aanmaken' using errcode = '42501';
  end if;
  if cleaned_name = '' or char_length(cleaned_name) > 80 then
    raise exception 'Vul een geldige periodenaam in' using errcode = '22023';
  end if;

  update public.periods set is_current = false where is_current;
  insert into public.periods (name, sort_order, is_current)
  values (cleaned_name, coalesce((select max(sort_order) from public.periods), 0) + 1, true)
  returning * into created_period;
  return created_period;
end;
$$;

create or replace function public.set_current_period(target_period_id uuid)
returns public.periods
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_period public.periods;
begin
  if not private.is_admin() then
    raise exception 'Alleen een admin kan de huidige periode wijzigen' using errcode = '42501';
  end if;
  if not exists (select 1 from public.periods where id = target_period_id) then
    raise exception 'Periode niet gevonden' using errcode = 'P0002';
  end if;

  update public.periods set is_current = false where is_current;
  update public.periods set is_current = true where id = target_period_id returning * into selected_period;
  return selected_period;
end;
$$;

create or replace function private.prevent_invalid_period_delete()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.is_current then
    raise exception 'De huidige periode kan niet worden verwijderd';
  end if;
  return old;
end;
$$;

create trigger periods_prevent_current_delete before delete on public.periods
for each row execute function private.prevent_invalid_period_delete();

revoke execute on function public.get_my_context() from public, anon;
revoke execute on function public.get_team_growth_summary() from public, anon;
revoke execute on function public.create_period_and_make_current(text) from public, anon;
revoke execute on function public.set_current_period(uuid) from public, anon;
grant execute on function public.get_my_context() to authenticated;
grant execute on function public.get_team_growth_summary() to authenticated;
grant execute on function public.create_period_and_make_current(text) to authenticated;
grant execute on function public.set_current_period(uuid) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('player-avatars', 'player-avatars', false, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy avatars_read_members on storage.objects
for select to authenticated using (
  bucket_id = 'player-avatars' and (select private.is_active_member())
);
create policy avatars_insert_admin on storage.objects
for insert to authenticated with check (
  bucket_id = 'player-avatars' and (select private.is_admin())
);
create policy avatars_update_admin on storage.objects
for update to authenticated using (
  bucket_id = 'player-avatars' and (select private.is_admin())
) with check (
  bucket_id = 'player-avatars' and (select private.is_admin())
);
create policy avatars_delete_admin on storage.objects
for delete to authenticated using (
  bucket_id = 'player-avatars' and (select private.is_admin())
);
