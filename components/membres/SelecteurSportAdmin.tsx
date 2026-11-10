import { choisirSportAdmin } from "@/app/membres/admin/sport-action";
import type { SportAdmin } from "@/lib/sport-admin";

const CHOIX: { valeur: SportAdmin; label: string }[] = [
  { valeur: "", label: "Tous" },
  { valeur: "softball", label: "Softball" },
  { valeur: "baseball", label: "Baseball" },
];

/** Sélecteur Tous / Softball / Baseball : sépare les deux sports dans la gestion (équipes, joueurs, pipeline). */
export function SelecteurSportAdmin({ actif, retour }: { actif: SportAdmin; retour: string }) {
  return (
    <form action={choisirSportAdmin} role="group" aria-label="Sport affiché dans la gestion" className="inline-flex overflow-hidden rounded-full border border-rof-ligne">
      <input type="hidden" name="retour" value={retour} />
      {CHOIX.map((c) => (
        <button
          key={c.label}
          type="submit"
          name="sport"
          value={c.valeur}
          aria-pressed={actif === c.valeur}
          className={`min-h-10 px-4 font-condensed text-sm font-bold uppercase tracking-wide ${actif === c.valeur ? "bg-rof-or text-white" : "bg-rof-blanc text-rof-gris hover:text-rof-texte"}`}
        >
          {c.label}
        </button>
      ))}
    </form>
  );
}
