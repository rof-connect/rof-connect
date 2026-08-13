"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { envoyerCourriel } from "@/lib/resend";
import { courrielNouvelEvenement } from "@/lib/email-templates";

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

  const { data: contenu } = await supabase
    .from("contents")
    .insert({
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
    })
    .select("id, teams (name)")
    .single();

  revalidatePath("/membres/agenda");

  if (contenu) {
    const { data: membres } = await supabase
      .from("team_members")
      .select("profile_id, status_id, profiles (email)")
      .eq("team_id", teamId)
      .gte("status_id", minStatus);

    const equipe = Array.isArray(contenu.teams) ? contenu.teams[0] : contenu.teams;
    const dateAffichee = new Date(date + "T12:00:00").toLocaleDateString("fr-CA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    const destinataires = (membres ?? [])
      .filter((m) => m.profile_id !== user.id)
      .map((m) => (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles)?.email)
      .filter((email): email is string => !!email);

    await envoyerCourriel(
      destinataires,
      `Nouvel événement — ${titre}`,
      courrielNouvelEvenement(equipe?.name ?? "", titre, dateAffichee, lieu || null),
    );
  }
}

export async function supprimerEvenement(formData: FormData) {
  const contentId = String(formData.get("content_id") ?? "");
  if (!contentId) return;

  const supabase = await createClient();
  await supabase.from("contents").delete().eq("id", contentId);

  revalidatePath("/membres/agenda");
}
