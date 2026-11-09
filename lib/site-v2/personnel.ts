import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Entraineur = { nom: string; equipes: string[] };

/** Direction affichée sur le site (à compléter : nom et titre). Les entraîneurs, eux, viennent de ROF Connect. */
export const DIRECTION_SITE: { nom: string; role: string }[] = [{ nom: "Eric Dostaler", role: "Direction · Entraîneur 16U - Dostaler" }];

/**
 * Entraîneurs : les comptes « entraîneur » de ROF Connect, avec leurs équipes actives.
 * Seuls le nom et les équipes sont lus (jamais courriel ni téléphone).
 */
export async function chargerEntraineurs(): Promise<Entraineur[]> {
  const admin = createAdminClient();
  const { data: profils } = await admin.from("profiles").select("id, full_name").eq("role", "coach");
  const ids = (profils ?? []).map((p) => p.id);
  if (!ids.length) return [];
  const { data: liens } = await admin
    .from("team_members")
    .select("profile_id, teams (name, archived)")
    .eq("role_in_team", "coach")
    .in("profile_id", ids);

  const equipesDe = new Map<string, string[]>();
  (liens ?? []).forEach((l) => {
    const t = Array.isArray(l.teams) ? l.teams[0] : l.teams;
    if (!t || t.archived) return;
    equipesDe.set(l.profile_id, [...(equipesDe.get(l.profile_id) ?? []), t.name]);
  });

  return (profils ?? [])
    .map((p) => ({ nom: (p.full_name ?? "").trim(), equipes: (equipesDe.get(p.id) ?? []).sort() }))
    .filter((e) => e.nom)
    .sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}
