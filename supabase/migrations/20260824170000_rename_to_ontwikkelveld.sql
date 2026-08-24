update public.profiles
set last_name = 'Ontwikkelveld',
    updated_at = now()
where login_name = 'coach'
  and first_name = 'Coach'
  and last_name = 'Marpunten'
  and role = 'admin';
