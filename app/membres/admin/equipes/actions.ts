"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { idGameChanger, lienGameChanger } from "@/lib/site-v2/donnees";

export async function creerEquipe(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "");
  const seasonYear = Number(formData.get("season_year") ?? new Date().getFullYear());
  const option = String(formData.get("option") ?? "") || null;

  if (!orgId || !name || !sport) return;

  const supabase = await createClient();
  const { data: equipe } = await supabase
    .from("teams")
    .insert({ org_id: orgId, name, sport, season_year: seasonYear, option })
    .select("id")
    .single();

  if (equipe) {
    const { data: direction } = await supabase.from("profiles").select("id").eq("role", "admin");
    if (direction && direction.length > 0) {
      await supabase.from("team_members").insert(
        direction.map((d) => ({ team_id: equipe.id, profile_id: d.id, role_in_team: "coach" as const, status_id: 8 })),
      );
    }
  }

  revalidatePath("/membres/admin/equipes");
}

export async function archiverEquipe(formData: FormData) {
  const teamId = String(formData.get("team_id") ?? "");
  if (!teamId) return;

  const supabase = await createClient();
  await supabase.from("teams").update({ archived: true }).eq("id", teamId);

  revalidatePath("/membres/admin/equipes");
}

export async function desarchiverEquipe(formData: FormData) {
  const teamId = String(formData.get("team_id") ?? "");
  if (!teamId) return;

  const supabase = await createClient();
  await supabase.from("teams").update({ archived: false }).eq("id", teamId);

  revalidatePath("/membres/admin/equipes");
}

export async function modifierEquipe(formData: FormData) {
  const teamId = String(formData.get("team_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const seasonYear = Number(formData.get("season_year") ?? 0);
  const option = String(formData.get("option") ?? "") || null;
  if (!teamId || !name || !Number.isInteger(seasonYear)) return;

  const supabase = await createClient();
  await supabase.from("teams").update({ name, season_year: seasonYear, option }).eq("id", teamId);

  // Site public (migration 0009). Étape à part : si les colonnes n'existent pas encore, la modification du nom ci-dessus reste valide.
  if (formData.get("champs_publics") === "1") {
    const ordre = String(formData.get("ordre_affichage") ?? "").trim();
    const { error } = await supabase
      .from("teams")
      .update({
        visible_public: formData.get("visible_public") === "on",
        roster_public: formData.get("roster_public") === "on",
        gamechanger_widget_id: idGameChanger(formData.get("gamechanger_widget_id")) || null,
        gamechanger_url: lienGameChanger(formData.get("gamechanger_url")) || null,
        categorie: String(formData.get("categorie") ?? "").trim().slice(0, 30) || null,
        ordre_affichage: ordre !== "" && Number.isInteger(Number(ordre)) ? Number(ordre) : null,
        nom_public: String(formData.get("nom_public") ?? "").trim().slice(0, 40) || null,
        description_publique: String(formData.get("description_publique") ?? "").trim().slice(0, 240) || null,
      })
      .eq("id", teamId);
    if (error) console.error("equipes: champs publics", error.message);
  }

  revalidatePath("/site-v2");
  revalidatePath("/membres/admin/equipes");
  revalidatePath(`/membres/admin/equipes/${teamId}`);
  revalidatePath("/membres/admin");
}
