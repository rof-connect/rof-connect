import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FICHIER = "photos-equipes.json"; // bucket privé « media » : { idEquipe: chemin de la photo } (aucune migration nécessaire)

export async function chargerPhotosEquipes(): Promise<Record<string, string>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

export async function definirPhotoEquipe(teamId: string, chemin: string | null) {
  const tous = await chargerPhotosEquipes();
  const ancien = tous[teamId];
  if (chemin) tous[teamId] = chemin;
  else delete tous[teamId];
  const admin = createAdminClient();
  await admin.storage.from("media").upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
  if (ancien && ancien !== chemin) await admin.storage.from("media").remove([ancien]);
}

/** Adresses temporaires (24 h) des photos d'équipe. La page publique est générée à chaque visite, donc elles sont toujours fraîches. */
export async function urlsPhotosEquipes(ids: string[]): Promise<Map<string, string>> {
  const res = new Map<string, string>();
  const tous = await chargerPhotosEquipes();
  const admin = createAdminClient();
  await Promise.all(
    ids
      .filter((id) => tous[id])
      .map(async (id) => {
        const { data } = await admin.storage.from("media").createSignedUrl(tous[id], 60 * 60 * 24);
        if (data?.signedUrl) res.set(id, data.signedUrl);
      }),
  );
  return res;
}
