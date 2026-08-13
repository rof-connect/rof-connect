"use server";

import { createClient } from "@/lib/supabase/server";
import { envoyerCourriel } from "@/lib/resend";
import { courrielNouveauMessage } from "@/lib/email-templates";

export async function envoyerMessage({
  teamId,
  channel,
  threadProfileId,
  content,
}: {
  teamId: string;
  channel: "team" | "private";
  threadProfileId: string | null;
  content: string;
}) {
  const texte = content.trim();
  if (!texte) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("messages").insert({
    team_id: teamId,
    channel,
    thread_profile_id: channel === "private" ? threadProfileId : null,
    author_id: user.id,
    content: texte,
  });
  if (error) return;

  if (channel === "private" && threadProfileId) {
    const { data: profilAuteur } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

    // Le ou les destinataires du courriel : l'athlète du fil (si ce n'est pas
    // l'auteur) et les coachs de l'équipe (si ce n'est pas eux qui écrivent).
    const { data: athlete } = await supabase.from("profiles").select("email").eq("id", threadProfileId).single();
    const { data: coachs } = await supabase
      .from("team_members")
      .select("profile_id, profiles (email)")
      .eq("team_id", teamId)
      .eq("role_in_team", "coach");

    const destinataires = new Set<string>();
    if (threadProfileId !== user.id && athlete?.email) destinataires.add(athlete.email);
    (coachs ?? []).forEach((c) => {
      if (c.profile_id === user.id) return;
      const email = (Array.isArray(c.profiles) ? c.profiles[0] : c.profiles)?.email;
      if (email) destinataires.add(email);
    });

    await envoyerCourriel(
      Array.from(destinataires),
      "Nouveau message privé — ROF Connect",
      courrielNouveauMessage(profilAuteur?.full_name ?? "Un membre", texte.slice(0, 200)),
    );
  }
}
