import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FICHIER = "groupes-equipes.json"; // bucket privé « media » : liste des identifiants d'équipes qui sont en fait des groupes (aucune migration nécessaire)

/**
 * Un groupe est une équipe interne (entraînement, communication, événement spécial…) : elle a ses membres, son agenda, ses messages et ses documents
 * comme une équipe, mais elle n'apparaît jamais sur le site public et ne compte pas dans les effectifs, les statuts ni le pipeline.
 */
export async function chargerGroupes(): Promise<Set<string>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return new Set();
  try {
    const liste = JSON.parse(await data.text());
    return new Set(Array.isArray(liste) ? (liste as string[]) : []);
  } catch {
    return new Set();
  }
}

export async function definirGroupe(teamId: string, estGroupe: boolean) {
  const ids = await chargerGroupes();
  if (estGroupe) ids.add(teamId);
  else ids.delete(teamId);
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify([...ids])], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}
