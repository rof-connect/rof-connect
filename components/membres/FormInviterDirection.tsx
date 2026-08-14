"use client";

import { useActionState } from "react";
import { inviterDirection } from "@/app/membres/admin/comptes/actions";

const etatInitial = { ok: false, erreur: null as string | null };

export function FormInviterDirection() {
  const [etat, action, enCours] = useActionState(async (_prev: typeof etatInitial, formData: FormData) => {
    const res = await inviterDirection(formData);
    return res;
  }, etatInitial);

  return (
    <form action={action} className="flex flex-col gap-3 rounded-xl border border-rof-poudre bg-rof-blanc p-4">
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Inviter un compte direction</div>
      <p className="text-sm text-rof-gris">Accès complet à toute l&apos;organisation — équipes, exports, gestion des comptes.</p>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Nom complet</p>
        <input
          name="full_name"
          required
          placeholder="Ex. : Nick Di Peco"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Courriel</p>
        <input
          name="email"
          type="email"
          required
          placeholder="direction@courriel.com"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      {etat.erreur && <p className="text-sm text-rof-rouge">{etat.erreur}</p>}
      {etat.ok && <p className="text-sm text-rof-gazon">Invitation envoyée.</p>}

      <button
        type="submit"
        disabled={enCours}
        className="w-fit rounded-lg bg-rof-poudre px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-noir disabled:opacity-50"
      >
        {enCours ? "Envoi…" : "Envoyer l'invitation"}
      </button>
    </form>
  );
}
