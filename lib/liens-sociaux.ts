import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Liens = { instagram: string; youtube: string; x: string };
export const RESEAUX = ["instagram", "youtube", "x"] as const;
export type Reseau = (typeof RESEAUX)[number];

const FICHIER = "liens-sociaux.json"; // bucket privé « media » : un seul fichier pour toutes les joueuses
const HOTES: Record<Reseau, string[]> = {
  instagram: ["instagram.com"],
  youtube: ["youtube.com", "youtu.be"],
  x: ["x.com", "twitter.com"],
};
const MODELE: Record<Reseau, (h: string) => string> = {
  instagram: (h) => `https://www.instagram.com/${h}`,
  youtube: (h) => `https://www.youtube.com/@${h}`,
  x: (h) => `https://x.com/${h}`,
};

/** Accepte une adresse complète ou un nom d'utilisateur (@nom). Retourne "" si invalide ou d'un autre site. */
export function normaliserLien(reseau: Reseau, brut: unknown): string {
  let v = String(brut ?? "").trim().slice(0, 200);
  if (!v) return "";
  if (/^@?[A-Za-z0-9._]{1,30}$/.test(v)) return MODELE[reseau](v.replace(/^@/, ""));
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try {
    const u = new URL(v);
    const hote = u.hostname.toLowerCase().replace(/^(www|m)\./, "");
    if (!HOTES[reseau].some((h) => hote === h)) return "";
    u.protocol = "https:";
    u.username = "";
    u.password = "";
    return u.toString();
  } catch {
    return "";
  }
}

export function liensDuFormulaire(formData: FormData): Liens {
  return {
    instagram: normaliserLien("instagram", formData.get("instagram")),
    youtube: normaliserLien("youtube", formData.get("youtube")),
    x: normaliserLien("x", formData.get("x")),
  };
}

export async function chargerTousLiens(): Promise<Record<string, Liens>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? (obj as Record<string, Liens>) : {};
  } catch {
    return {};
  }
}

export async function liensDe(profileId: string): Promise<Liens> {
  const l = (await chargerTousLiens())[profileId];
  return { instagram: l?.instagram ?? "", youtube: l?.youtube ?? "", x: l?.x ?? "" };
}

export async function definirLiens(profileId: string, liens: Liens) {
  const tous = await chargerTousLiens();
  if (liens.instagram || liens.youtube || liens.x) tous[profileId] = liens;
  else delete tous[profileId];
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}
