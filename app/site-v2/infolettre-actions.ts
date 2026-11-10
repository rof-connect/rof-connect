"use server";

import { ajouterAbonne } from "@/lib/infolettre";

export type EtatInfolettre = { ok: boolean; erreur: string | null; valeur?: string };

/**
 * Inscription du public à l'infolettre (fenêtre d'accueil du site). Le consentement est exprès : l'abonné a rempli le formulaire.
 * Aucun courriel n'est envoyé à la Direction : la liste se consulte dans Direction > Infolettre.
 */
export async function sInscrireInfolettre(_prev: EtatInfolettre, formData: FormData): Promise<EtatInfolettre> {
  // Champ piège invisible : un robot le remplit, une personne non.
  if (String(formData.get("site_web") ?? "").trim()) return { ok: true, erreur: null };

  const courriel = String(formData.get("courriel") ?? "").trim().toLowerCase();
  if (courriel.length > 120 || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(courriel)) {
    return { ok: false, erreur: "Ce courriel ne semble pas valide.", valeur: String(formData.get("courriel") ?? "").trim().slice(0, 120) };
  }
  const sport = String(formData.get("sport") ?? "") === "baseball" ? "baseball" : "softball";

  try {
    await ajouterAbonne({ courriel, sport, date: new Date().toISOString(), source: "site-public" });
  } catch {
    return { ok: false, erreur: "Une erreur est survenue. Réessaie dans un instant.", valeur: courriel };
  }
  return { ok: true, erreur: null };
}
