import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { comparerEquipes } from "@/lib/equipes";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import type { Sport } from "./donnees";

export type EquipePublique = {
  id: string;
  nom: string; // nom affiché (« 14U », « Varsity »…)
  description: string;
  nb: number | null; // nombre de joueuses/joueurs, calculé depuis ROF Connect
  vedette: boolean;
};

export type ResultatEquipes = {
  equipes: EquipePublique[];
  /** « bd » : lu dans ROF Connect. « apercu » : la migration 0009 n'est pas encore appliquée, exemples temporaires. */
  source: "bd" | "apercu";
};

/** « Softball 14U — Riley » → « 14U ». Utilisé seulement si la Direction n'a pas saisi de nom public. */
export function nomPublicParDefaut(nom: string) {
  return nom
    .replace(/^(softball|baseball)\s+/i, "")
    .split(/\s+[-—–]\s+/)[0]
    .trim();
}

// Exemples affichés UNIQUEMENT tant que la migration 0009 n'est pas appliquée (aperçu avant mise en ligne).
const APERCU: Record<Sport, { nom: string; description: string }[]> = {
  softball: [
    { nom: "Varsity", description: "Le sommet du programme : vitrine aux recruteurs universitaires américains." },
    { nom: "JV", description: "Transition vers le niveau collégial, tournois aux États-Unis." },
    { nom: "14U", description: "Championne canadienne 2024 · 2025 · 2026." },
    { nom: "12U", description: "Championne canadienne 2024 · 2025 · 2026." },
    { nom: "10U", description: "Les fondations : technique, plaisir et compétition." },
  ],
  baseball: [
    { nom: "Varsity", description: "Le niveau vitrine du programme baseball." },
    { nom: "16U", description: "Préparation au niveau collégial." },
    { nom: "14U", description: "Développement élite et compétition provinciale." },
    { nom: "13U", description: "Transition vers le grand terrain." },
    { nom: "12U", description: "Little League — le chemin vers les championnats." },
    { nom: "11U", description: "Fondamentaux et compétition." },
    { nom: "10U", description: "Les premiers pas dans le standard Royal." },
  ],
};

/** Équipes visibles sur le site public, décidées par la Direction dans ROF Connect. */
export async function chargerEquipesPubliques(sport: Sport): Promise<ResultatEquipes> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("teams")
    .select("id, name, sport, nom_public, description_publique, ordre_affichage")
    .eq("sport", sport)
    .eq("visible_public", true)
    .eq("archived", false);

  if (error) {
    // Colonnes absentes (migration pas encore appliquée) : aperçu temporaire.
    return {
      source: "apercu",
      equipes: APERCU[sport].map((e, i) => ({ id: `apercu-${i}`, ...e, nb: null, vedette: /varsity/i.test(e.nom) })),
    };
  }

  const liste = [...(data ?? [])].sort((a, b) => {
    const oa = a.ordre_affichage ?? Number.MAX_SAFE_INTEGER;
    const ob = b.ordre_affichage ?? Number.MAX_SAFE_INTEGER;
    return oa !== ob ? oa - ob : comparerEquipes(a, b);
  });

  // Nombre d'athlètes par équipe (sans les joueuses archivées). Aucun nom ni donnée personnelle n'est lu.
  const ids = liste.map((t) => t.id);
  const compte = new Map<string, number>();
  if (ids.length) {
    const [{ data: membres }, archivees] = await Promise.all([
      admin.from("team_members").select("team_id, profile_id").eq("role_in_team", "athlete").in("team_id", ids),
      chargerArchivees(),
    ]);
    (membres ?? []).forEach((m) => {
      if (!archivees.has(m.profile_id)) compte.set(m.team_id, (compte.get(m.team_id) ?? 0) + 1);
    });
  }

  return {
    source: "bd",
    equipes: liste.map((t) => {
      const nom = (t.nom_public ?? "").trim() || nomPublicParDefaut(t.name);
      return {
        id: t.id,
        nom,
        description: (t.description_publique ?? "").trim(),
        nb: compte.get(t.id) ?? 0,
        vedette: /varsity/i.test(nom),
      };
    }),
  };
}
