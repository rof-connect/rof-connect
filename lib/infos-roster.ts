import { normaliserTaille } from "@/lib/taille";
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FICHIER = "infos-roster.json"; // bucket privé « media » : { idJoueuse: { ville, grad } }

export type InfosRoster = { ville?: string; grad?: string; taille?: string; ecole?: string };

export async function chargerInfosRoster(): Promise<Record<string, InfosRoster>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

/** Ville, année de graduation (« grad year », ex. 2027), taille et école saisies par la Direction pour le roster public. */
export async function definirInfosRoster(changements: Record<string, InfosRoster>) {
  const tous = await chargerInfosRoster();
  for (const [id, v] of Object.entries(changements)) {
    const ville = String(v.ville ?? "").trim().slice(0, 60);
    const ecole = String(v.ecole ?? "").trim().slice(0, 80);
    const taille = normaliserTaille(String(v.taille ?? "").trim().slice(0, 12));
    const grad = /^20\d{2}$/.test(String(v.grad ?? "").trim()) ? String(v.grad).trim() : "";
    const nouveau: InfosRoster = { ...(ville ? { ville } : {}), ...(grad ? { grad } : {}), ...(taille ? { taille } : {}), ...(ecole ? { ecole } : {}) };
    if (Object.keys(nouveau).length === 0) delete tous[id];
    else tous[id] = nouveau;
  }
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}
