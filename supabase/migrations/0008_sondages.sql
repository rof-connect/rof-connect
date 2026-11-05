-- Sondages (voyage Spring Training, choix d'uniforme, etc.). Accès uniquement via le serveur (clé service).
create table public.polls (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), title text not null, description text, team_id uuid references public.teams(id) on delete cascade, closed boolean not null default false);
create table public.poll_options (id uuid primary key default gen_random_uuid(), poll_id uuid not null references public.polls(id) on delete cascade, label text not null, image_path text, position int not null default 0);
create table public.poll_votes (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), poll_id uuid not null references public.polls(id) on delete cascade, option_id uuid not null references public.poll_options(id) on delete cascade, profile_id uuid not null references public.profiles(id) on delete cascade, unique (poll_id, profile_id));
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
grant select, insert, update, delete on public.polls, public.poll_options, public.poll_votes to service_role;
