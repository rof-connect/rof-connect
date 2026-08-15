"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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
