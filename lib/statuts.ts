import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const STATUTS = [
  { id: 1, nom: "Prospect" },
  { id: 2, nom: "9U" },
  { id: 3, nom: "10U" },
  { id: 4, nom: "11U" },
  { id: 5, nom: "12U" },
  { id: 6, nom: "13U" },
  { id: 7, nom: "14U" },
  { id: 8, nom: "15U" },
  { id: 9, nom: "16U" },
  { id: 10, nom: "17U" },
  { id: 11, nom: "18U" },
];

const FICHIER = "statuts-joueuses.json"; // bucket privé « media » : { idJoueuse: idStatut }

/** Statut propre à la joueuse, indépendant de ses équipes (permet un statut même sans équipe). */
export async function chargerStatutsJoueuses(): Promise<Record<string, number>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

/**
 * Définit le statut de la joueuse. Il est conservé à son nom et recopié sur chacune de ses équipes
 * (les accès aux documents et les effectifs lisent le statut de l'équipe).
 */
export async function definirStatutJoueuse(profileId: string, statusId: number) {
  const admin = createAdminClient();
  const tous = await chargerStatutsJoueuses();
  tous[profileId] = statusId;
  await admin
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
  await admin.from("team_members").update({ status_id: statusId }).eq("profile_id", profileId).eq("role_in_team", "athlete");
}

/** Statut effectif : celui de la joueuse, sinon le plus élevé de ses équipes, sinon Prospect. */
export function statutEffectif(profileId: string, statuts: Record<string, number>, statutsEquipes: number[] = []) {
  return statuts[profileId] ?? (statutsEquipes.length ? Math.max(...statutsEquipes) : 1);
}
