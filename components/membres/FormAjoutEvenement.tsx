"use client";

import { useState } from "react";
import { ajouterEvenement } from "@/app/membres/agenda/actions";

export function FormAjoutEvenement({ teamId }: { teamId: string }) {
  const [ouvert, setOuvert] = useState(false);

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
        await ajouterEvenement(formData);
        setOuvert(false);
      }}
      className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-rof-or bg-rof-carte-haut p-4"
    >
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Nouvel événement</div>
      <input type="hidden" name="team_id" value={teamId} />

      <Champ label="Titre" name="titre" required placeholder="Ex. : Pratique frappe — cages EDB" />

      <div>
        <Etiquette texte="Type" />
        <select name="type" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
          <option>Pratique</option>
          <option>Match</option>
          <option>Tournoi</option>
          <option>Autre</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Champ label="Date" name="date" type="date" required />
        <Champ label="Heure" name="heure" placeholder="Ex. : 18 h 30 – 20 h" />
      </div>

      <Champ label="Lieu" name="lieu" placeholder="Ex. : Terrain Lapointe, Repentigny" />
      <Champ label="Note" name="note" placeholder="Ex. : Apporter casque et gants de frappe" />

      <div>
        <Etiquette texte="Statut minimum requis pour voir" />
        <select name="min_status" defaultValue="1" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
          <option value="1">1 — Prospect (tout le monde)</option>
          <option value="2">2 — Mineur</option>
          <option value="3">3 — Majeur</option>
          <option value="4">4 — Intermédiaire</option>
          <option value="5">5 — Junior</option>
          <option value="6">6 — Senior</option>
          <option value="7">7 — JV</option>
          <option value="8">8 — Varsity</option>
        </select>
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

function Etiquette({ texte }: { texte: string }) {
  return <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">{texte}</p>;
}

function Champ({
  label,
  name,
  type = "text",
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Etiquette texte={label} />
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
      />
    </div>
  );
}
