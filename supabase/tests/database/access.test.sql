begin;
select plan(18);

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('a0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'coach@marpunten.invalid', '', now(), '{}', '{}', now(), now()),
  ('d0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'daan8@marpunten.invalid', '', now(), '{}', '{}', now(), now()),
  ('e0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'sem11@marpunten.invalid', '', now(), '{}', '{}', now(), now()),
  ('f0000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'inactief@marpunten.invalid', '', now(), '{}', '{}', now(), now());

insert into public.profiles (id, login_name, first_name, last_name, role) values
  ('a0000000-0000-4000-8000-000000000001', 'coach', 'Coach', 'Marpunten', 'admin'),
  ('d0000000-0000-4000-8000-000000000001', 'daan8', 'Daan', 'de Jong', 'player'),
  ('e0000000-0000-4000-8000-000000000001', 'sem11', 'Sem', 'Vos', 'player'),
  ('f0000000-0000-4000-8000-000000000001', 'inactief', 'Inez', 'Bakker', 'player');

insert into public.players (id, profile_id, shirt_number, active) values
  ('10000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 8, true),
  ('10000000-0000-4000-8000-000000000002', 'e0000000-0000-4000-8000-000000000001', 11, true),
  ('10000000-0000-4000-8000-000000000003', 'f0000000-0000-4000-8000-000000000001', 4, false);

insert into public.periods (id, name, sort_order, is_current) values
  ('20000000-0000-4000-8000-000000000001', 'Periode 1', 1, false),
  ('20000000-0000-4000-8000-000000000002', 'Periode 2', 2, true);

insert into public.progress_entries (player_id, period_id, points, title, created_by) values
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 200, 'Open draaien', 'a0000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 100, 'Scannen', 'a0000000-0000-4000-8000-000000000001'),
  ('10000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000002', 150, 'Naar binnen', 'a0000000-0000-4000-8000-000000000001');

insert into public.player_questions (id, player_id, period_id, question, answer, created_by)
values ('50000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', null, 'Waar kijk je?', 'Over beide schouders.', 'a0000000-0000-4000-8000-000000000001');

insert into public.player_media (player_id, period_id, title, url, media_type, created_by)
values ('10000000-0000-4000-8000-000000000001', null, 'Materiaal', 'https://example.com', 'link', 'a0000000-0000-4000-8000-000000000001');

select throws_ok(
  $$insert into public.periods (name, sort_order, is_current) values ('Dubbel huidig', 3, true)$$,
  '23505',
  'er kan maximaal één huidige periode zijn'
);
select results_eq(
  $$select count(*)::bigint from public.player_questions where period_id is null$$,
  array[1::bigint],
  'een leeritem mag periode-onafhankelijk zijn'
);
select results_eq(
  $$select count(*)::bigint from public.player_media where period_id is null$$,
  array[1::bigint],
  'materiaal mag periode-onafhankelijk zijn'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'd0000000-0000-4000-8000-000000000001', true);
select results_eq(
  $$select current_points from public.get_team_growth_summary() where player_id = '10000000-0000-4000-8000-000000000001'$$,
  array[100::bigint],
  'de huidige-periodegroei wordt correct geaggregeerd'
);
select results_eq(
  $$select total_points from public.get_team_growth_summary() where player_id = '10000000-0000-4000-8000-000000000001'$$,
  array[300::bigint],
  'de totale Groeiwaarde wordt correct geaggregeerd'
);
select results_eq($$select count(*)::bigint from public.progress_entries$$, array[2::bigint], 'Daan ziet alleen eigen progressieregels');
select results_eq($$select count(*)::bigint from public.player_questions$$, array[1::bigint], 'Daan ziet alleen eigen leeritems');
select results_eq($$select count(*)::bigint from public.get_team_growth_summary()$$, array[2::bigint], 'Daan ziet uitsluitend actieve spelers in het teamoverzicht');

select set_config('request.jwt.claim.sub', 'e0000000-0000-4000-8000-000000000001', true);
select results_eq($$select count(*)::bigint from public.progress_entries$$, array[1::bigint], 'Sem ziet Daans detailregels niet');
select throws_ok(
  $$select public.convert_learning_item_to_progress('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 175, 'Beide schouders scannen', 'De speler past het leeritem nu zelfstandig toe.')$$,
  '42501',
  'een speler kan een leeritem niet omzetten naar progressie'
);

select set_config('request.jwt.claim.sub', 'f0000000-0000-4000-8000-000000000001', true);
select results_eq($$select count(*)::bigint from public.profiles$$, array[0::bigint], 'een inactieve speler ziet geen profielen');
select results_eq($$select count(*)::bigint from public.players$$, array[0::bigint], 'een inactieve speler ziet geen spelersdata');
select results_eq($$select count(*)::bigint from public.get_team_growth_summary()$$, array[0::bigint], 'een inactieve speler ziet geen teamoverzicht');

select set_config('request.jwt.claim.sub', 'a0000000-0000-4000-8000-000000000001', true);
select results_eq($$select count(*)::bigint from public.progress_entries$$, array[3::bigint], 'de admin ziet alle progressieregels');
select lives_ok(
  $$select public.convert_learning_item_to_progress('50000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000002', 175, 'Beide schouders scannen', 'De speler past het leeritem nu zelfstandig toe.')$$,
  'de admin kan een leeritem omzetten naar progressie'
);
select results_eq(
  $$select count(*)::bigint from public.player_questions where id = '50000000-0000-4000-8000-000000000001'$$,
  array[0::bigint],
  'het omgezette leeritem is verwijderd'
);
select results_eq(
  $$select count(*)::bigint from public.progress_entries where player_id = '10000000-0000-4000-8000-000000000001' and points = 175 and title = 'Beide schouders scannen'$$,
  array[1::bigint],
  'de omzetting maakt de bijbehorende progressie aan'
);

reset role;
set local role anon;
select throws_ok(
  $$select * from public.get_team_growth_summary()$$,
  '42501',
  'een anonieme bezoeker kan de teamfunctie niet uitvoeren'
);

reset role;
select * from finish();
rollback;
