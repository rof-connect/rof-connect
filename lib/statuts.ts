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

/**
 * Définit le statut de plusieurs joueuses d'un coup (une seule écriture du fichier de statuts).
 * Même effet que definirStatutJoueuse pour chacune : statut à son nom + recopié sur ses équipes.
 */
export async function definirStatutsJoueuses(changements: Record<string, number>) {
  const ids = Object.keys(changements);
  if (!ids.length) return;
  const admin = createAdminClient();
  const tous = await chargerStatutsJoueuses();
  Object.assign(tous, changements);
  await admin
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
  for (const id of ids) {
    await admin.from("team_members").update({ status_id: changements[id] }).eq("profile_id", id).eq("role_in_team", "athlete");
  }
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

/**
 * Date à laquelle l'âge est calculé, pour le baseball ET le softball (choix de la Direction) :
 * charte d'âge Little League — âge au 31 août de l'année du printemps
 * (saisons Automne 2026 et Printemps 2027 → 31 août 2027).
 */
export function dateReferenceAge(now = new Date()) {
  return new Date(premierSeptembre(now).getFullYear() + 1, 7, 31);
}

/** Statut selon l'âge à la date de référence (12 ans = 12U). Entre 9U et 18U. null si la date est invalide. */
export function statutSelonNaissance(
  naissance: string | null | undefined,
  now = new Date(),
): { id: number; nom: string; age: number; ref: Date } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(naissance ?? "");
  if (!m) return null;
  const ref = dateReferenceAge(now);
  const moisRef = ref.getMonth() + 1;
  const jourRef = ref.getDate();
  let age = ref.getFullYear() - Number(m[1]);
  if (Number(m[2]) > moisRef || (Number(m[2]) === moisRef && Number(m[3]) > jourRef)) age--;
  if (age < 0 || age > 60) return null;
  const borne = Math.min(18, Math.max(9, age));
  const statut = STATUTS.find((s) => s.nom === `${borne}U`);
  return statut ? { id: statut.id, nom: statut.nom, age, ref } : null;
}

/** Le parcours NCAA n'est offert qu'aux joueuses dont le statut n'est plus Prospect. */
export async function parcoursOuvert(profileId: string): Promise<boolean> {
  const admin = createAdminClient();
  const [statuts, { data }] = await Promise.all([
    chargerStatutsJoueuses(),
    admin.from("team_members").select("status_id").eq("profile_id", profileId).eq("role_in_team", "athlete"),
  ]);
  return statutEffectif(profileId, statuts, (data ?? []).map((d) => d.status_id)) > 1;
}
