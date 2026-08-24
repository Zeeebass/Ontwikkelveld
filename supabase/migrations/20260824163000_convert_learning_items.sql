create or replace function public.convert_learning_item_to_progress(
  learning_item_id uuid,
  target_period_id uuid,
  progress_points integer,
  progress_title text,
  progress_description text default null
)
returns public.progress_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  learning_item public.player_questions;
  created_progress public.progress_entries;
  cleaned_title text := trim(progress_title);
  cleaned_description text := nullif(trim(progress_description), '');
begin
  if not private.is_admin() then
    raise exception 'Alleen een admin kan een leeritem omzetten naar progressie' using errcode = '42501';
  end if;

  if progress_points is null or progress_points <= 0 then
    raise exception 'Gebruik een positief aantal punten' using errcode = '22023';
  end if;
  if cleaned_title is null or cleaned_title = '' or char_length(cleaned_title) > 120 then
    raise exception 'Vul een geldige progressietitel in' using errcode = '22023';
  end if;
  if cleaned_description is not null and char_length(cleaned_description) > 2000 then
    raise exception 'De progressieomschrijving is te lang' using errcode = '22023';
  end if;
  if not exists (select 1 from public.periods where id = target_period_id) then
    raise exception 'Periode niet gevonden' using errcode = 'P0002';
  end if;

  select * into learning_item
  from public.player_questions
  where id = learning_item_id
  for update;

  if not found then
    raise exception 'Leeritem niet gevonden' using errcode = 'P0002';
  end if;

  insert into public.progress_entries (
    player_id,
    period_id,
    points,
    title,
    description,
    created_by
  ) values (
    learning_item.player_id,
    target_period_id,
    progress_points,
    cleaned_title,
    cleaned_description,
    auth.uid()
  )
  returning * into created_progress;

  delete from public.player_questions where id = learning_item_id;
  return created_progress;
end;
$$;

revoke execute on function public.convert_learning_item_to_progress(uuid, uuid, integer, text, text) from public, anon;
grant execute on function public.convert_learning_item_to_progress(uuid, uuid, integer, text, text) to authenticated;
