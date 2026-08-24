# Marpunten

Marpunten is een Nederlandstalige teamomgeving voor persoonlijke voetbalontwikkeling. Trainers beheren spelers, perioden, Groeiwaarde, leeritems en media; spelers zien het teamoverzicht en uitsluitend hun eigen coachingcontent.

## Lokaal starten

Vereist: Node.js 22+, npm en voor de lokale database Docker plus de Supabase CLI.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Vul in `.env.local` de project-URL en publishable key van Supabase in. Voor een volledig lokale interface-demo zonder backend:

```text
VITE_DEMO_MODE=true
```

Log dan in met `coach` voor de adminomgeving of `daan8` voor de spelersomgeving; ieder niet-leeg wachtwoord werkt uitsluitend in demo mode.

## Supabase installeren

1. Maak een Supabase-project in een Europese regio.
2. Koppel en publiceer de versiebeheerbare backend:

```bash
npx supabase login
npx supabase link --project-ref JOUW_PROJECT_REF
npx supabase db push
npx supabase functions deploy admin-users
npx supabase secrets set APP_ORIGINS=https://GITHUB_GEBRUIKER.github.io
```

3. Open Authentication → Providers → Email en schakel publieke signup uit. Stel de minimale wachtwoordlengte in op 12 en vereis kleine letters, hoofdletters, cijfers en symbolen.
4. Zet Authentication → URL Configuration → Site URL op `https://Zeeebass.github.io/Ontwikkelveld/`.
5. De secret/service-role key blijft alleen in Supabase. Zet deze nooit in `.env.local` of GitHub.

### Eerste admin maken

Maak in Supabase Authentication handmatig een bevestigde gebruiker met het technische e-mailadres `coach@marpunten.invalid` en een sterk wachtwoord. Kopieer daarna de UUID van die Auth-user en voer in de SQL Editor uit:

```sql
insert into public.profiles (id, login_name, first_name, last_name, role)
values ('AUTH-USER-UUID', 'coach', 'Coach', 'Marpunten', 'admin');
```

De beheerder logt in de website in met `coach` en het gekozen wachtwoord. Spelersaccounts worden daarna uitsluitend via de adminomgeving en de beveiligde Edge Function gemaakt.

## Testen

```bash
npm run check
npx supabase start
npm run db:test
npm run test:e2e
```

De database-tests controleren schema, RLS en beveiligde functies. De browsertests bouwen automatisch in lokale demo mode.

## Online zetten met GitHub Pages

1. De broncode staat in de publieke repository `Zeeebass/Ontwikkelveld`; push wijzigingen naar `main`.
2. Voeg onder Settings → Secrets and variables → Actions → Variables toe:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
3. Kies Settings → Pages → Source → GitHub Actions.
4. De workflow `.github/workflows/deploy.yml` lint, test en bouwt iedere push naar `main`, en publiceert daarna `dist`.
5. Controleer `https://Zeeebass.github.io/Ontwikkelveld/` en test zowel een admin- als spelersaccount.

Omdat `HashRouter` wordt gebruikt, blijven refreshes op routes zoals `#/admin/players` betrouwbaar op GitHub Pages.

## Beveiligingsmodel

- De frontend bevat alleen de publishable Supabase key; bescherming komt uit grants en Row Level Security.
- `get_team_growth_summary()` geeft alleen openbare profielvelden en geaggregeerde Groeiwaarde terug.
- Persoonlijke progressieregels, leeritems en media zijn alleen selecteerbaar door de speler zelf en admins.
- Spelersfoto's staan in een private bucket en zijn alleen voor actieve teamleden leesbaar.
- Accountaanmaak, wachtwoordreset en ban/unban gebruiken server-side adminrechten in `admin-users`.
- Loginwachtwoorden worden nooit in de database bewaard of gelogd en zijn na genereren slechts één keer zichtbaar.
