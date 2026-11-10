import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FICHIER = "sport-joueuses.json"; // bucket privé « media » : { idJoueuse: "baseball" | "softball" } (aucune migration nécessaire)

export type SportJoueuse = "baseball" | "softball";

/**
 * Sport de chaque joueuse, choisi par la Direction. Il prime sur le sport de ses équipes et permet de classer une joueuse
 * qui n'a pas encore d'équipe (sans lui, une joueuse sans équipe apparaît dans les deux sports).
 */
export async function chargerSportsJoueuses(): Promise<Record<string, SportJoueuse>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

/** Définit le sport d'une joueuse ; « » retire le choix (retour au sport de ses équipes). */
export async function definirSportJoueuse(profileId: string, sport: string) {
  const tous = await chargerSportsJoueuses();
  if (sport === "baseball" || sport === "softball") tous[profileId] = sport;
  else delete tous[profileId];
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}
