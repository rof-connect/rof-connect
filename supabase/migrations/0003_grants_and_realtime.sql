-- Nouveaux projets Supabase : les privilèges de table ne sont pas
-- accordés automatiquement aux rôles anon/authenticated/service_role.
-- Necessaire en plus de RLS (RLS filtre les lignes, les GRANT
-- autorisent l'operation elle-meme).
grant usage on schema public to authenticated, anon, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

-- Messagerie temps réel (section 7.2c du cahier des charges).
alter publication supabase_realtime add table public.messages;
