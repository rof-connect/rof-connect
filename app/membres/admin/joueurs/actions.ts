"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function changerStatut(formData: FormData) {
  const teamMemberId = String(formData.get("team_member_id") ?? "");
  const statusId = Number(formData.get("status_id") ?? 0);
  if (!teamMemberId || !statusId) return;

  const supabase = await createClient();
  await supabase.from("team_members").update({ status_id: statusId }).eq("id", teamMemberId);

  revalidatePath("/membres/admin/joueurs");
}

export async function ajouterAEquipe(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const teamId = String(formData.get("team_id") ?? "");
  if (!profileId || !teamId) return;

  const supabase = await createClient();
  await supabase.from("team_members").insert({
    team_id: teamId,
    profile_id: profileId,
    role_in_team: "athlete",
    status_id: 1,
  });

  revalidatePath("/membres/admin/joueurs");
}

export async function deplacerVersEquipe(formData: FormData) {
  const teamMemberId = String(formData.get("team_member_id") ?? "");
  const nouvelleEquipeId = String(formData.get("nouvelle_equipe_id") ?? "");
  if (!teamMemberId || !nouvelleEquipeId) return;

  const supabase = await createClient();
  const { data: actuel } = await supabase
    .from("team_members")
    .select("profile_id, status_id")
    .eq("id", teamMemberId)
    .single();
  if (!actuel) return;

  await supabase.from("team_members").delete().eq("id", teamMemberId);
  await supabase.from("team_members").insert({
    team_id: nouvelleEquipeId,
    profile_id: actuel.profile_id,
    role_in_team: "athlete",
    status_id: actuel.status_id,
  });

  revalidatePath("/membres/admin/joueurs");
}

export async function retirerDeEquipe(formData: FormData) {
  const teamMemberId = String(formData.get("team_member_id") ?? "");
  if (!teamMemberId) return;

  const supabase = await createClient();
  await supabase.from("team_members").delete().eq("id", teamMemberId);

  revalidatePath("/membres/admin/joueurs");
}
