"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function ajouterEvenementCalendrier(formData: FormData) {
  const teamId = String(formData.get("team_id") ?? "").trim();
  const sport = String(formData.get("sport") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const eventTime = String(formData.get("event_time") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  const type = String(formData.get("type") ?? "Autre").trim();

  if (!title || !eventDate) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("calendar_events").insert({
    team_id: teamId || null,
    sport: sport || null,
    title,
    event_date: eventDate,
    event_time: eventTime || null,
    location: location || null,
    note: note || null,
    type: type || "Autre",
    created_by: user.id,
  });

  revalidatePath("/membres/calendrier");
}

export async function supprimerEvenementCalendrier(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("calendar_events").delete().eq("id", id);

  revalidatePath("/membres/calendrier");
}
