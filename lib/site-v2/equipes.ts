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
  /**
   * « bd » : équipes cochées « Visible sur le site » par la Direction.
   * « provisoire » : la migration 0009 n'est pas encore appliquée, on affiche toutes les équipes actives de ROF Connect.
   */
  source: "bd" | "provisoire";
};

/** « Softball 14U — Riley » → « 14U ». Utilisé seulement si la Direction n'a pas saisi de nom public. */
export function nomPublicParDefaut(nom: string) {
  return nom
    .replace(/^(softball|baseball)\s+/i, "")
    .split(/\s+[-—–]\s+/)[0]
    .trim();
}

/** Nom affiché d'une équipe : nom saisi par la Direction, sinon le niveau (+ entraîneur si deux équipes ont le même niveau). */
export function nomAffiche(t: { name: string; nom_public?: string | null }, equipesDuSport: { name: string }[]) {
  const saisi = (t.nom_public ?? "").trim();
  if (saisi) return saisi;
  const niveau = nomPublicParDefaut(t.name);
  const memeNiveau = equipesDuSport.filter((e) => nomPublicParDefaut(e.name) === niveau).length;
  const suffixe = t.name.split(/\s+[-—–]\s+/)[1]?.trim();
  return memeNiveau > 1 && suffixe ? `${niveau} · ${suffixe}` : niveau;
}

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
    // Migration 0009 pas encore appliquée : toutes les équipes actives de ROF Connect (provisoire).
    const { data: actives } = await admin.from("teams").select("id, name, sport").eq("sport", sport).eq("archived", false);
    return { source: "provisoire", equipes: await enrichir((actives ?? []).map((t) => ({ ...t, nom_public: null, description_publique: null, ordre_affichage: null })), admin) };
  }

  return { source: "bd", equipes: await enrichir(data ?? [], admin) };
}

type LigneEquipe = {
  id: string;
  name: string;
  sport: string;
  nom_public: string | null;
  description_publique: string | null;
  ordre_affichage: number | null;
};

async function enrichir(lignes: LigneEquipe[], admin: ReturnType<typeof createAdminClient>): Promise<EquipePublique[]> {
  const liste = [...lignes].sort((a, b) => {
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

  return liste.map((t) => {
    const nom = nomAffiche(t, liste);
    return {
      id: t.id,
      nom,
      description: (t.description_publique ?? "").trim(),
      nb: compte.get(t.id) ?? 0,
      vedette: /varsity/i.test(nom),
    };
  });
}
