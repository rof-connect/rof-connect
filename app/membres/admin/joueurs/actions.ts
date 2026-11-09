"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { trouverOuCreerJoueuse } from "@/lib/joueuses";
import { definirArchivee } from "@/lib/joueuses-archivees";
import { chargerStatutsJoueuses, definirStatutJoueuse, statutEffectif, statutSelonNaissance } from "@/lib/statuts";
import { definirLiens, liensDuFormulaire } from "@/lib/liens-sociaux";

const STATUT_PAR_LABEL: Record<string, number> = {
  prospect: 1,
  "9u": 2,
  "10u": 3,
  "11u": 4,
  "12u": 5,
  "13u": 6,
  "14u": 7,
  "15u": 8,
  "16u": 9,
  "17u": 10,
  "18u": 11,
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

    const res = await trouverOuCreerJoueuse(admin, { nom: nomAthlete, email, envoyerInvitation: true });
    if (!res.ok) {
      erreurs.push(`Impossible de créer le compte pour ${nomAthlete} (${email}) : ${res.erreur}`);
      continue;
    }
    const profileId = res.profileId;

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

    if (statusId > 1) await definirStatutJoueuse(profileId, statusId);

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

export async function inviterJoueuse(formData: FormData) {
  const moi = await verifierAdmin();
  if (!moi) return { ok: false, erreur: "Non autorisé." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const teamId = String(formData.get("team_id") ?? "");

  if (!fullName || !email || !teamId) {
    return { ok: false, erreur: "Complète le nom, le courriel et sélectionne une équipe." };
  }

  const admin = createAdminClient();

  const res = await trouverOuCreerJoueuse(admin, { nom: fullName, email, envoyerInvitation: true });
  if (!res.ok) return { ok: false, erreur: res.erreur };
  const profileId = res.profileId;

  const { data: membreExistant } = await admin
    .from("team_members")
    .select("id")
    .eq("team_id", teamId)
    .eq("profile_id", profileId)
    .maybeSingle();
  if (!membreExistant) {
    await admin.from("team_members").insert({
      team_id: teamId,
      profile_id: profileId,
      role_in_team: "athlete",
      status_id: 1,
    });
  }

  revalidatePath("/membres/admin/joueurs");
  return { ok: true, erreur: null };
}

export async function changerStatut(formData: FormData) {
  const teamMemberId = String(formData.get("team_member_id") ?? "");
  const statusId = Number(formData.get("status_id") ?? 0);
  if (!teamMemberId || !statusId) return;

  // Le statut appartient à la joueuse : on le change pour toutes ses équipes.
  const moi = await verifierAdmin();
  if (!moi) return;
  const { data: ligne } = await createAdminClient().from("team_members").select("profile_id").eq("id", teamMemberId).maybeSingle();
  if (!ligne) return;
  await definirStatutJoueuse(ligne.profile_id, statusId);

  revalidatePath("/membres/admin/joueurs");
  revalidatePath("/membres/admin");
}

/** Gestion du statut seule (Prospect, 9U… 18U), indépendante des équipes. */
export async function changerStatutJoueuse(formData: FormData) {
  const moi = await verifierAdmin();
  if (!moi) return;
  const profileId = String(formData.get("profile_id") ?? "");
  const statusId = Number(formData.get("status_id") ?? 0);
  if (!profileId || !Number.isInteger(statusId) || statusId < 1 || statusId > 11) return;
  await definirStatutJoueuse(profileId, statusId);
  revalidatePath("/membres/admin/joueurs");
  revalidatePath("/membres/admin");
  revalidatePath("/membres");
}

export async function ajouterAEquipe(formData: FormData) {
  const profileId = String(formData.get("profile_id") ?? "");
  const teamId = String(formData.get("team_id") ?? "");
  if (!profileId || !teamId) return;

  // Ajouter à une équipe ne change pas le statut : la joueuse garde le sien.
  const admin = createAdminClient();
  const { data: existantes } = await admin.from("team_members").select("status_id").eq("profile_id", profileId).eq("role_in_team", "athlete");
  const statusId = statutEffectif(profileId, await chargerStatutsJoueuses(), (existantes ?? []).map((e) => e.status_id));
  const supabase = await createClient();
  await supabase.from("team_members").insert({
    team_id: teamId,
    profile_id: profileId,
    role_in_team: "athlete",
    status_id: statusId,
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

function champsFiche(formData: FormData) {
  const txt = (k: string) => String(formData.get(k) ?? "").trim() || null;
  return {
    birth_date: txt("birth_date"),
    position:
      [formData.get("position"), formData.get("position2"), formData.get("position3")]
        .map((v) => String(v ?? "").trim().replace(/,/g, " ").slice(0, 40))
        .filter(Boolean)
        .join(", ") || null,
    throws: txt("throws"),
    bats: txt("bats"),
    guardian_name: txt("guardian_name"),
    guardian_phone: txt("guardian_phone"),
    guardian_email: txt("guardian_email"),
    medical_notes: txt("medical_notes"),
    photo_consent: formData.get("photo_consent") === "on",
  };
}

export async function creerProfilJoueuse(formData: FormData) {
  const moi = await verifierAdmin();
  if (!moi) return { ok: false, erreur: "Non autorisé." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const teamId = String(formData.get("team_id") ?? "");
  const statusId = Number(formData.get("status_id") ?? 1) || 1;
  const envoyerInvitation = formData.get("envoyer_invitation") === "on";

  if (!fullName) return { ok: false, erreur: "Le nom est obligatoire." };

  const admin = createAdminClient();
  const res = await trouverOuCreerJoueuse(admin, { nom: fullName, email, envoyerInvitation });
  if (!res.ok) return { ok: false, erreur: res.erreur };

  await admin.from("athlete_details").upsert({ profile_id: res.profileId, ...champsFiche(formData) }, { onConflict: "profile_id" });

  if (teamId) {
    const { data: existant } = await admin
      .from("team_members")
      .select("id")
      .eq("team_id", teamId)
      .eq("profile_id", res.profileId)
      .maybeSingle();
    if (existant) await admin.from("team_members").update({ status_id: statusId }).eq("id", existant.id);
    else
      await admin
        .from("team_members")
        .insert({ team_id: teamId, profile_id: res.profileId, role_in_team: "athlete", status_id: statusId });
  }

  if (statusId > 1) await definirStatutJoueuse(res.profileId, statusId);

  revalidatePath("/membres/admin/joueurs");
  return { ok: true, erreur: null };
}

export async function modifierJoueuse(formData: FormData) {
  const moi = await verifierAdmin();
  if (!moi) return;

  const profileId = String(formData.get("profile_id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  if (!profileId || !fullName) return;

  const admin = createAdminClient();
  await admin.from("profiles").update({ full_name: fullName }).eq("id", profileId);
  await admin.from("athlete_details").upsert({ profile_id: profileId, ...champsFiche(formData) }, { onConflict: "profile_id" });
  await definirLiens(profileId, liensDuFormulaire(formData));

  revalidatePath("/membres/admin/joueurs");
}

/** Archive (ou désarchive) une joueuse : elle disparaît des listes de la Direction, mais son compte et ses données sont conservés. */
export async function archiverJoueuse(formData: FormData) {
  const moi = await verifierAdmin();
  if (!moi) return;
  const profileId = String(formData.get("profile_id") ?? "");
  if (!profileId) return;
  await definirArchivee(profileId, formData.get("archiver") === "1");
  revalidatePath("/membres/admin/joueurs");
  revalidatePath("/membres/admin");
}

/** Accepter une joueuse : elle passe de Prospect au statut de son âge au 1er septembre de la saison en cours. */
export async function accepterJoueuse(formData: FormData) {
  const moi = await verifierAdmin();
  if (!moi) return;
  const profileId = String(formData.get("profile_id") ?? "");
  if (!profileId) return;
  const { data: fiche } = await createAdminClient().from("athlete_details").select("birth_date").eq("profile_id", profileId).maybeSingle();
  const statut = statutSelonNaissance(fiche?.birth_date);
  if (!statut) return; // date de naissance manquante : à compléter dans la fiche
  await definirStatutJoueuse(profileId, statut.id);
  revalidatePath("/membres/admin/joueurs");
  revalidatePath("/membres/admin");
  revalidatePath("/membres");
}
