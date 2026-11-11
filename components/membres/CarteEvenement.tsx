"use client";

import { useState } from "react";
import { repondre, supprimerEvenement } from "@/app/membres/agenda/actions";
import { bouton } from "@/components/ui/boutons";

const TYPES_EVENEMENT: Record<string, string> = {
  Pratique: "border-rof-gazon/50 bg-rof-gazon/10 text-rof-gazon",
  Match: "border-rof-poudre/50 bg-rof-royal-sombre text-rof-poudre",
  Tournoi: "border-rof-or/50 bg-rof-or/15 text-rof-or",
  Autre: "border-rof-ligne bg-rof-craie text-rof-gris",
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
  equipe,
  passe = false,
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
  equipe?: string;
  passe?: boolean;
  maReponse: "yes" | "no" | null;
  peutEditer: boolean;
  presents: Athlete[];
  absents: Athlete[];
  sansReponse: Athlete[];
}) {
  const [voirListe, setVoirListe] = useState(false);
  const badge = TYPES_EVENEMENT[type] ?? TYPES_EVENEMENT.Autre;
  const d = new Date(date + "T12:00:00");
  const valide = !Number.isNaN(d.getTime());
  const jourSemaine = valide ? d.toLocaleDateString("fr-CA", { weekday: "short" }).replace(".", "") : "";
  const mois = valide ? d.toLocaleDateString("fr-CA", { month: "short" }).replace(".", "") : "";

  return (
    <div className={`rounded-2xl border bg-rof-blanc p-4 ${passe ? "border-rof-ligne opacity-80" : "border-rof-ligne"}`}>
      <div className="flex gap-4">
        <div className="flex w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-rof-royal-sombre py-2 text-center">
          <span className="font-condensed text-xs uppercase tracking-wide text-rof-poudre">{jourSemaine}</span>
          <span className="font-condensed text-3xl font-bold leading-none text-rof-texte">{valide ? d.getDate() : "?"}</span>
          <span className="font-condensed text-xs uppercase tracking-wide text-rof-poudre">{mois}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-1.5">
            <span className={`rounded-full border px-2 py-0.5 font-condensed text-xs font-bold uppercase tracking-wide ${badge}`}>{type || "Autre"}</span>
            {equipe && (
              <span className="rounded-full border border-rof-ligne bg-rof-craie px-2 py-0.5 font-condensed text-xs font-bold uppercase tracking-wide text-rof-gris">
                {equipe}
              </span>
            )}
          </div>
          <div className="mt-1 font-condensed text-xl font-bold uppercase leading-tight text-rof-texte">{titre}</div>
          {(heure || lieu) && (
            <div className="mt-0.5 text-sm text-rof-gris">
              {heure && <span className="text-rof-texte">{heure}</span>}
              {heure && lieu ? " · " : ""}
              {lieu}
            </div>
          )}
        </div>
      </div>
      {note && <p className="mt-3 whitespace-pre-line text-sm text-rof-texte">{note}</p>}

      {!passe ? (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <form action={repondre} className="flex">
            <input type="hidden" name="content_id" value={id} />
            <input type="hidden" name="response" value="yes" />
            <button
              type="submit"
              aria-pressed={maReponse === "yes"}
              className={`min-h-12 flex-1 rounded-full font-condensed text-base font-bold uppercase tracking-wider transition-colors active:scale-[0.97] ${
                maReponse === "yes" ? "bg-rof-gazon text-black" : "border border-rof-ligne bg-rof-craie text-rof-texte"
              }`}
            >
              ✓ Présent·e
            </button>
          </form>
          <form action={repondre} className="flex">
            <input type="hidden" name="content_id" value={id} />
            <input type="hidden" name="response" value="no" />
            <button
              type="submit"
              aria-pressed={maReponse === "no"}
              className={`min-h-12 flex-1 rounded-full font-condensed text-base font-bold uppercase tracking-wider transition-colors active:scale-[0.97] ${
                maReponse === "no" ? "bg-rof-rouge text-white" : "border border-rof-ligne bg-rof-craie text-rof-texte"
              }`}
            >
              ✗ Absent·e
            </button>
          </form>
        </div>
      ) : (
        maReponse && (
          <p className={`mt-3 text-sm ${maReponse === "yes" ? "text-rof-gazon" : "text-rof-rouge"}`}>
            {maReponse === "yes" ? "✓ Présent·e" : "✗ Absent·e"}
          </p>
        )
      )}

      {peutEditer && (
        <div className="mt-3 border-t border-rof-ligne pt-3">
          <button onClick={() => setVoirListe(!voirListe)} className="flex min-h-10 w-full items-center justify-between rounded-xl bg-rof-craie px-3 text-left">
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
            <button type="submit" className={bouton("danger")}>
              Supprimer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
