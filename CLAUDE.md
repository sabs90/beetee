# Illy Sleep Tracker

A mobile-first web app to track a 3-year-old's sleep patterns, specifically to identify whether daytime naps are causing long bedtime wind-downs.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **Supabase** (Postgres) for storage — no auth, single user, permissive RLS
- **Tailwind CSS v4** (CSS-first config with `@theme inline` in globals.css)
- **Recharts** for charts
- **TypeScript**, `@/*` path alias → `./src/*`

## Project structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, Plus Jakarta Sans font, BottomNav
│   ├── globals.css             # Tailwind v4 theme (indigo/purple palette)
│   ├── page.tsx                # Redirects to /log
│   ├── log/page.tsx            # Sleep entry form (main interaction)
│   ├── history/page.tsx        # Scrollable list of past entries
│   ├── patterns/page.tsx       # Charts + summary stats
│   └── api/entries/
│       ├── route.ts            # GET (list) + POST (upsert)
│       └── [id]/route.ts       # DELETE
├── components/
│   ├── SleepForm.tsx           # Entry form (8 fields, nap fields conditional)
│   ├── EntryCard.tsx           # Compact card for history view
│   ├── BottomNav.tsx           # Fixed mobile bottom nav (Log / History / Patterns)
│   ├── TimeInput.tsx           # Reusable time input wrapper
│   └── charts/
│       ├── NapVsSleepChart.tsx  # Bar chart: nap vs no-nap avg time to sleep
│       └── SleepTrendChart.tsx  # Line chart: sleep timing over time
└── lib/
    ├── supabase.ts             # Lazy-init client + service client (same pattern as halaqas project)
    ├── types.ts                # SleepEntry interface
    └── utils.ts                # calcMinutesBetween, formatTime, formatDate
```

## Database

Single table `sleep_entries` in Supabase:

| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK, auto-generated |
| date | date | UNIQUE — one entry per night |
| had_nap | boolean | |
| nap_duration_mins | smallint | null if no nap |
| nap_wake_time | time | null if no nap |
| lights_out_time | time | |
| fell_asleep_time | time | |
| night_wakings | smallint | default 0 |
| morning_wake_time | time | |
| notes | text | optional |
| created_at | timestamptz | |

SQL to create (run in Supabase SQL editor):

```sql
create table sleep_entries (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  had_nap boolean not null default false,
  nap_duration_mins smallint,
  nap_wake_time time,
  lights_out_time time not null,
  fell_asleep_time time not null,
  night_wakings smallint not null default 0,
  morning_wake_time time not null,
  notes text,
  created_at timestamptz not null default now()
);

create index idx_sleep_entries_date on sleep_entries (date desc);

alter table sleep_entries enable row level security;
create policy "Allow all access" on sleep_entries for all using (true) with check (true);
```

## Key design decisions

- **No auth.** Single-user personal tool. Permissive RLS policy. Supabase anon key exposed client-side is fine.
- **Upsert on date.** POST to `/api/entries` does an upsert on the `date` column. Editing = resubmitting the same date.
- **Native HTML5 inputs.** `<input type="time">` and `<input type="date">` for fast bedtime entry on mobile. No custom date/time picker libraries.
- **API routes over Server Actions.** Familiar pattern from other projects, easier to debug.
- **Computed fields in UI.** `time_to_fall_asleep` (fell_asleep - lights_out) and `total_sleep` are calculated client-side, not stored.

## Current status

- All pages and components built
- Build compiles clean (`next build` passes)
- **NOT YET DONE:**
  - Supabase project needs to be created and `.env.local` updated with real credentials
  - Not yet tested end-to-end with real data
  - Not yet deployed to Vercel

## Environment

- `.env.local` needs three values: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Patterns from other projects

- Supabase client setup follows the same lazy-init Proxy pattern as `/Users/sabs/projects/halaqas/src/lib/supabase.ts`
- Tailwind v4 CSS-first config matches halaqas approach
- API routes use `getServiceClient()` for server-side Supabase access

## Context

This app was built to support a parenting goal: tracking whether Illy's daytime naps correlate with longer bedtime wind-downs (currently taking 1-1.5 hours on some nights). The patterns page is designed to make the nap-day vs no-nap-day comparison immediately visible.
