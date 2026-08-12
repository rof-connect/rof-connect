"use client";

import { useState } from "react";
import { repondre, supprimerEvenement } from "@/app/membres/agenda/actions";

const TYPES_EVENEMENT: Record<string, string> = {
  Pratique: "bg-emerald-100 text-emerald-800",
  Match: "bg-blue-100 text-blue-800",
  Tournoi: "bg-amber-100 text-amber-800",
  Autre: "bg-gray-200 text-gray-700",
};

type Athlete = { id: string; nom: string };

export function CarteEvenement({
  id,
  titre,
  type,
  date,
  heure,
  lieu,
  note,
  maReponse,
  peutEditer,
  presents,
  absents,
  sansReponse,
}: {
  id: string;
  titre: string;
  type: string;
  date: string;
  heure: string | null;
  lieu: string | null;
  note: string | null;
  maReponse: "yes" | "no" | null;
  peutEditer: boolean;
  presents: Athlete[];
  absents: Athlete[];
  sansReponse: Athlete[];
}) {
  const [voirListe, setVoirListe] = useState(false);
  const badge = TYPES_EVENEMENT[type] ?? TYPES_EVENEMENT.Autre;

  const dateAffichee = (() => {
    try {
      return new Date(date + "T12:00:00").toLocaleDateString("fr-CA", {
        weekday: "long",
        day: "numeric",
        month: "long",
      });
    } catch {
      return date;
    }
  })();

  return (
    <div className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2 py-0.5 font-condensed text-xs font-bold uppercase tracking-wide ${badge}`}>
          {type || "Autre"}
        </span>
      </div>
      <div className="mt-1 font-condensed text-xl font-bold uppercase leading-tight text-white">{titre}</div>
      <div className="mt-0.5 text-sm capitalize text-rof-texte">
        {dateAffichee}
        {heure ? ` · ${heure}` : ""}
      </div>
      {lieu && <div className="text-sm text-rof-gris">📍 {lieu}</div>}
      {note && <p className="mt-2 text-sm text-rof-texte">{note}</p>}

      <div className="mt-3 flex items-center gap-2">
        <form action={repondre}>
          <input type="hidden" name="content_id" value={id} />
          <input type="hidden" name="response" value="yes" />
          <button
            type="submit"
            className={`flex-1 rounded-lg px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wider ${
              maReponse === "yes" ? "bg-rof-gazon text-white" : "bg-rof-craie text-rof-gris"
            }`}
          >
            ✓ Présent·e
          </button>
        </form>
        <form action={repondre}>
          <input type="hidden" name="content_id" value={id} />
          <input type="hidden" name="response" value="no" />
          <button
            type="submit"
            className={`flex-1 rounded-lg px-4 py-2.5 font-condensed text-sm font-bold uppercase tracking-wider ${
              maReponse === "no" ? "bg-rof-rouge text-white" : "bg-rof-craie text-rof-gris"
            }`}
          >
            ✗ Absent·e
          </button>
        </form>
      </div>

      {peutEditer && (
        <div className="mt-3 border-t border-rof-ligne pt-3">
          <button onClick={() => setVoirListe(!voirListe)} className="flex w-full items-center justify-between text-left">
            <div className="flex gap-3 text-sm font-semibold">
              <span className="text-rof-gazon">✓ {presents.length} présent·e·s</span>
              <span className="text-rof-rouge">✗ {absents.length} absent·e·s</span>
              <span className="text-rof-gris">{sansReponse.length} sans réponse</span>
            </div>
            <span className="text-rof-gris">{voirListe ? "▲" : "▼"}</span>
          </button>
          {voirListe && (
            <div className="mt-2 grid gap-1 text-sm">
              {presents.map((j) => (
                <div key={j.id} className="text-rof-gazon">✓ {j.nom}</div>
              ))}
              {absents.map((j) => (
                <div key={j.id} className="text-rof-rouge">✗ {j.nom}</div>
              ))}
              {sansReponse.map((j) => (
                <div key={j.id} className="text-rof-gris">— {j.nom}</div>
              ))}
              {presents.length + absents.length + sansReponse.length === 0 && (
                <div className="text-rof-gris">Aucun joueur inscrit dans cette équipe.</div>
              )}
            </div>
          )}
          <form action={supprimerEvenement} className="mt-2 text-right">
            <input type="hidden" name="content_id" value={id} />
            <button type="submit" className="text-sm text-rof-rouge underline">
              Supprimer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
