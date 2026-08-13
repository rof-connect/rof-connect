-- Calendrier mensuel partagé (organisation / sport / équipe), distinct
-- de l'agenda par équipe (table contents, kind='agenda'). Visible par
-- tous les membres connectés ; création/suppression réservées à l'admin.

create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_id uuid references teams(id) on delete cascade,
  sport sport_type,
  title text not null,
  event_date date not null,
  event_time text,
  location text,
  note text,
  type text not null default 'Autre',
  created_by uuid references profiles(id) on delete set null
);

create index on calendar_events (event_date);
create index on calendar_events (team_id);

alter table calendar_events enable row level security;

grant select, insert, update, delete on calendar_events to authenticated;

create policy "calendar_events_select" on calendar_events
  for select to authenticated
  using (true);

create policy "calendar_events_write" on calendar_events
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
