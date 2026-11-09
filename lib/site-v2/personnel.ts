import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Sport } from "./donnees";

export type Entraineur = { nom: string; equipes: string[] };

/** Direction affichée sur le site (nom et titre). Une même personne peut aussi figurer parmi les entraîneurs. */
export const DIRECTION_SITE: { nom: string; role: string }[] = [
  { nom: "Nicholas Di Peco", role: "Directeur Excellence" },
  { nom: "Eric Dostaler", role: "Directeur Administratif" },
  { nom: "François Martel", role: "Directeur Financier" },
];

/** Membres de la direction qui sont aussi entraîneurs (leur compte ROF Connect est « Direction », pas « entraîneur »). */
const ENTRAINEURS_DIRECTION: { nom: string; sport: Sport; equipes: string[] }[] = [{ nom: "Eric Dostaler", sport: "softball", equipes: ["16U - Dostaler"] }];

/** Sport d'un entraîneur qui n'a pas encore d'équipe (équipe à venir). */
const SPORT_SANS_EQUIPE: Record<string, Sport> = {
  "Pierre-Luc Ouellet": "baseball",
  "Jonathan Dionne": "softball",
};

const sansSport = (nom: string) => nom.replace(/^(softball|baseball)\s+/i, "").trim();

/**
 * Entraîneurs d'un sport : les comptes « entraîneur » de ROF Connect avec leurs équipes actives de ce sport.
 * Seuls le nom et les équipes sont lus (jamais courriel ni téléphone).
 */
export async function chargerEntraineurs(sport: Sport): Promise<Entraineur[]> {
  const admin = createAdminClient();
  const { data: profils } = await admin.from("profiles").select("id, full_name").eq("role", "coach");
  const ids = (profils ?? []).map((p) => p.id);
  const resultat: Entraineur[] = [];

  if (ids.length) {
    const { data: liens } = await admin
      .from("team_members")
      .select("profile_id, teams (name, sport, archived)")
      .eq("role_in_team", "coach")
      .in("profile_id", ids);

    const parPersonne = new Map<string, { sport: string; nom: string }[]>();
    (liens ?? []).forEach((l) => {
      const t = Array.isArray(l.teams) ? l.teams[0] : l.teams;
      if (!t || t.archived) return;
      parPersonne.set(l.profile_id, [...(parPersonne.get(l.profile_id) ?? []), { sport: t.sport, nom: t.name }]);
    });

    for (const p of profils ?? []) {
      const nom = (p.full_name ?? "").trim();
      if (!nom) continue;
      const equipes = parPersonne.get(p.id) ?? [];
      const duSport = equipes.filter((e) => e.sport === sport).map((e) => sansSport(e.nom)).sort();
      if (duSport.length) resultat.push({ nom, equipes: duSport });
      else if (!equipes.length && (SPORT_SANS_EQUIPE[nom] ?? "softball") === sport) resultat.push({ nom, equipes: [] });
    }
  }

  ENTRAINEURS_DIRECTION.filter((e) => e.sport === sport).forEach((e) => resultat.push({ nom: e.nom, equipes: e.equipes }));
  return resultat.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}
