-- Permet aussi à un membre de lire le profil (nom) du coach de son
-- équipe (nécessaire pour attribuer les messages dans la messagerie).
-- La lecture réciproque (coach -> membres) existait déjà.

alter policy "profiles_select" on profiles
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
  or exists (
    select 1 from team_members tm_self2
    join team_members tm_target2
      on tm_target2.team_id = tm_self2.team_id
    where tm_self2.profile_id = auth.uid()
      and tm_target2.profile_id = profiles.id
      and tm_target2.role_in_team = 'coach'
  )
);
