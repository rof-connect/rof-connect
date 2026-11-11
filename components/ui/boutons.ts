/**
 * Style unique des boutons de ROF Connect (pastilles arrondies, gros toucher, effet d'appui).
 * Utilisable sur <button>, <Link> et <a> : className={bouton("primaire")}.
 */
export type VarianteBouton = "primaire" | "accent" | "secondaire" | "neutre" | "danger" | "succes";
export type TailleBouton = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full font-condensed font-bold uppercase tracking-wide " +
  "transition-colors active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 select-none";

const TAILLES: Record<TailleBouton, string> = {
  sm: "min-h-8 px-3 py-1.5 text-xs",
  md: "min-h-10 px-4 py-2 text-sm",
  lg: "min-h-12 px-6 py-3 text-base",
};

const VARIANTES: Record<VarianteBouton, string> = {
  primaire: "bg-rof-or text-black hover:bg-rof-or-fonce",
  accent: "bg-rof-royal text-white hover:bg-rof-royal-sombre",
  secondaire: "border border-rof-poudre/60 bg-rof-royal-sombre/40 text-rof-poudre hover:border-rof-poudre hover:bg-rof-royal-sombre",
  neutre: "border border-rof-ligne bg-rof-craie text-rof-texte hover:border-rof-gris",
  danger: "border border-rof-rouge/60 text-rof-rouge hover:bg-rof-rouge hover:text-white",
  succes: "border border-rof-gazon/60 text-rof-gazon hover:bg-rof-gazon hover:text-black",
};

export function bouton(variante: VarianteBouton = "secondaire", taille: TailleBouton = "sm") {
  return `${BASE} ${TAILLES[taille]} ${VARIANTES[variante]}`;
}
