import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { comparerEquipes } from "@/lib/equipes";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { chargerStatutsJoueuses, statutEffectif } from "@/lib/statuts";
import { NIVEAU_COMPETITION_PROVISOIRE, ORDRE_PUBLIC, GAMECHANGER_LIEN_PROVISOIRE, GAMECHANGER_PROVISOIRE, ROSTER_PROVISOIRE, idGameChanger, lienGameChanger, type Sport } from "./donnees";

export type EquipePublique = {
  id: string;
  nom: string; // nom affiché (« 14U », « Varsity »…)
  description: string;
  nb: number | null; // nombre de joueuses/joueurs, calculé depuis ROF Connect
  vedette: boolean;
  categorie: string; // niveau de compétition (softball : NATIONAL, RÉGIONAL, ÉLITE), vide si aucun
  matchs: boolean; // calendrier GameChanger disponible (widget ou lien)
  roster: boolean; // la Direction autorise l'affichage du roster (par défaut : oui)
};

export type ResultatEquipes = {
  equipes: EquipePublique[];
  /** Joueuses inscrites à l'application dans ces équipes, chacune comptée une seule fois. */
  joueuses: number;
  /**
   * « bd » : équipes cochées « Visible sur le site » par la Direction.
   * « provisoire » : la migration 0009 n'est pas encore appliquée, on affiche toutes les équipes actives de ROF Connect.
   */
  source: "bd" | "provisoire";
};

/** « Softball 18U - Di Peco » → « 18U Di Peco ». Utilisé seulement si la Direction n'a pas saisi de nom affiché. */
export function nomPublicParDefaut(nom: string) {
  return nom.replace(/^(softball|baseball)\s+/i, "").replace(/\s+[-—–]\s+/g, " ").trim();
}

/** Nom affiché d'une équipe : nom saisi par la Direction, sinon le nom dans ROF Connect sans le sport (ex. « 18U - Di Peco »). */
export function nomAffiche(t: { name: string; nom_public?: string | null }) {
  return (t.nom_public ?? "").trim() || nomPublicParDefaut(t.name);
}

/** Équipes visibles sur le site public, décidées par la Direction dans ROF Connect. */
export async function chargerEquipesPubliques(sport: Sport): Promise<ResultatEquipes> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("teams")
    .select("id, name, sport, nom_public, description_publique, ordre_affichage, roster_public, gamechanger_widget_id, gamechanger_url, niveau_competition")
    .eq("sport", sport)
    .eq("visible_public", true)
    .eq("archived", false);

  if (error) {
    // Migration 0009 pas encore appliquée : toutes les équipes actives de ROF Connect (provisoire).
    const { data: actives } = await admin.from("teams").select("id, name, sport").eq("sport", sport).eq("archived", false);
    const e = await enrichir((actives ?? []).map((t) => ({ ...t, nom_public: null, description_publique: null, ordre_affichage: null, roster_public: ROSTER_PROVISOIRE.includes(nomPublicParDefaut(t.name)) })), admin);
    return { source: "provisoire", equipes: e.equipes, joueuses: e.joueuses };
  }

  const e = await enrichir(data ?? [], admin);
  return { source: "bd", equipes: e.equipes, joueuses: e.joueuses };
}

type LigneEquipe = {
  id: string;
  name: string;
  sport: string;
  nom_public: string | null;
  description_publique: string | null;
  ordre_affichage: number | null;
  roster_public?: boolean | null;
  gamechanger_widget_id?: string | null;
  gamechanger_url?: string | null;
  niveau_competition?: string | null;
};

async function enrichir(lignes: LigneEquipe[], admin: ReturnType<typeof createAdminClient>): Promise<{ equipes: EquipePublique[]; joueuses: number }> {
  const liste = [...lignes].sort((a, b) => {
    const oa = a.ordre_affichage ?? Number.MAX_SAFE_INTEGER;
    const ob = b.ordre_affichage ?? Number.MAX_SAFE_INTEGER;
    if (oa !== ob) return oa - ob;
    // Ordre par défaut propre au sport (ex. baseball : 8U → Prep School), sinon tri habituel.
    const ordre = ORDRE_PUBLIC[a.sport as Sport] ?? [];
    const ia = ordre.indexOf(nomPublicParDefaut(a.name));
    const ib = ordre.indexOf(nomPublicParDefaut(b.name));
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return comparerEquipes(a, b);
  });

  // Nombre d'athlètes par équipe (sans les joueuses archivées). Aucun nom ni donnée personnelle n'est lu.
  const ids = liste.map((t) => t.id);
  const compte = new Map<string, number>();
  const uniques = new Set<string>();
  if (ids.length) {
    const [{ data: membres }, archivees, statuts] = await Promise.all([
      admin.from("team_members").select("team_id, profile_id, status_id").eq("role_in_team", "athlete").in("team_id", ids),
      chargerArchivees(),
      chargerStatutsJoueuses(),
    ]);
    (membres ?? []).forEach((m) => {
      // Seules les joueuses acceptées par la Direction (statut autre que Prospect) sont comptées.
      if (archivees.has(m.profile_id) || statutEffectif(m.profile_id, statuts, [m.status_id]) <= 1) return;
      compte.set(m.team_id, (compte.get(m.team_id) ?? 0) + 1);
      uniques.add(m.profile_id);
    });
  }

  const equipes = liste.map((t) => {
    const nom = nomAffiche(t);
    return {
      id: t.id,
      nom,
      description: (t.description_publique ?? "").trim(),
      nb: compte.get(t.id) ?? 0,
      vedette: /varsity/i.test(nom),
      roster: t.roster_public !== false,
      categorie: ((t.niveau_competition ?? "").trim() || NIVEAU_COMPETITION_PROVISOIRE[nomPublicParDefaut(t.name)] || "").slice(0, 30),
      matchs: Boolean(
        idGameChanger(t.gamechanger_widget_id) ||
          lienGameChanger(t.gamechanger_url) ||
          idGameChanger(GAMECHANGER_PROVISOIRE[nomPublicParDefaut(t.name)]) ||
          lienGameChanger(GAMECHANGER_LIEN_PROVISOIRE[nomPublicParDefaut(t.name)]),
      ),
    };
  });
  return { equipes, joueuses: uniques.size };
}
