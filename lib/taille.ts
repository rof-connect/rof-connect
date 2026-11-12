/**
 * Format unique de la taille : 5'4" (pieds et pouces).
 * Accepte 5'3, 5’3, 5”4, 5'4", 4'00', « 5 pi 4 »… ; une taille en centimètres (173 cm) ou non reconnue est conservée telle quelle.
 */
export function normaliserTaille(brut: string | null | undefined): string {
  const s = (brut ?? "").trim();
  if (!s) return "";
  const m = /^([3-7])\s*(?:['’′´`"”″]|pi(?:eds?)?|ft)\s*(\d{1,2})?\s*(?:po(?:uces?)?|in)?\s*['’′´`"”″]*$/i.exec(s);
  if (!m) return s;
  const pouces = Number(m[2] ?? 0);
  if (pouces > 11) return s;
  return `${m[1]}'${pouces}"`;
}
