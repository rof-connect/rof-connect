import "server-only";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profil } from "@/lib/presentation-format";

/** Réglages de la page de présentation d'une joueuse (publique, accessible seulement par son lien secret). */
export type Presentation = {
  token: string;
  actif: boolean;
  photo: boolean; // afficher la photo de profil
  contact: boolean; // afficher le contact du parent / tuteur
  apropos: string; // court texte de présentation
  profil?: Profil; // fiche de recrutement (taille, mesures, vidéo, calendrier…)
  consentement_le?: string; // date de l'autorisation (parent / tuteur si moins de 18 ans)
};

const FICHIER = "presentations.json"; // bucket privé « media » : un seul fichier pour toutes les joueuses
const nouveauToken = () => randomBytes(16).toString("base64url");

async function lire(): Promise<Record<string, Presentation>> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return {};
  try {
    const obj = JSON.parse(await data.text());
    return obj && typeof obj === "object" ? (obj as Record<string, Presentation>) : {};
  } catch {
    return {};
  }
}

async function ecrire(tous: Record<string, Presentation>) {
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(tous)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}

export async function presentationDe(profileId: string): Promise<Presentation | null> {
  return (await lire())[profileId] ?? null;
}

/** Modifie les réglages (crée le lien secret au premier enregistrement). */
export async function majPresentation(profileId: string, patch: Partial<Omit<Presentation, "token">>) {
  const tous = await lire();
  const actuel = tous[profileId] ?? { token: nouveauToken(), actif: false, photo: true, contact: false, apropos: "" };
  tous[profileId] = { ...actuel, ...patch };
  await ecrire(tous);
}

/** Remplace le lien : l'ancien cesse de fonctionner. */
export async function regenererLien(profileId: string) {
  const tous = await lire();
  if (!tous[profileId]) return;
  tous[profileId].token = nouveauToken();
  await ecrire(tous);
}

/** Retrouve la joueuse d'un lien public (seulement si la page est activée). */
export async function trouverParToken(token: string): Promise<{ profileId: string; reglages: Presentation } | null> {
  if (!/^[A-Za-z0-9_-]{16,40}$/.test(token)) return null;
  const tous = await lire();
  const entree = Object.entries(tous).find(([, p]) => p.token === token && p.actif);
  return entree ? { profileId: entree[0], reglages: entree[1] } : null;
}

/** Réglages des pages activées (consentement donné) : sert au roster public des équipes. */
export async function presentationsActives(): Promise<Record<string, Presentation>> {
  const tous = await lire();
  return Object.fromEntries(Object.entries(tous).filter(([, p]) => p.actif));
}

/** Toutes les fiches (actives ou non) : sert aux infos de base du roster (taille, école, ville, grad), modifiables par la joueuse ou la Direction. */
export async function toutesPresentations(): Promise<Record<string, Presentation>> {
  return lire();
}
