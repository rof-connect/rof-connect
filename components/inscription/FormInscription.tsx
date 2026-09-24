"use client";

import { useState } from "react";
import { inscrireAthlete, inscrireEntraineur } from "@/app/inscription/actions";
import type { Dictionnaire } from "@/lib/i18n/dictionaries";

type Equipe = { id: string; name: string; sport: string };

export function FormInscription({
  teams,
  i,
  typeInitial = "athlete",
}: {
  teams: Equipe[];
  i: Dictionnaire["inscription"];
  typeInitial?: "athlete" | "entraineur";
}) {
  const [type, setType] = useState<"athlete" | "entraineur">(typeInitial);

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div>
        <Etiquette texte={i.typeCompte} />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setType("athlete")}
            className={`flex-1 rounded-lg border px-3 py-2 font-condensed text-sm font-bold uppercase tracking-wide ${
              type === "athlete" ? "border-rof-or bg-rof-or text-white" : "border-rof-ligne bg-rof-craie text-rof-gris"
            }`}
          >
            {i.typeAthlete}
          </button>
          <button
            type="button"
            onClick={() => setType("entraineur")}
            className={`flex-1 rounded-lg border px-3 py-2 font-condensed text-sm font-bold uppercase tracking-wide ${
              type === "entraineur" ? "border-rof-or bg-rof-or text-white" : "border-rof-ligne bg-rof-craie text-rof-gris"
            }`}
          >
            {i.typeEntraineur}
          </button>
        </div>
      </div>

      {type === "athlete" ? (
        <form action={inscrireAthlete} className="flex flex-col gap-4">
          <Champ label={i.nomAthlete} name="full_name" required placeholder="Ex. : Bella Di Peco" />
          <Champ label={i.courrielParent} name="email" type="email" required placeholder="parent@courriel.com" />
          <Champ label={i.motDePasse} name="password" type="password" required minLength={8} />

          <div>
            <Etiquette texte={i.equipe} />
            <select
              name="team_id"
              required
              className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
            >
              {teams.map((tm) => (
                <option key={tm.id} value={tm.id}>
                  {tm.name}
                </option>
              ))}
            </select>
          </div>

          <Champ label={i.dateNaissance} name="birth_date" type="date" />

          <div>
            <Etiquette texte={i.position} />
            <select name="position" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
              <option value="">{i.choisir}</option>
              {i.positions.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Etiquette texte={i.lance} />
              <select name="throws" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
                <option value="">—</option>
                <option value="Droite">{i.droite}</option>
                <option value="Gauche">{i.gauche}</option>
              </select>
            </div>
            <div>
              <Etiquette texte={i.frappe} />
              <select name="bats" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
                <option value="">—</option>
                <option value="Droite">{i.droite}</option>
                <option value="Gauche">{i.gauche}</option>
                <option value="Ambidextre">{i.ambidextre}</option>
              </select>
            </div>
          </div>

          <Champ label={i.nomParent} name="guardian_name" placeholder="Ex. : Nick Di Peco" />
          <Champ label={i.telParent} name="guardian_phone" type="tel" placeholder="Ex. : 450 555-1234" />
          <Champ label={i.courrielParentSiDifferent} name="guardian_email" type="email" />
          <Champ label={i.medical} name="medical_notes" placeholder={i.optionnel} />

          <label className="mt-1 flex items-start gap-2 text-sm text-rof-texte">
            <input type="checkbox" name="photo_consent" className="mt-0.5" />
            <span>{i.consentement}</span>
          </label>

          <button
            type="submit"
            className="mt-3 w-full rounded-xl bg-rof-or py-3 font-condensed text-lg font-bold uppercase tracking-wider text-white"
          >
            {i.minscrire}
          </button>
        </form>
      ) : (
        <form action={inscrireEntraineur} className="flex flex-col gap-4">
          <p className="text-sm text-rof-gris">{i.entraineurIntro}</p>
          <Champ label={i.nomEntraineur} name="full_name" required placeholder="Ex. : Sophie Tremblay" />
          <Champ label={i.courrielEntraineur} name="email" type="email" required placeholder="entraineur@courriel.com" />
          <Champ label={i.motDePasse} name="password" type="password" required minLength={8} />

          <button
            type="submit"
            className="mt-3 w-full rounded-xl bg-rof-poudre py-3 font-condensed text-lg font-bold uppercase tracking-wider text-rof-noir"
          >
            {i.sinscrireEntraineur}
          </button>
        </form>
      )}
    </div>
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
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <Etiquette texte={label} />
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
      />
    </div>
  );
}
