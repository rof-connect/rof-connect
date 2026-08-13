"use client";

import { useState } from "react";
import { ajouterEvenementCalendrier } from "@/app/membres/calendrier/actions";

const TYPES = ["Pratique", "Match", "Tournoi", "Réunion", "Date limite", "Événement", "Autre"];

type Equipe = { id: string; name: string; sport: string };

export function FormAjoutEvenementCalendrier({
  dateParDefaut,
  equipes,
}: {
  dateParDefaut: string;
  equipes: Equipe[];
}) {
  const [ouvert, setOuvert] = useState(false);
  const [portee, setPortee] = useState<"org" | "sport" | "team">("org");

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="w-fit rounded-lg border border-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-or"
      >
        + Ajouter un événement
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await ajouterEvenementCalendrier(formData);
        setOuvert(false);
      }}
      className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-rof-or bg-rof-carte-haut p-4"
    >
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Nouvel événement</div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Titre</p>
        <input
          name="title"
          required
          placeholder="Ex. : Tournoi provincial — inscriptions"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Portée</p>
        <select
          value={portee}
          onChange={(e) => setPortee(e.target.value as "org" | "sport" | "team")}
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
        >
          <option value="org">Toute l&apos;organisation</option>
          <option value="sport">Un sport (baseball ou softball)</option>
          <option value="team">Une équipe précise</option>
        </select>
      </div>

      {portee === "sport" && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Sport</p>
          <select name="sport" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
            <option value="baseball">Baseball</option>
            <option value="softball">Softball</option>
          </select>
        </div>
      )}

      {portee === "team" && (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Équipe</p>
          <select name="team_id" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
            {equipes.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Type</p>
        <select name="type" defaultValue="Autre" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
          {TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Date</p>
          <input
            name="event_date"
            type="date"
            required
            defaultValue={dateParDefaut}
            className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
          />
        </div>
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Heure</p>
          <input
            name="event_time"
            placeholder="Ex. : 18 h 30"
            className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
          />
        </div>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Lieu</p>
        <input
          name="location"
          placeholder="Optionnel"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Note</p>
        <input
          name="note"
          placeholder="Optionnel"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      <div className="mt-1 flex gap-2">
        <button type="submit" className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white">
          Publier
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-lg border border-rof-ligne px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-gris"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
