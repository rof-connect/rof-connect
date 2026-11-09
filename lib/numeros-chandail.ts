import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FICHIER = "numeros-chandail.json"; // bucket privé « media » : { idJoueuse: "24" }

export async function chargerNumeros(): Promise<Record<string, string>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? obj : {};
  } catch {
    return {};
  }
}

/** Numéro de chandail (0 à 99, texte pour garder « 00 »). Vide = retire le numéro. */
export async function definirNumeros(changements: Record<string, string>) {
  const tous = await chargerNumeros();
  for (const [id, brut] of Object.entries(changements)) {
    const n = String(brut ?? "").trim();
    if (/^\d{1,2}$/.test(n)) tous[id] = n;
    else delete tous[id];
  }
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}
