import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { envoyerCourriel } from "@/lib/resend";
import { courrielRappelPresence } from "@/lib/email-templates";

type EvenementBody = { heure?: string | null };

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const admin = createAdminClient();

  const dans48h = new Date();
  dans48h.setDate(dans48h.getDate() + 2);
  const cible = dans48h.toISOString().slice(0, 10);

  const { data: evenements } = await admin
    .from("contents")
    .select("id, title, event_date, min_status, team_id, body, teams (name)")
    .eq("kind", "agenda")
    .eq("event_date", cible);

  let envoyes = 0;

  for (const e of evenements ?? []) {
    const { data: membres } = await admin
      .from("team_members")
      .select("profile_id, profiles (email)")
      .eq("team_id", e.team_id)
      .eq("role_in_team", "athlete")
      .gte("status_id", e.min_status);

    const { data: reponses } = await admin.from("attendance").select("profile_id").eq("content_id", e.id);
    const ontRepondu = new Set((reponses ?? []).map((r) => r.profile_id));

    const destinataires = (membres ?? [])
      .filter((m) => !ontRepondu.has(m.profile_id))
      .map((m) => (Array.isArray(m.profiles) ? m.profiles[0] : m.profiles)?.email)
      .filter((email): email is string => !!email);

    if (destinataires.length === 0) continue;

    const equipe = Array.isArray(e.teams) ? e.teams[0] : e.teams;
    const body = (e.body ?? {}) as EvenementBody;
    const dateAffichee = new Date(e.event_date + "T12:00:00").toLocaleDateString("fr-CA", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });

    await envoyerCourriel(
      destinataires,
      `Rappel — confirme ta présence : ${e.title}`,
      courrielRappelPresence(equipe?.name ?? "", e.title, dateAffichee, body.heure ?? null),
    );
    envoyes += destinataires.length;
  }

  return NextResponse.json({ ok: true, evenements: (evenements ?? []).length, courriels: envoyes });
}
