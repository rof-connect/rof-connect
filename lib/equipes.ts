// Ordre d'affichage des équipes : celui de la Direction, puis par âge décroissant pour les autres.
const ORDRE = ["18U - Di Peco", "16U - Bertrand", "16U - Dostaler", "14U", "14U - Riley", "12U - Peley", "12U - Boisclair", "10U - Puga"];

const cle = (nom: string) => nom.replace(/^(softball|baseball)\s+/i, "").trim();
const age = (nom: string) => Number(/(\d{1,2})\s*U/i.exec(nom)?.[1] ?? 0);

export function comparerEquipes(a: { name: string; sport?: string }, b: { name: string; sport?: string }) {
  if (a.sport && b.sport && a.sport !== b.sport) return a.sport.localeCompare(b.sport);
  const ia = ORDRE.indexOf(cle(a.name));
  const ib = ORDRE.indexOf(cle(b.name));
  if (ia !== -1 && ib !== -1) return ia - ib;
  if (ia !== -1) return -1;
  if (ib !== -1) return 1;
  const diff = age(b.name) - age(a.name);
  return diff !== 0 ? diff : a.name.localeCompare(b.name);
}

export function trierEquipes<T extends { name: string; sport?: string }>(equipes: T[] | null | undefined): T[] {
  return [...(equipes ?? [])].sort(comparerEquipes);
}
