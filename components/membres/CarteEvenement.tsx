"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  profilId,
  completionLocale = false,
  lienProgramme,
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
  profilId?: string; // pour mémoriser les étapes cochées de cette personne sur l'appareil
  completionLocale?: boolean; // séance générée par l'app : « complété » gardé sur l'appareil
  lienProgramme?: string; // lien vers la page complète du programme (animations)
}) {
  const aCompleter = mode === "completer";
  const [voirListe, setVoirListe] = useState(false);
  // La carte s'affiche en résumé; la personne l'ouvre pour voir les détails.
  const [ouvert, setOuvert] = useState(false);

  const { coches, basculerEtape, nbEtapes, nbCochees } = useEtapes(`rof-etapes-${profilId ?? "moi"}-${id}`, blocs);

  // Séances générées par l'app (ex. programme sprint) : « complété » mémorisé sur l'appareil.
  const cleFait = `rof-fait-${profilId ?? "moi"}-${id}`;
  const [faitLocal, setFaitLocal] = useState(false);
  useEffect(() => {
    if (!completionLocale) return;
    try {
      // Lecture unique de l'appareil au montage (localStorage n'existe pas côté serveur).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFaitLocal(localStorage.getItem(cleFait) === "1");
    } catch {}
  }, [cleFait, completionLocale]);
  const basculerFaitLocal = () => {
    const n = !faitLocal;
    setFaitLocal(n);
    try {
      localStorage.setItem(cleFait, n ? "1" : "0");
    } catch {}
  };
  const reponse = completionLocale ? (faitLocal ? "yes" : null) : maReponse;

  const statut = aCompleter
    ? reponse === "yes"
      ? { texte: "✓ Complété", classe: "border-rof-gazon/60 bg-rof-gazon/10 text-rof-gazon" }
      : { texte: "À faire", classe: "border-rof-or/60 bg-rof-or/10 text-rof-or" }
    : reponse === "yes"
      ? { texte: "✓ Présent·e", classe: "border-rof-gazon/60 bg-rof-gazon/10 text-rof-gazon" }
      : reponse === "no"
        ? { texte: "✗ Absent·e", classe: "border-rof-rouge/60 bg-rof-rouge/10 text-rof-rouge" }
        : passe
          ? null
          : { texte: "À répondre", classe: "border-rof-ligne bg-rof-craie text-rof-gris" };
  const badge = TYPES_EVENEMENT[type] ?? TYPES_EVENEMENT.Autre;
  const d = new Date(date + "T12:00:00");
  const valide = !Number.isNaN(d.getTime());
  const jourSemaine = valide ? d.toLocaleDateString("fr-CA", { weekday: "short" }).replace(".", "") : "";
  const mois = valide ? d.toLocaleDateString("fr-CA", { month: "short" }).replace(".", "") : "";

  // Couleur de la bande de gauche : permet de reconnaître le type d'un coup d'œil.
  const BARRES: Record<string, string> = { Pratique: "bg-rof-gazon", Match: "bg-rof-poudre", Tournoi: "bg-rof-or", Autre: "bg-rof-gris" };
  const barre = aCompleter ? "bg-rof-or" : BARRES[type] ?? BARRES.Autre;
  const couleurType = aCompleter ? "text-rof-or" : (badge.split(" ").find((c) => c.startsWith("text-")) ?? "text-rof-gris");
  const libelleType = aCompleter ? "Entraînement à faire" : type || "Autre";
  const progression = nbEtapes ? Math.round((nbCochees / nbEtapes) * 100) : 0;

  return (
    <div
      className={`overflow-hidden rounded-xl border bg-rof-blanc transition-colors ${ouvert ? "border-rof-poudre/60" : "border-rof-ligne"} ${passe ? "opacity-75" : ""}`}
    >
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        aria-expanded={ouvert}
        className="flex w-full items-stretch gap-3 p-3 text-left active:bg-rof-craie"
      >
        <span aria-hidden="true" className={`w-1 shrink-0 rounded-full ${barre}`} />
        <div className="flex w-10 shrink-0 flex-col items-center justify-center leading-none">
          <span className="font-condensed text-[11px] uppercase tracking-wide text-rof-poudre">{jourSemaine}</span>
          <span className="font-condensed text-2xl font-bold text-rof-texte">{valide ? d.getDate() : "?"}</span>
          <span className="font-condensed text-[10px] uppercase tracking-wide text-rof-gris">{mois}</span>
        </div>
        <div className="min-w-0 flex-1 self-center">
          <p className={`font-condensed text-lg font-bold uppercase leading-tight text-rof-texte ${ouvert ? "" : "line-clamp-2"}`}>{titre}</p>
          <p className={`text-xs text-rof-gris ${ouvert ? "" : "truncate"}`}>
            <span className={`font-semibold ${couleurType}`}>{libelleType}</span>
            {heure && <> · <span className="text-rof-texte">{heure}</span></>}
            {lieu && <> · {lieu}</>}
            {equipe && <> · {equipe}</>}
          </p>
          {peutEditer && (
            <p className="mt-0.5 truncate text-[11px] text-rof-gris">
              {aCompleter
                ? `✓ ${presents.length} complété · ${absents.length + sansReponse.length} à faire`
                : `✓ ${presents.length} · ✗ ${absents.length} · ${sansReponse.length} sans réponse`}
            </p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end justify-center gap-1">
          {statut && (
            <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 font-condensed text-[11px] font-bold uppercase tracking-wide ${statut.classe}`}>
              {statut.texte}
            </span>
          )}
          {nbEtapes > 0 && (
            <span className={`font-condensed text-[11px] font-bold uppercase ${nbCochees === nbEtapes ? "text-rof-gazon" : "text-rof-gris"}`}>
              {nbCochees}/{nbEtapes} étapes
            </span>
          )}
        </div>
        <span aria-hidden="true" className={`shrink-0 self-center text-rof-poudre transition-transform ${ouvert ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {nbEtapes > 0 && (
        <div className="h-1 w-full bg-rof-craie" aria-hidden="true">
          <div className={`h-1 ${nbCochees === nbEtapes ? "bg-rof-gazon" : "bg-rof-or"}`} style={{ width: `${progression}%` }} />
        </div>
      )}

      {ouvert && (
      <div className="border-t border-rof-ligne px-4 pb-4 pt-1">
      {note && <p className="mt-3 whitespace-pre-line text-sm text-rof-texte">{note}</p>}

      {pdfUrl && (
        <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className={`${bouton("accent", "md")} mt-3 w-full`}>
          📄 Ouvrir le PDF{pdfNom ? ` : ${pdfNom}` : ""}
        </a>
      )}

      {lienProgramme && (
        <Link href={lienProgramme} className={`${bouton("accent", "md")} mt-3 w-full`}>
          ▶ Ouvrir le programme avec les animations
        </Link>
      )}

      {blocs && blocs.length > 0 && (
        <BlocsProgramme blocs={blocs} coches={coches} basculerEtape={basculerEtape} titre={`Programme du jour · ${nbCochees}/${nbEtapes} étapes faites`} />
      )}

      {aCompleter ? (
        <div className="mt-3 flex flex-col gap-2">
          <p
            className={`self-start rounded-full border px-3 py-1 font-condensed text-sm font-bold uppercase tracking-wide ${
              reponse === "yes" ? "border-rof-gazon/60 bg-rof-gazon/10 text-rof-gazon" : "border-rof-ligne bg-rof-craie text-rof-gris"
            }`}
          >
            {reponse === "yes" ? "✓ Complété" : "Non complété"}
          </p>
          {completionLocale ? (
            <button
              type="button"
              onClick={basculerFaitLocal}
              className={reponse === "yes" ? bouton("neutre", "md") : "min-h-12 flex-1 rounded-full bg-rof-or font-condensed text-base font-bold uppercase tracking-wider text-black transition-colors active:scale-[0.97]"}
            >
              {reponse === "yes" ? "Annuler" : "✓ J'ai complété cet entraînement"}
            </button>
          ) : (
          <form action={marquerComplete} className="flex">
            <input type="hidden" name="content_id" value={id} />
            <input type="hidden" name="fait" value={reponse === "yes" ? "0" : "1"} />
            {reponse === "yes" ? (
              <button type="submit" className={bouton("neutre", "md")}>
                Annuler
              </button>
            ) : (
              <button type="submit" className="min-h-12 flex-1 rounded-full bg-rof-or font-condensed text-base font-bold uppercase tracking-wider text-black transition-colors active:scale-[0.97]">
                ✓ J&apos;ai complété cet entraînement
              </button>
            )}
          </form>
          )}
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
      )}
    </div>
  );
}

/** Étapes cochées d'un programme, mémorisées sur l'appareil (même clé dans l'agenda et dans Plans). */
export function useEtapes(cle: string, blocs?: BlocProgramme[] | null) {
  const [coches, setCoches] = useState<string[]>([]);
  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(cle) ?? "[]");
      // Lecture unique de l'appareil au montage (localStorage n'existe pas côté serveur).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (Array.isArray(v)) setCoches(v.filter((x) => typeof x === "string"));
    } catch {}
  }, [cle]);
  const basculerEtape = (k: string) =>
    setCoches((c) => {
      const n = c.includes(k) ? c.filter((x) => x !== k) : [...c, k];
      try {
        localStorage.setItem(cle, JSON.stringify(n));
      } catch {}
      return n;
    });
  const cles = (blocs ?? []).flatMap((b) => b.exercices.map((e) => `${b.titre}::${e.code}`));
  return { coches, basculerEtape, nbEtapes: cles.length, nbCochees: cles.filter((k) => coches.includes(k)).length };
}

/** Programme d'exercices par bloc, avec une case à cocher par étape. */
export function BlocsProgramme({
  blocs,
  coches,
  basculerEtape,
  titre,
}: {
  blocs: BlocProgramme[];
  coches: string[];
  basculerEtape: (cle: string) => void;
  titre: string;
}) {
  return (
    <details open className="mt-4">
      <summary className="min-h-10 cursor-pointer font-condensed text-base font-bold uppercase tracking-wide text-rof-poudre">
        {titre}
      </summary>
      <div className="mt-2 flex flex-col gap-6">
        {blocs.map((b) => (
          <section key={b.titre}>
            <h3 className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-rof-or pb-1 font-condensed text-lg font-bold uppercase tracking-wide text-rof-or">
              {b.titre}
              {b.info && <span className="text-xs font-semibold normal-case tracking-normal text-rof-gris">{b.info}</span>}
            </h3>
            <ol className="mt-3 flex flex-col gap-4">
              {b.exercices.map((e) => {
                const cleEtape = `${b.titre}::${e.code}`;
                const faite = coches.includes(cleEtape);
                return (
                <li key={e.code} className={`overflow-hidden rounded-xl border bg-rof-craie ${faite ? "border-rof-gazon/60" : "border-rof-ligne"}`}>
                  {e.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={e.url} alt={`${e.nom} : position de départ puis d'arrivée`} loading="lazy" className="w-full bg-white object-contain" />
                  )}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className={`font-condensed text-lg font-bold uppercase leading-tight ${faite ? "text-rof-gris line-through" : "text-rof-texte"}`}>
                        <span className="mr-2 rounded bg-rof-or px-1.5 py-0.5 text-sm text-black">{e.code}</span>
                        {e.nom}
                      </p>
                      <span className="shrink-0 rounded-full border border-rof-or/70 px-3 py-0.5 font-condensed text-sm font-bold text-rof-or">{e.series}</span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-rof-gris">{e.description}</p>
                    <label className={`mt-3 flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 font-condensed text-sm font-bold uppercase tracking-wide ${faite ? "border-rof-gazon/60 bg-rof-gazon/10 text-rof-gazon" : "border-rof-ligne text-rof-texte"}`}>
                      <input type="checkbox" checked={faite} onChange={() => basculerEtape(cleEtape)} className="h-5 w-5 accent-[#4FB477]" />
                      {faite ? "✓ Étape faite" : "Cocher quand c'est fait"}
                    </label>
                  </div>
                </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </details>
  );
}
