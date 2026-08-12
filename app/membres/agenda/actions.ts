"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function repondre(formData: FormData) {
  const contentId = String(formData.get("content_id") ?? "");
  const response = String(formData.get("response") ?? "");
  if (!contentId || (response !== "yes" && response !== "no")) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("attendance").upsert(
    { content_id: contentId, profile_id: user.id, response },
    { onConflict: "content_id,profile_id" },
  );

  revalidatePath("/membres/agenda");
}

const TYPES_VALIDES = ["Pratique", "Match", "Tournoi", "Autre"];

export async function ajouterEvenement(formData: FormData) {
  const teamId = String(formData.get("team_id") ?? "");
  const titre = String(formData.get("titre") ?? "").trim();
  const type = String(formData.get("type") ?? "Autre");
  const date = String(formData.get("date") ?? "");
  const heure = String(formData.get("heure") ?? "").trim();
  const lieu = String(formData.get("lieu") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const minStatus = Number(formData.get("min_status") ?? 1);

  if (!teamId || !titre || !date) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("contents").insert({
    team_id: teamId,
    kind: "agenda",
    min_status: minStatus,
    title: titre,
    event_date: date,
    created_by: user.id,
    body: {
      type: TYPES_VALIDES.includes(type) ? type : "Autre",
      heure: heure || null,
      lieu: lieu || null,
      note: note || null,
    },
  });

  revalidatePath("/membres/agenda");
}

export async function supprimerEvenement(formData: FormData) {
  const contentId = String(formData.get("content_id") ?? "");
  if (!contentId) return;

  const supabase = await createClient();
  await supabase.from("contents").delete().eq("id", contentId);

  revalidatePath("/membres/agenda");
}
