begin;
select plan(15);

select has_table('public', 'profiles', 'profiles bestaat');
select has_table('public', 'players', 'players bestaat');
select has_table('public', 'periods', 'periods bestaat');
select has_table('public', 'progress_entries', 'progress_entries bestaat');
select has_table('public', 'player_questions', 'player_questions bestaat');
select has_table('public', 'player_media', 'player_media bestaat');

select ok((select relrowsecurity from pg_class where oid = 'public.profiles'::regclass), 'profiles heeft RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.progress_entries'::regclass), 'progress heeft RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.player_questions'::regclass), 'leeritems hebben RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.player_media'::regclass), 'media heeft RLS');

select has_function('public', 'get_my_context', array[]::text[], 'context-RPC bestaat');
select has_function('public', 'get_team_growth_summary', array[]::text[], 'team-RPC bestaat');
select has_function('public', 'create_period_and_make_current', array['text'], 'periode-RPC bestaat');
select has_function('public', 'convert_learning_item_to_progress', array['uuid', 'uuid', 'integer', 'text', 'text'], 'leeritemconversie-RPC bestaat');
select results_eq(
  $$select count(*)::bigint from pg_policies where schemaname = 'public'$$,
  array[19::bigint],
  'alle verwachte public RLS-policies bestaan'
);

select * from finish();
rollback;
