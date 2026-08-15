"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const STATUT_PAR_LABEL: Record<string, number> = {
  prospect: 1,
  mineur: 2,
  majeur: 3,
  intermediaire: 4,
  junior: 5,
  senior: 6,
  jv: 7,
  varsity: 8,
};

function normaliser(s: string) {
  return s.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

async function verifierAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return null;
  return user;
}

export async function importerJoueurs(lignes: Record<string, string>[]) {
  const moi = await verifierAdmin();
  if (!moi) return { ok: false, count: 0, erreurs: ["Non autorisé."] };

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: teams } = await supabase.from("teams").select("id, name").eq("archived", false);
  const teamByName = new Map((teams ?? []).map((t) => [normaliser(t.name), t.id]));

  let count = 0;
  const erreurs: string[] = [];

  for (const ligne of lignes) {
    const nomAthlete = (ligne.nom_athlete ?? "").trim();
    const email = (ligne.courriel_parent ?? "").trim().toLowerCase();
    const equipeNom = (ligne.equipe ?? "").trim();
    const statutLabel = (ligne.statut ?? "").trim();
    const dateNaissance = (ligne.date_naissance ?? "").trim();
    const nomParent = (ligne.nom_parent ?? "").trim();
    const telParent = (ligne.telephone_parent ?? "").trim();

    if (!nomAthlete || !email || !equipeNom) {
      erreurs.push(`Ligne ignorée (données manquantes) : ${nomAthlete || email || "?"}`);
      continue;
    }

    const teamId = teamByName.get(normaliser(equipeNom));
    if (!teamId) {
      erreurs.push(`Équipe introuvable pour ${nomAthlete} : « ${equipeNom} »`);
      continue;
    }

    const statusId = STATUT_PAR_LABEL[normaliser(statutLabel)] ?? 1;

    let profileId: string;
    const { data: profilExistant } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
    if (profilExistant) {
      profileId = profilExistant.id;
    } else {
      const { data: invite, error } = await admin.auth.admin.inviteUserByEmail(email, {
        data: { full_name: nomAthlete },
      });
      if (error || !invite.user) {
        erreurs.push(`Impossible de créer le compte pour ${nomAthlete} (${email}) : ${error?.message ?? "erreur inconnue"}`);
        continue;
      }
      profileId = invite.user.id;
      await admin.from("profiles").update({ full_name: nomAthlete }).eq("id", profileId);
    }

    const { data: membreExistant } = await admin
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("profile_id", profileId)
      .maybeSingle();
    if (membreExistant) {
      await admin.from("team_members").update({ status_id: statusId }).eq("id", membreExistant.id);
    } else {
      await admin.from("team_members").insert({
        team_id: teamId,
        profile_id: profileId,
        role_in_team: "athlete",
        status_id: statusId,
      });
    }

    if (dateNaissance || nomParent || telParent) {
      const { data: ficheExistante } = await admin
        .from("athlete_details")
        .select("id")
        .eq("profile_id", profileId)
        .maybeSingle();
      const donnees = {
        ...(dateNaissance ? { birth_date: dateNaissance } : {}),
        ...(nomParent ? { guardian_name: nomParent } : {}),
        ...(telParent ? { guardian_phone: telParent } : {}),
      };
      if (ficheExistante) {
        await admin.from("athlete_details").update(donnees).eq("id", ficheExistante.id);
      } else {
        await admin.from("athlete_details").insert({ profile_id: profileId, ...donnees });
      }
    }

    count++;
  }

  revalidatePath("/membres/admin/joueurs");
  return { ok: true, count, erreurs };
}

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
