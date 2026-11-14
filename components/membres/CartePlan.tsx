"use client";

import { useState } from "react";
import { BlocsProgramme, useEtapes, type BlocProgramme } from "@/components/membres/CarteEvenement";

/** Plan d'entraînement en résumé : on le touche pour l'ouvrir. Les étapes cochées sont les mêmes que dans l'agenda. */
export function CartePlan({
  id,
  titre,
  equipe,
  date,
  note,
  blocs,
  profilId,
}: {
  id: string;
  titre: string;
  equipe?: string;
  date?: string | null;
  note?: string | null;
  blocs: BlocProgramme[];
  profilId: string;
}) {
  const [ouvert, setOuvert] = useState(false);
  const { coches, basculerEtape, nbEtapes, nbCochees } = useEtapes(`rof-etapes-${profilId}-${id}`, blocs);
  const progression = nbEtapes ? Math.round((nbCochees / nbEtapes) * 100) : 0;
  const d = date ? new Date(date + "T12:00:00") : null;
  const dateTexte = d && !Number.isNaN(d.getTime()) ? d.toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) : null;

  return (
    <div className={`overflow-hidden rounded-xl border bg-rof-blanc ${ouvert ? "border-rof-poudre/60" : "border-rof-ligne"}`}>
      <button type="button" onClick={() => setOuvert(!ouvert)} aria-expanded={ouvert} className="flex w-full items-stretch gap-3 p-3 text-left active:bg-rof-craie">
        <span aria-hidden="true" className="w-1 shrink-0 rounded-full bg-rof-or" />
        <div className="min-w-0 flex-1 self-center">
          <p className={`font-condensed text-lg font-bold uppercase leading-tight text-rof-texte ${ouvert ? "" : "line-clamp-2"}`}>{titre}</p>
          <p className="truncate text-xs text-rof-gris">
            <span className="font-semibold text-rof-or">{blocs.length} bloc{blocs.length > 1 ? "s" : ""} · {nbEtapes} exercices</span>
            {equipe && <> · {equipe}</>}
            {dateTexte && <> · ajouté le {dateTexte}</>}
          </p>
        </div>
        <span className={`shrink-0 self-center font-condensed text-[11px] font-bold uppercase ${nbCochees === nbEtapes && nbEtapes > 0 ? "text-rof-gazon" : "text-rof-gris"}`}>
          {nbCochees}/{nbEtapes}
        </span>
        <span aria-hidden="true" className={`shrink-0 self-center text-rof-poudre transition-transform ${ouvert ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>
      <div className="h-1 w-full bg-rof-craie" aria-hidden="true">
        <div className={`h-1 ${nbCochees === nbEtapes && nbEtapes > 0 ? "bg-rof-gazon" : "bg-rof-or"}`} style={{ width: `${progression}%` }} />
      </div>
      {ouvert && (
        <div className="border-t border-rof-ligne px-4 pb-4 pt-1">
          {note && <p className="mt-3 whitespace-pre-line text-sm text-rof-texte">{note}</p>}
          <BlocsProgramme blocs={blocs} coches={coches} basculerEtape={basculerEtape} titre={`Exercices · ${nbCochees}/${nbEtapes} faits`} />
        </div>
      )}
    </div>
  );
}
