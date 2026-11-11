"use client";

import { useState } from "react";
import { marquerComplete, repondre, supprimerEvenement } from "@/app/membres/agenda/actions";
import { bouton } from "@/components/ui/boutons";

const TYPES_EVENEMENT: Record<string, string> = {
  Pratique: "border-rof-gazon/50 bg-rof-gazon/10 text-rof-gazon",
  Match: "border-rof-poudre/50 bg-rof-royal-sombre text-rof-poudre",
  Tournoi: "border-rof-or/50 bg-rof-or/15 text-rof-or",
  Autre: "border-rof-ligne bg-rof-craie text-rof-gris",
};

type Athlete = { id: string; nom: string };
export type ExerciceProgramme = { code: string; nom: string; series: string; description: string; url?: string | null };
export type BlocProgramme = { titre: string; info?: string; exercices: ExerciceProgramme[] };

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
  mode,
  pdfUrl,
  pdfNom,
  blocs,
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
  mode?: string | null; // « completer » : plan à faire quand on veut, la joueuse clique quand c'est complété (pas de présence)
  pdfUrl?: string | null;
  pdfNom?: string | null;
  blocs?: BlocProgramme[] | null; // programme d'entraînement du jour (exercices séparés, avec photos)
}) {
  const aCompleter = mode === "completer";
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

      {pdfUrl && (
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={`${bouton("accent", "md")} mt-3 w-full`}>
          📄 Ouvrir le PDF{pdfNom ? ` : ${pdfNom}` : ""}
        </a>
      )}

      {blocs && blocs.length > 0 && (
        <details open className="mt-4">
          <summary className="min-h-10 cursor-pointer font-condensed text-base font-bold uppercase tracking-wide text-rof-poudre">
            Programme du jour · {blocs.reduce((n, b) => n + b.exercices.length, 0)} exercices
          </summary>
          <div className="mt-2 flex flex-col gap-6">
            {blocs.map((b) => (
              <section key={b.titre}>
                <h3 className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-rof-or pb-1 font-condensed text-lg font-bold uppercase tracking-wide text-rof-or">
                  {b.titre}
                  {b.info && <span className="text-xs font-semibold normal-case tracking-normal text-rof-gris">{b.info}</span>}
                </h3>
                <ol className="mt-3 flex flex-col gap-4">
                  {b.exercices.map((e) => (
                    <li key={e.code} className="overflow-hidden rounded-xl border border-rof-ligne bg-rof-craie">
                      {e.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={e.url} alt={`${e.nom} : position de départ puis d'arrivée`} loading="lazy" className="w-full bg-white object-contain" />
                      )}
                      <div className="p-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="font-condensed text-lg font-bold uppercase leading-tight text-rof-texte">
                            <span className="mr-2 rounded bg-rof-or px-1.5 py-0.5 text-sm text-black">{e.code}</span>
                            {e.nom}
                          </p>
                          <span className="shrink-0 rounded-full border border-rof-or/70 px-3 py-0.5 font-condensed text-sm font-bold text-rof-or">{e.series}</span>
                        </div>
                        <p className="mt-2 text-sm leading-relaxed text-rof-gris">{e.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </section>
            ))}
          </div>
        </details>
      )}

      {aCompleter ? (
        <div className="mt-3 flex flex-col gap-2">
          <p
            className={`self-start rounded-full border px-3 py-1 font-condensed text-sm font-bold uppercase tracking-wide ${
              maReponse === "yes" ? "border-rof-gazon/60 bg-rof-gazon/10 text-rof-gazon" : "border-rof-ligne bg-rof-craie text-rof-gris"
            }`}
          >
            {maReponse === "yes" ? "✓ Complété" : "Non complété"}
          </p>
          <form action={marquerComplete} className="flex">
            <input type="hidden" name="content_id" value={id} />
            <input type="hidden" name="fait" value={maReponse === "yes" ? "0" : "1"} />
            {maReponse === "yes" ? (
              <button type="submit" className={bouton("neutre", "md")}>
                Annuler
              </button>
            ) : (
              <button type="submit" className="min-h-12 flex-1 rounded-full bg-rof-or font-condensed text-base font-bold uppercase tracking-wider text-black transition-colors active:scale-[0.97]">
                ✓ J&apos;ai complété cet entraînement
              </button>
            )}
          </form>
        </div>
      ) : !passe ? (
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
            {aCompleter ? (
              <div className="flex gap-3 text-sm font-semibold">
                <span className="text-rof-gazon">✓ {presents.length} complété</span>
                <span className="text-rof-gris">{absents.length + sansReponse.length} non complété</span>
              </div>
            ) : (
              <div className="flex gap-3 text-sm font-semibold">
                <span className="text-rof-gazon">✓ {presents.length} présent·e·s</span>
                <span className="text-rof-rouge">✗ {absents.length} absent·e·s</span>
                <span className="text-rof-gris">{sansReponse.length} sans réponse</span>
              </div>
            )}
            <span className="text-rof-gris">{voirListe ? "▲" : "▼"}</span>
          </button>
          {voirListe && (
            <div className="mt-2 grid gap-1 text-sm">
              {presents.map((j) => (
                <div key={j.id} className="text-rof-gazon">✓ {j.nom}</div>
              ))}
              {absents.map((j) => (
                <div key={j.id} className={aCompleter ? "text-rof-gris" : "text-rof-rouge"}>
                  {aCompleter ? "—" : "✗"} {j.nom}
                </div>
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
