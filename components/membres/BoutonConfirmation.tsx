"use client";

import { useRef, useState } from "react";

/**
 * Bouton « Voter » en deux temps : on résume la réponse choisie et on demande de la confirmer.
 * Le formulaire n'est envoyé (et la Direction n'est avertie) qu'après la confirmation.
 */
export function BoutonConfirmation({ libelle }: { libelle: string }) {
  const ancre = useRef<HTMLSpanElement>(null);
  const [resume, setResume] = useState<string | null>(null);

  function demanderConfirmation() {
    const form = ancre.current?.closest("form");
    if (!form) return;
    if (!form.reportValidity()) return;

    const choisi = form.querySelector<HTMLInputElement>('input[type="radio"]:checked');
    if (choisi) {
      setResume(choisi.dataset.label ?? choisi.value);
      return;
    }
    const dates = Array.from(form.querySelectorAll<HTMLInputElement>('input[type="date"]'))
      .map((i) => i.value)
      .filter(Boolean)
      .map((d) => new Date(d + "T12:00:00").toLocaleDateString("fr-CA", { dateStyle: "long" }));
    setResume(dates.length ? dates.join(" · ") : "Aucune date (la réponse sera retirée)");
  }

  return (
    <span ref={ancre} className="flex flex-col gap-2">
      {resume === null ? (
        <button
          type="button"
          onClick={demanderConfirmation}
          className="w-fit rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
        >
          {libelle}
        </button>
      ) : (
        <span className="flex flex-col gap-2 rounded-lg border border-rof-or bg-rof-craie p-3">
          <span className="text-sm text-rof-texte">
            Confirmer ta réponse : <strong>{resume}</strong>
          </span>
          <span className="flex gap-3">
            <button
              type="submit"
              onClick={() => setTimeout(() => setResume(null), 0)}
              className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white"
            >
              Confirmer ma réponse
            </button>
            <button type="button" onClick={() => setResume(null)} className="text-sm text-rof-gris underline">
              Modifier
            </button>
          </span>
        </span>
      )}
    </span>
  );
}
