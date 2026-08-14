"use client";

import { useActionState } from "react";
import { inviterEntraineur } from "@/app/membres/admin/comptes/actions";

type Equipe = { id: string; name: string };

const etatInitial = { ok: false, erreur: null as string | null };

export function FormInviterEntraineur({ equipes }: { equipes: Equipe[] }) {
  const [etat, action, enCours] = useActionState(async (_prev: typeof etatInitial, formData: FormData) => {
    const res = await inviterEntraineur(formData);
    return res;
  }, etatInitial);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Inviter un entraîneur</div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Nom complet</p>
        <input
          name="full_name"
          required
          placeholder="Ex. : Sophie Tremblay"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Courriel</p>
        <input
          name="email"
          type="email"
          required
          placeholder="entraineur@courriel.com"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Équipe(s)</p>
        <div className="flex flex-col gap-1.5 rounded-lg border border-rof-ligne bg-rof-craie p-3">
          {equipes.map((eq) => (
            <label key={eq.id} className="flex items-center gap-2 text-sm text-rof-texte">
              <input type="checkbox" name="team_ids" value={eq.id} />
              {eq.name}
            </label>
          ))}
          {equipes.length === 0 && <p className="text-sm text-rof-gris">Aucune équipe active.</p>}
        </div>
      </div>

      {etat.erreur && <p className="text-sm text-rof-rouge">{etat.erreur}</p>}
      {etat.ok && <p className="text-sm text-rof-gazon">Invitation envoyée.</p>}

      <button
        type="submit"
        disabled={enCours}
        className="w-fit rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
      >
        {enCours ? "Envoi…" : "Envoyer l'invitation"}
      </button>
    </form>
  );
}
