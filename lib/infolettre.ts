import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const FICHIER = "infolettre.json"; // bucket privé « media » : liste des abonnés à l'infolettre (aucune migration nécessaire)

export type Abonne = { courriel: string; sport: string; date: string; source: string };

export async function chargerAbonnes(): Promise<Abonne[]> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return [];
  try {
    const liste = JSON.parse(await data.text());
    return Array.isArray(liste) ? (liste as Abonne[]) : [];
  } catch {
    return [];
  }
}

async function enregistrer(liste: Abonne[]) {
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(liste)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}

/** Ajoute un abonné (sans doublon). Retourne false si le courriel y était déjà. */
export async function ajouterAbonne(a: Abonne): Promise<boolean> {
  const liste = await chargerAbonnes();
  if (liste.some((x) => x.courriel === a.courriel)) return false;
  liste.push(a);
  await enregistrer(liste);
  return true;
}

export async function retirerAbonne(courriel: string) {
  const liste = await chargerAbonnes();
  await enregistrer(liste.filter((x) => x.courriel !== courriel));
}
