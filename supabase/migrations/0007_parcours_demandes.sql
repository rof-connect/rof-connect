-- Réponses au questionnaire de parcours (page publique /parcours et onglet Parcours des membres).
create table if not exists public.parcours_demandes (
  id                 uuid primary key default gen_random_uuid(),
  created_at         timestamptz not null default now(),
  profile_id         uuid references public.profiles(id) on delete set null,
  reponses           jsonb not null,
  resultat           jsonb not null,
  consentement_le    timestamptz not null,
  courriel_envoye_le timestamptz,
  erreur             text,
  statut             text not null default 'nouveau',
  notes              text,
  conserver_jusqu_au date not null default (current_date + interval '12 months')
);

alter table public.parcours_demandes enable row level security;

-- Écriture uniquement via la clé service (action serveur). Lecture/suivi : administrateurs ; la joueuse lit les siennes.
create policy "parcours_admin_select" on public.parcours_demandes for select to authenticated using (public.is_admin(auth.uid()));
create policy "parcours_own_select" on public.parcours_demandes for select to authenticated using (profile_id = auth.uid());
create policy "parcours_admin_update" on public.parcours_demandes for update to authenticated using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));
create policy "parcours_admin_delete" on public.parcours_demandes for delete to authenticated using (public.is_admin(auth.uid()));
