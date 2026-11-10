import type { Sport } from "@/lib/site-v2/donnees";

/** Liens de la barre utilitaire du haut (aussi repris dans le menu mobile, sous les 5 liens principaux). */
export function liensUtilitaires(sport: Sport): { href: string; label: string }[] {
  return [
    { href: "/inscription", label: "Inscription" },
    { href: "/parcours", label: "Questionnaire NCAA" },
    { href: `/site-v2/centre-entrainement?sport=${sport}`, label: "Centre d'entraînement" },
    { href: `/site-v2/organisation?sport=${sport}`, label: "Organisation" },
    { href: `/site-v2/organisation?sport=${sport}#contact`, label: "Nous joindre" },
  ];
}
