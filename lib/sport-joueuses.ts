import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FICHIER = "sport-joueuses.json"; // bucket privé « media » : { idJoueuse: "baseball" | "softball" } (aucune migration nécessaire)

export type SportJoueuse = "baseball" | "softball";

/**
 * Sport de chaque joueuse, choisi par la Direction. Il prime sur le sport de ses équipes et permet de classer une joueuse
 * qui n'a pas encore d'équipe (sans lui, une joueuse sans équipe apparaît dans les deux sports).
 */
export async function chargerSportsJoueuses(): Promise<Record<string, SportJoueuse>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

/** Définit le sport d'une joueuse ; « » retire le choix (retour au sport de ses équipes). */
export async function definirSportJoueuse(profileId: string, sport: string) {
  const tous = await chargerSportsJoueuses();
  if (sport === "baseball" || sport === "softball") tous[profileId] = sport;
  else delete tous[profileId];
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}

/**
 * Garde-fou : une joueuse de softball ne peut pas être ajoutée à une équipe ou à un groupe de baseball, et inversement.
 * Retourne un message d'erreur si c'est incompatible, sinon null. Si la joueuse n'avait pas encore de sport, celui de l'équipe devient le sien.
 */
export async function verifierSportEquipe(profileId: string, teamId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data: equipe } = await admin.from("teams").select("sport").eq("id", teamId).maybeSingle();
  const sportEquipe = equipe?.sport as SportJoueuse | undefined;
  if (sportEquipe !== "baseball" && sportEquipe !== "softball") return null;

  const sports = await chargerSportsJoueuses();
  let sportJoueuse: string | undefined = sports[profileId];
  if (!sportJoueuse) {
    const { data: liens } = await admin.from("team_members").select("teams(sport, archived)").eq("profile_id", profileId).eq("role_in_team", "athlete");
    const deLeurs = new Set<string>();
    (liens ?? []).forEach((l) => {
      const t = Array.isArray(l.teams) ? l.teams[0] : l.teams;
      if (t && !t.archived) deLeurs.add(t.sport);
    });
    if (deLeurs.size > 0 && !deLeurs.has(sportEquipe)) sportJoueuse = [...deLeurs][0];
  }
  if (sportJoueuse && sportJoueuse !== sportEquipe) {
    const nom = (s: string) => (s === "baseball" ? "baseball" : "softball");
    return `Cette joueuse est en ${nom(sportJoueuse)} : elle ne peut pas être ajoutée à une équipe de ${nom(sportEquipe)}.`;
  }
  if (!sports[profileId]) await definirSportJoueuse(profileId, sportEquipe);
  return null;
}

/** Sport effectif d'une joueuse (celui choisi, sinon celui de ses équipes) : sert à filtrer les listes d'équipes proposées. */
export function sportEffectif(profileId: string, sports: Record<string, string>, sportsEquipes: string[]): string | null {
  return sports[profileId] ?? (sportsEquipes.length ? sportsEquipes[0] : null);
}

/** Sport servant à choisir la charte d'âge : celui de la joueuse, sinon celui de ses équipes, sinon softball. */
export function sportPourAge(profileId: string, sports: Record<string, string>, sportsEquipes: string[] = []): "softball" | "baseball" {
  const v = sports[profileId] ?? sportsEquipes[0];
  return v === "baseball" ? "baseball" : "softball";
}
