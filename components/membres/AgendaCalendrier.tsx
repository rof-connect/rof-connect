"use client";

import { useEffect, useRef, useState } from "react";

export type JourAgenda = {
  date: string; // AAAA-MM-JJ
  etiquettes: string[]; // « Sprint », « Physique », « Match »…
  fait: boolean; // tout ce qui était à compléter ce jour-là est complété
  contenu: React.ReactNode; // les cartes de la journée
};

const JOURS_COURTS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const JOURS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MOIS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const MOIS_COURTS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

// Dates à midi UTC : aucun décalage de fuseau, et le même texte sur le serveur et sur l'appareil.
const lire = (d: string) => new Date(d + "T12:00:00Z");
const ajouter = (d: string, n: number) => new Date(lire(d).getTime() + n * 86400000).toISOString().slice(0, 10);
const longue = (d: string) => `${JOURS[lire(d).getUTCDay()]} ${lire(d).getUTCDate() === 1 ? "1er" : lire(d).getUTCDate()} ${MOIS[lire(d).getUTCMonth()]}`;

/** Agenda en calendrier : une bande de dates à faire défiler de gauche à droite ; les activités de la journée choisie s'affichent dessous. */
export function AgendaCalendrier({ jours, aujourdhui, debut, fin }: { jours: JourAgenda[]; aujourdhui: string; debut: string; fin: string }) {
  const [choisi, setChoisi] = useState(aujourdhui);
  const bande = useRef<HTMLDivElement>(null);
  const parDate = new Map(jours.map((j) => [j.date, j]));

  const dates: string[] = [];
  for (let d = debut; d <= fin; d = ajouter(d, 1)) dates.push(d);

  // Garde la journée choisie au centre de la bande (sans faire bouger la page).
  const premierAffichage = useRef(true);
  useEffect(() => {
    const zone = bande.current;
    const el = zone?.querySelector<HTMLElement>(`[data-date="${choisi}"]`);
    if (!zone || !el) return;
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    zone.scrollTo({ left: el.offsetLeft - zone.clientWidth / 2 + el.clientWidth / 2, behavior: premierAffichage.current || reduit ? "auto" : "smooth" });
    premierAffichage.current = false;
  }, [choisi]);

  const defiler = (sens: 1 | -1) => bande.current?.scrollBy({ left: sens * (bande.current.clientWidth * 0.8), behavior: "smooth" });

  const du = lire(choisi);
  const jourChoisi = parDate.get(choisi);
  const prochain = jours.find((j) => j.date > choisi);
  const fleche = "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-rof-ligne text-lg text-rof-poudre active:scale-95";

  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Choisir une journée" className="rounded-2xl border border-rof-ligne bg-rof-blanc py-3">
        <div className="flex items-center justify-between gap-2 px-3">
          <button type="button" className={fleche} onClick={() => defiler(-1)} aria-label="Dates précédentes">
            ‹
          </button>
          <p className="font-condensed text-lg font-bold uppercase tracking-wide text-rof-texte" aria-live="polite">
            {MOIS[du.getUTCMonth()]} {du.getUTCFullYear()}
          </p>
          <button type="button" className={fleche} onClick={() => defiler(1)} aria-label="Dates suivantes">
            ›
          </button>
        </div>

        <div ref={bande} className="relative mt-3 flex snap-x gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none]">
          {dates.map((d) => {
            const info = parDate.get(d);
            const x = lire(d);
            const actif = d === choisi;
            const estAujourdhui = d === aujourdhui;
            return (
              <button
                key={d}
                type="button"
                data-date={d}
                onClick={() => setChoisi(d)}
                aria-pressed={actif}
                aria-label={`${longue(d)}${info ? ` : ${info.etiquettes.join(", ")}${info.fait ? ", complété" : ""}` : " : rien de prévu"}`}
                className={`flex w-16 shrink-0 snap-center flex-col items-center gap-0.5 rounded-xl border py-2 leading-none transition-colors active:scale-95 ${
                  actif ? "border-rof-or bg-rof-or text-black" : estAujourdhui ? "border-rof-poudre bg-rof-craie text-rof-texte" : "border-rof-ligne bg-rof-craie text-rof-texte"
                } ${!info && !actif ? "opacity-60" : ""}`}
              >
                <span className={`font-condensed text-[11px] font-bold uppercase tracking-wide ${actif ? "text-black" : "text-rof-poudre"}`}>{JOURS_COURTS[x.getUTCDay()]}</span>
                <span className="font-condensed text-2xl font-bold">{x.getUTCDate()}</span>
                <span className={`font-condensed text-[10px] uppercase ${actif ? "text-black/70" : "text-rof-gris"}`}>{estAujourdhui ? "Auj." : MOIS_COURTS[x.getUTCMonth()]}</span>
                <span className={`mt-1 h-4 max-w-full truncate px-1 font-condensed text-[10px] font-bold uppercase ${actif ? "text-black" : info?.fait ? "text-rof-gazon" : "text-rof-or"}`}>
                  {info ? (info.fait ? "✓ " : "") + info.etiquettes[0] + (info.etiquettes.length > 1 ? " +" : "") : ""}
                </span>
              </button>
            );
          })}
        </div>

        {choisi !== aujourdhui && (
          <div className="mt-2 text-center">
            <button type="button" onClick={() => setChoisi(aujourdhui)} className="min-h-9 rounded-full border border-rof-ligne px-4 font-condensed text-sm font-bold uppercase tracking-wide text-rof-poudre">
              Revenir à aujourd&apos;hui
            </button>
          </div>
        )}
      </section>

      <section aria-label="Activités de la journée" className="flex flex-col gap-3">
        <h2 className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">
          {longue(choisi)}
          {choisi === aujourdhui ? " · aujourd'hui" : ""}
        </h2>
        {jourChoisi ? (
          <div key={choisi} className="flex flex-col gap-2">
            {jourChoisi.contenu}
            <p className="text-xs text-rof-gris">Touche une activité pour voir les détails.</p>
          </div>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-rof-ligne bg-rof-blanc p-4">
            <p className="text-sm text-rof-gris">Rien de prévu cette journée.</p>
            {prochain && (
              <button type="button" onClick={() => setChoisi(prochain.date)} className="min-h-10 rounded-full bg-rof-or px-4 font-condensed text-sm font-bold uppercase tracking-wide text-black">
                Prochaine activité : {longue(prochain.date).toLowerCase()} →
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
