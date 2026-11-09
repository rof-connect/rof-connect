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

/** 1er septembre de la saison en cours : le plus récent 1er septembre qui n'est pas dans le futur. */
export function premierSeptembre(now = new Date()) {
  const annee = now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;
  return new Date(annee, 8, 1);
}

/** Statut selon l'âge au 1er septembre de la saison en cours (14 ans = 14U). Entre 9U et 18U. null si la date est invalide. */
export function statutSelonNaissance(naissance: string | null | undefined, now = new Date()): { id: number; nom: string; age: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(naissance ?? "");
  if (!m) return null;
  const ref = premierSeptembre(now);
  let age = ref.getFullYear() - Number(m[1]);
  if (Number(m[2]) > 9 || (Number(m[2]) === 9 && Number(m[3]) > 1)) age--;
  if (age < 0 || age > 60) return null;
  const borne = Math.min(18, Math.max(9, age));
  const statut = STATUTS.find((s) => s.nom === `${borne}U`);
  return statut ? { id: statut.id, nom: statut.nom, age } : null;
}
