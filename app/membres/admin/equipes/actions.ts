"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function creerEquipe(formData: FormData) {
  const orgId = String(formData.get("org_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sport = String(formData.get("sport") ?? "");
  const seasonYear = Number(formData.get("season_year") ?? new Date().getFullYear());

  if (!orgId || !name || !sport) return;

  const supabase = await createClient();
  await supabase.from("teams").insert({ org_id: orgId, name, sport, season_year: seasonYear });

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
