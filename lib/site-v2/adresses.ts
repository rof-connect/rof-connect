import type { Sport } from "@/lib/site-v2/donnees";

/**
 * Adresses finales du site public. Le baseball vit sur /baseball ; l'accueil softball est « / » sur royalonfield.ca
 * (l'ancienne adresse /site-v2 y redirige, voir next.config.ts).
 */
export const accueilHref = (sport: Sport) => (sport === "baseball" ? "/baseball" : "/site-v2");
