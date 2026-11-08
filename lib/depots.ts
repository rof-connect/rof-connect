import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** Dépôt de 500 $ des joueuses de softball : absent = en attente, « envoye » = signalé par la joueuse, « recu » = confirmé par la Direction. */
export type EtatDepot = "envoye" | "recu";
export const MONTANT_DEPOT = 500;

const FICHIER = "depots.json"; // bucket privé « media » : un seul fichier pour toutes les joueuses

export async function chargerDepots(): Promise<Record<string, EtatDepot>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? (obj as Record<string, EtatDepot>) : {};
  } catch {
    return {};
  }
}

export async function definirDepot(profileId: string, etat: EtatDepot | null) {
  const tous = await chargerDepots();
  if (etat) tous[profileId] = etat;
  else delete tous[profileId];
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}

/** Une joueuse doit le dépôt dès qu'elle est dans une équipe de softball avec un statut autre que Prospect. */
export function doitDepot(memberships: { role_in_team: string; status_id: number; sport?: string | null }[]) {
  return memberships.some((m) => m.role_in_team === "athlete" && m.status_id > 1 && m.sport === "softball");
}
