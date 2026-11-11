/**
 * Protection des formulaires publics (inscription) contre les robots à pourriel.
 * Les robots s'en servent pour faire envoyer leurs liens par nos courriels à la Direction.
 */

/** Nom du champ piège : invisible pour une personne, rempli par les robots qui remplissent tout. */
export const CHAMP_PIEGE = "site_web";

const LIEN = /(https?:|www\.|:\/\/|\/\/|[a-z0-9-]\.[a-z]{2,}\/|\.(ly|gl|me|co|ca|fr|us|uk|de)\/|\.(com|net|org|ru|cn|xyz|top|info|io|link|click|shop|site|online|biz)\b)/i;
const SYMBOLES = /[<>{}[\]|\\$@#%*=_^~`]/;
const PUB = /\b(promo|promocode|free\s*code|bitcoin|crypto|casino|bonus|giveaway|prize|winner|dollars?|usdt|airdrop|viagra|loan)\b/i;
const EMOJI = /\p{Extended_Pictographic}/u;

/** Vrai si le champ piège a été rempli (robot). */
export function piegeRempli(formData: FormData) {
  return String(formData.get(CHAMP_PIEGE) ?? "").trim() !== "";
}

/** Vrai si un nom de personne ressemble à du pourriel : lien, symboles, pub, émoji ou trop long. */
export function nomSuspect(valeur: string, max = 80) {
  const v = valeur.trim();
  if (!v) return false;
  return v.length > max || LIEN.test(v) || SYMBOLES.test(v) || PUB.test(v) || EMOJI.test(v);
}

/** Version sans lien, pour un objet de courriel (au cas où). */
export function sansLien(valeur: string) {
  return valeur.replace(/\S*(https?:|www\.|:\/\/)\S*/gi, "[lien retiré]").slice(0, 120);
}
