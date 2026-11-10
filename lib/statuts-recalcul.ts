import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { chargerArchivees } from "@/lib/joueuses-archivees";
import { STATUTS, chargerStatutsJoueuses, statutEffectif, statutSelonNaissance } from "@/lib/statuts";

export type Correction = {
  profileId: string;
  nom: string;
  naissance: string;
  age: number;
  actuel: number;
  actuelNom: string;
  nouveau: number;
  nouveauNom: string;
};

export type Recalcul = {
  corrections: Correction[];
  sansNaissance: { profileId: string; nom: string; actuelNom: string }[];
  prospects: number;
  dejaBons: number;
};

const nomStatut = (id: number) => STATUTS.find((s) => s.id === id)?.nom ?? String(id);

/**
 * Compare le statut actuel de chaque joueuse (non archivée) à celui de la charte Little League.
 * Les prospects (statut 1) ne sont jamais touchés : ils restent à accepter un par un.
 * Toujours recalculé côté serveur, au moment d'afficher comme au moment d'appliquer.
 */
export async function calculerRecalcul(): Promise<Recalcul> {
  const admin = createAdminClient();
  const [{ data: comptes }, { data: liens }, { data: fiches }, statuts, archivees] = await Promise.all([
    admin.from("profiles").select("id, full_name, email").eq("role", "member"),
    admin.from("team_members").select("profile_id, status_id, teams!inner (archived)").eq("role_in_team", "athlete").eq("teams.archived", false),
    admin.from("athlete_details").select("profile_id, birth_date"),
    chargerStatutsJoueuses(),
    chargerArchivees(),
  ]);

  const statutsEquipes = new Map<string, number[]>();
  for (const l of liens ?? []) {
    const liste = statutsEquipes.get(l.profile_id) ?? [];
    liste.push(l.status_id);
    statutsEquipes.set(l.profile_id, liste);
  }
  const naissance = new Map((fiches ?? []).map((f) => [f.profile_id, f.birth_date as string | null]));

  const res: Recalcul = { corrections: [], sansNaissance: [], prospects: 0, dejaBons: 0 };
  for (const c of comptes ?? []) {
    if (archivees.has(c.id)) continue;
    const actuel = statutEffectif(c.id, statuts, statutsEquipes.get(c.id) ?? []);
    if (actuel <= 1) {
      res.prospects++;
      continue;
    }
    const nom = c.full_name || c.email || "—";
    const n = naissance.get(c.id);
    const suggere = statutSelonNaissance(n);
    if (!suggere || !n) {
      res.sansNaissance.push({ profileId: c.id, nom, actuelNom: nomStatut(actuel) });
      continue;
    }
    if (suggere.id === actuel) {
      res.dejaBons++;
      continue;
    }
    res.corrections.push({
      profileId: c.id,
      nom,
      naissance: n,
      age: suggere.age,
      actuel,
      actuelNom: nomStatut(actuel),
      nouveau: suggere.id,
      nouveauNom: suggere.nom,
    });
  }
  res.corrections.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  res.sansNaissance.sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
  return res;
}
