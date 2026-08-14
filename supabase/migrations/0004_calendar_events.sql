-- Calendrier direction : événements généraux (organisation, un sport, ou une
-- équipe précise), distincts de l'agenda par équipe (table contents,
-- kind='agenda'). Visibles par tous les coachs/dirigeants, écrits par les
-- dirigeants (admins) seulement.
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

-- Lecture : tout coach (peu importe l'équipe) ou tout dirigeant.
create policy "calendar_events_select" on calendar_events
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or exists (
      select 1 from team_members tm
      where tm.profile_id = auth.uid() and tm.role_in_team = 'coach'
    )
  );

-- Écriture : dirigeants (admins) seulement.
create policy "calendar_events_write" on calendar_events
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

grant select, insert, update, delete on calendar_events to authenticated;
