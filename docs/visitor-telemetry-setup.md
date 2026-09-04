# Visitor telemetry setup

This document is for Codyssey maintainers. The learner-facing README intentionally excludes deployment credentials and database setup.

## 1. Create the Supabase project

Create a free Supabase project named `codyssey-analytics`.

- Enable the Data API.
- Disable automatic exposure of new tables.
- Enable automatic Row Level Security.
- Choose the region closest to most visitors.

## 2. Create the insert-only event table

Open **SQL Editor**, create a query, and run:

```sql
create table public.codyssey_events (
  id uuid primary key default gen_random_uuid(),
  visitor_id uuid not null,
  event_type text not null check (event_type in ('visit', 'profile_name')),
  display_name text check (display_name is null or char_length(display_name) <= 50),
  created_at timestamptz not null default now()
);

alter table public.codyssey_events enable row level security;

grant insert (visitor_id, event_type, display_name)
on public.codyssey_events
to anon;

create policy "Allow anonymous analytics inserts"
on public.codyssey_events
for insert
to anon
with check (
  event_type in ('visit', 'profile_name')
  and (display_name is null or char_length(display_name) <= 50)
);
```

There is deliberately no anonymous `select`, `update`, or `delete` policy.

## 3. Configure GitHub Pages

From the Supabase project, copy:

- The project URL
- The browser-safe publishable key beginning with `sb_publishable_`

Never use a secret or `service_role` key in the website.

In the GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and create:

| Variable | Value |
|---|---|
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser-safe publishable key |

Redeploy the GitHub Pages workflow after adding the variables.

## 4. View telemetry

Raw events are available under **Table Editor → `codyssey_events`**.

Run this in SQL Editor for visit totals:

```sql
select
  count(*) filter (where event_type = 'visit') as visits,
  count(distinct visitor_id) as unique_visitors
from public.codyssey_events;
```

Run this to view submitted display names:

```sql
select display_name, created_at
from public.codyssey_events
where event_type = 'profile_name'
order by created_at desc;
```

Telemetry begins after the configured deployment goes live; earlier visits cannot be recovered.
