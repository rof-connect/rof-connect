-- ROF Connect — schéma initial + RLS
-- Cahier des charges sections 4, 5, 6

-- ============================================================
-- Types
-- ============================================================
create type profile_role as enum ('admin', 'coach', 'member');
create type team_role as enum ('coach', 'athlete');
create type sport_type as enum ('baseball', 'softball');
create type content_kind as enum ('agenda', 'news', 'season', 'plan', 'relay', 'video', 'gamechanger', 'signal');
create type attendance_response as enum ('yes', 'no');
create type message_channel as enum ('team', 'private');
create type media_kind as enum ('photo', 'video');

-- ============================================================
-- Tables
-- ============================================================

create table organizations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  slug text not null unique
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  sport sport_type not null,
  season_year int not null,
  archived boolean not null default false
);

-- Étend auth.users : id identique à l'utilisateur Supabase.
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  full_name text,
  email text,
  phone text,
  role profile_role not null default 'member'
);

create table team_members (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_id uuid not null references teams(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role_in_team team_role not null,
  status_id int not null default 1 check (status_id between 1 and 8),
  unique (team_id, profile_id)
);

-- Fiche d'inscription — séparée de profiles (données sensibles).
create table athlete_details (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  profile_id uuid not null unique references profiles(id) on delete cascade,
  birth_date date,
  position text,
  throws text,
  bats text,
  guardian_name text,
  guardian_phone text,
  guardian_email text,
  medical_notes text,
  photo_consent boolean not null default false,
  fieldlevel_url text
);

-- Table unique pour toutes les sections, avec un champ JSON par type.
create table contents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_id uuid not null references teams(id) on delete cascade,
  kind content_kind not null,
  min_status int not null default 1 check (min_status between 1 and 8),
  title text not null,
  body jsonb not null default '{}'::jsonb,
  event_date date,
  created_by uuid references profiles(id) on delete set null
);

create table attendance (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  content_id uuid not null references contents(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  response attendance_response not null,
  unique (content_id, profile_id)
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_id uuid not null references teams(id) on delete cascade,
  channel message_channel not null,
  thread_profile_id uuid references profiles(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  content text not null,
  read_by uuid[] not null default '{}'
);

create table media (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  team_id uuid not null references teams(id) on delete cascade,
  uploaded_by uuid not null references profiles(id) on delete cascade,
  storage_path text not null,
  kind media_kind not null,
  content_id uuid references contents(id) on delete set null
);

-- Textes du site public, modifiables par l'admin (section 7.1).
create table site_content (
  key text primary key,
  value text not null default '',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Index utiles
-- ============================================================
create index on teams (org_id);
create index on team_members (profile_id);
create index on team_members (team_id);
create index on contents (team_id, kind);
create index on attendance (profile_id);
create index on messages (team_id, channel);
create index on media (team_id);

-- ============================================================
-- Profil créé automatiquement à l'inscription Supabase Auth
-- ============================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name', 'member');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Fonctions d'aide RLS (SECURITY DEFINER pour éviter la récursion)
-- ============================================================
create function public.is_admin(p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles where id = p_profile_id and role = 'admin'
  );
$$;

create function public.is_team_member(p_team_id uuid, p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from team_members
    where team_id = p_team_id and profile_id = p_profile_id
  );
$$;

create function public.is_team_staff(p_team_id uuid, p_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    public.is_admin(p_profile_id)
    or exists (
      select 1 from team_members
      where team_id = p_team_id
        and profile_id = p_profile_id
        and role_in_team = 'coach'
    );
$$;

create function public.member_status(p_team_id uuid, p_profile_id uuid)
returns int
language sql
security definer
set search_path = public
stable
as $$
  select status_id from team_members
  where team_id = p_team_id and profile_id = p_profile_id
  limit 1;
$$;

grant execute on function public.is_admin(uuid) to authenticated;
grant execute on function public.is_team_member(uuid, uuid) to authenticated;
grant execute on function public.is_team_staff(uuid, uuid) to authenticated;
grant execute on function public.member_status(uuid, uuid) to authenticated;

-- ============================================================
-- RLS
-- ============================================================
alter table organizations enable row level security;
alter table teams enable row level security;
alter table profiles enable row level security;
alter table team_members enable row level security;
alter table athlete_details enable row level security;
alter table contents enable row level security;
alter table attendance enable row level security;
alter table messages enable row level security;
alter table media enable row level security;
alter table site_content enable row level security;

-- organizations : lecture par tout utilisateur authentifié, écriture admin seulement.
create policy "organizations_select" on organizations
  for select to authenticated
  using (true);

create policy "organizations_write" on organizations
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- teams : lecture par les membres/staff de l'équipe ou l'admin ; écriture admin seulement.
create policy "teams_select" on teams
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.is_team_member(id, auth.uid())
    or public.is_team_staff(id, auth.uid())
  );

create policy "teams_write" on teams
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- profiles : chacun lit/modifie le sien ; coach et admin lisent ceux de leurs équipes.
create policy "profiles_select" on profiles
  for select to authenticated
  using (
    id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from team_members tm_self
      join team_members tm_target
        on tm_target.team_id = tm_self.team_id
      where tm_self.profile_id = auth.uid()
        and tm_self.role_in_team = 'coach'
        and tm_target.profile_id = profiles.id
    )
  );

create policy "profiles_update_own" on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- athlete_details : lecture par le propriétaire, les coachs de ses équipes, l'admin.
-- Aucun autre accès (données médicales). Écriture par le propriétaire ou l'admin.
create policy "athlete_details_select" on athlete_details
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from team_members tm
      where tm.profile_id = athlete_details.profile_id
        and public.is_team_staff(tm.team_id, auth.uid())
    )
  );

