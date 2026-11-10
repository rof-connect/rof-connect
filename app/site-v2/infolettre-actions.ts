"use server";

import { ajouterAbonne } from "@/lib/infolettre";
import { envoyerADirection, echapper } from "@/lib/notifier-direction";

export type EtatInfolettre = { ok: boolean; erreur: string | null; valeur?: string };

/** Inscription du public à l'infolettre (fenêtre d'accueil du site). Le consentement est exprès : l'abonné a rempli le formulaire. */
export async function sInscrireInfolettre(_prev: EtatInfolettre, formData: FormData): Promise<EtatInfolettre> {
  // Champ piège invisible : un robot le remplit, une personne non.
  if (String(formData.get("site_web") ?? "").trim()) return { ok: true, erreur: null };

  const courriel = String(formData.get("courriel") ?? "").trim().toLowerCase();
  if (courriel.length > 120 || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]{2,}$/.test(courriel)) {
    return { ok: false, erreur: "Ce courriel ne semble pas valide.", valeur: String(formData.get("courriel") ?? "").trim().slice(0, 120) };
  }
  const sport = String(formData.get("sport") ?? "") === "baseball" ? "baseball" : "softball";

  try {
    const nouveau = await ajouterAbonne({ courriel, sport, date: new Date().toISOString(), source: "site-public" });
    if (nouveau) {
      await envoyerADirection(
        "Nouvelle inscription à l'infolettre",
        `<p style="font-family:Arial,sans-serif"><b>${echapper(courriel)}</b> s'est inscrit à l'infolettre (site ${sport}). La liste est dans Direction &gt; Infolettre.</p>`,
      );
    }
  } catch {
    return { ok: false, erreur: "Une erreur est survenue. Réessaie dans un instant.", valeur: courriel };
  }
  return { ok: true, erreur: null };
}
