"use client";

import { useActionState, useEffect, useRef } from "react";
import { ajouterJoueuse } from "@/app/membres/famille/actions";

const initial = { ok: false, erreur: null as string | null };

export function FormAjouterJoueuse({ libelles }: { libelles: { titre: string; nom: string; naissance: string; bouton: string; ok: string } }) {
  const ref = useRef<HTMLFormElement>(null);
  const [etat, action, enCours] = useActionState(ajouterJoueuse, initial);
  useEffect(() => {
    if (etat.ok) ref.current?.reset();
  }, [etat]);

  const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte";
  return (
    <details className="mt-6 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
      <summary className="cursor-pointer font-condensed text-base font-bold uppercase tracking-wide text-rof-texte">
        + {libelles.titre}
      </summary>
      <form ref={ref} action={action} className="mt-3 flex flex-col gap-3">
        <input name="full_name" required placeholder={libelles.nom} className={champ} />
        <label className="text-xs font-semibold uppercase tracking-wide text-rof-gris">
          {libelles.naissance}
          <input name="birth_date" type="date" className={champ + " mt-1"} />
        </label>
        {etat.erreur && <p className="text-sm text-rof-rouge">{etat.erreur}</p>}
        {etat.ok && <p className="text-sm text-rof-gazon">{libelles.ok}</p>}
        <button
          type="submit"
          disabled={enCours}
          className="w-fit rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {libelles.bouton}
        </button>
      </form>
    </details>
  );
}
