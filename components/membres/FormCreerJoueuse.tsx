"use client";

import { useActionState, useEffect, useRef } from "react";
import { creerProfilJoueuse } from "@/app/membres/admin/joueurs/actions";

type Equipe = { id: string; name: string };
type Statut = { id: number; nom: string };

const etatInitial = { ok: false, erreur: null as string | null };
const POSITIONS = ["Lanceur·euse", "Receveur·euse", "1er but", "2e but", "3e but", "Arrêt-court", "Champ extérieur", "Utilitaire"];

export function FormCreerJoueuse({ equipes, statuts }: { equipes: Equipe[]; statuts: Statut[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [etat, action, enCours] = useActionState(async (_prev: typeof etatInitial, formData: FormData) => {
    return await creerProfilJoueuse(formData);
  }, etatInitial);

  useEffect(() => {
    if (etat.ok) formRef.current?.reset();
  }, [etat]);

  return (
    <details className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
      <summary className="cursor-pointer font-condensed text-lg font-bold uppercase tracking-wide text-rof-texte">
        + Créer un profil de joueuse
      </summary>
      <form ref={formRef} action={action} className="mt-4 flex flex-col gap-3">
        <p className="text-sm text-rof-gris">
          Plusieurs joueuses peuvent partager le même courriel : si le courriel a déjà un compte, la joueuse est
          ajoutée à la même famille.
        </p>

        <Champ label="Nom complet *" name="full_name" required placeholder="Ex. : Bella Di Peco" />
        <Champ label="Courriel (parent ou joueuse)" name="email" type="email" placeholder="parent@courriel.com (optionnel)" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Etiquette texte="Équipe" />
            <select name="team_id" className={champ}>
              <option value="">— Aucune —</option>
              {equipes.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Etiquette texte="Statut" />
            <select name="status_id" defaultValue="1" className={champ}>
              {statuts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Champ label="Date de naissance" name="birth_date" type="date" />

        <div className="grid grid-cols-3 gap-3">
          <div>
            <Etiquette texte="Position" />
            <select name="position" className={champ}>
              <option value="">—</option>
              {POSITIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Etiquette texte="Lance" />
            <select name="throws" className={champ}>
              <option value="">—</option>
              <option value="Droite">Droite</option>
              <option value="Gauche">Gauche</option>
            </select>
          </div>
          <div>
            <Etiquette texte="Frappe" />
            <select name="bats" className={champ}>
              <option value="">—</option>
              <option value="Droite">Droite</option>
              <option value="Gauche">Gauche</option>
              <option value="Ambidextre">Ambidextre</option>
            </select>
          </div>
        </div>

        <Champ label="Nom du parent ou tuteur" name="guardian_name" />
        <Champ label="Téléphone du parent ou tuteur" name="guardian_phone" type="tel" />
        <Champ label="Courriel du parent ou tuteur (si différent)" name="guardian_email" type="email" />
        <Champ label="Allergies / infos médicales" name="medical_notes" />

        <label className="flex items-center gap-2 text-sm text-rof-texte">
          <input type="checkbox" name="photo_consent" /> Consentement photo / vidéo
        </label>
        <label className="flex items-center gap-2 text-sm text-rof-texte">
          <input type="checkbox" name="envoyer_invitation" defaultChecked /> Envoyer un courriel d&apos;invitation (nouveau compte seulement)
        </label>

        {etat.erreur && <p className="text-sm text-rof-rouge">{etat.erreur}</p>}
        {etat.ok && <p className="text-sm text-rof-gazon">Profil créé.</p>}

        <button
          type="submit"
          disabled={enCours}
          className="w-fit rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {enCours ? "Création…" : "Créer le profil"}
        </button>
      </form>
    </details>
  );
}

const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60";

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
      <input name={name} type={type} required={required} placeholder={placeholder} className={champ} />
    </div>
  );
}
