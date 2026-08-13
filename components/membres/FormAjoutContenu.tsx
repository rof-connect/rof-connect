"use client";

import { useState } from "react";
import { ajouterContenu } from "@/app/membres/[section]/actions";
import type { SectionConfig } from "@/lib/section-config";

export function FormAjoutContenu({ slug, config, teamId }: { slug: string; config: SectionConfig; teamId: string }) {
  const [ouvert, setOuvert] = useState(false);

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="w-fit rounded-lg border border-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-or"
      >
        + Ajouter
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await ajouterContenu(formData);
        setOuvert(false);
      }}
      className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-rof-or bg-rof-carte-haut p-4"
    >
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Nouveau contenu</div>
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="team_id" value={teamId} />

      {config.champs.map((champ) => (
        <div key={champ.name}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">{champ.label}</p>
          {champ.type === "textarea" ? (
            <textarea
              name={champ.name}
              required={champ.required}
              placeholder={champ.placeholder}
              rows={4}
              className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
            />
          ) : (
            <input
              name={champ.name}
              type={champ.type === "date" ? "date" : champ.type === "url" ? "url" : "text"}
              required={champ.required}
              placeholder={champ.placeholder}
              className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
            />
          )}
        </div>
      ))}

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Statut minimum requis pour voir</p>
        <select
          name="min_status"
          defaultValue={String(config.accesDefaut)}
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
        >
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