create policy "athlete_details_write" on athlete_details
  for all to authenticated
  using (profile_id = auth.uid() or public.is_admin(auth.uid()))
  with check (profile_id = auth.uid() or public.is_admin(auth.uid()));

-- team_members : lecture par les membres de la même équipe ; écriture coach/admin.
create policy "team_members_select" on team_members
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.is_team_member(team_id, auth.uid())
  );

create policy "team_members_write" on team_members
  for all to authenticated
  using (public.is_team_staff(team_id, auth.uid()))
  with check (public.is_team_staff(team_id, auth.uid()));

-- contents : lecture filtrée par statut ; staff voit tout ; écriture staff/admin.
create policy "contents_select" on contents
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.is_team_staff(team_id, auth.uid())
    or (
      public.is_team_member(team_id, auth.uid())
      and coalesce(public.member_status(team_id, auth.uid()), 0) >= min_status
    )
  );

create policy "contents_write" on contents
  for all to authenticated
  using (public.is_team_staff(team_id, auth.uid()))
  with check (public.is_team_staff(team_id, auth.uid()));

-- attendance : un membre écrit sa propre réponse ; coach/admin lisent tout.
create policy "attendance_select" on attendance
  for select to authenticated
  using (
    profile_id = auth.uid()
    or public.is_admin(auth.uid())
    or exists (
      select 1 from contents c
      where c.id = attendance.content_id
        and public.is_team_staff(c.team_id, auth.uid())
    )
  );

create policy "attendance_write_own" on attendance
  for all to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- messages : canal team lisible par l'équipe ; canal private réservé à l'athlète concerné + staff.
create policy "messages_select" on messages
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.is_team_staff(team_id, auth.uid())
    or (channel = 'team' and public.is_team_member(team_id, auth.uid()))
    or (channel = 'private' and thread_profile_id = auth.uid())
  );

create policy "messages_insert" on messages
  for insert to authenticated
  with check (
    author_id = auth.uid()
    and public.is_team_member(team_id, auth.uid())
    and (
      channel = 'team'
      or (channel = 'private' and (thread_profile_id = auth.uid() or public.is_team_staff(team_id, auth.uid())))
    )
  );

-- media : lecture par l'équipe ; écriture par tout membre ; suppression staff/admin/auteur.
create policy "media_select" on media
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.is_team_staff(team_id, auth.uid())
    or public.is_team_member(team_id, auth.uid())
  );

create policy "media_insert" on media
  for insert to authenticated
  with check (
    uploaded_by = auth.uid()
    and public.is_team_member(team_id, auth.uid())
  );

create policy "media_delete" on media
  for delete to authenticated
  using (
    uploaded_by = auth.uid()
    or public.is_team_staff(team_id, auth.uid())
    or public.is_admin(auth.uid())
  );

-- site_content : lecture publique (site vitrine), écriture admin seulement.
create policy "site_content_select" on site_content
  for select to anon, authenticated
  using (true);

create policy "site_content_write" on site_content
  for all to authenticated
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));
