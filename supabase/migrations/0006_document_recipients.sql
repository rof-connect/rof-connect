-- Partage de documents à des joueuses précises (null = toute l'équipe).
alter table contents add column if not exists recipient_ids uuid[];

drop policy if exists "contents_select" on contents;
create policy "contents_select" on contents
  for select to authenticated
  using (
    public.is_admin(auth.uid())
    or public.is_team_staff(team_id, auth.uid())
    or (
      public.is_team_member(team_id, auth.uid())
      and coalesce(public.member_status(team_id, auth.uid()), 0) >= min_status
      and (recipient_ids is null or auth.uid() = any(recipient_ids))
    )
  );
