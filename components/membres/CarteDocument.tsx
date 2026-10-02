"use client";

import { supprimerDocument } from "@/app/membres/documents/actions";

export function CarteDocument({
  id,
  titre,
  nomFichier,
  urlSignee,
  cheminFichier,
  peutEditer,
}: {
  id: string;
  titre: string;
  nomFichier: string | null;
  urlSignee: string | null;
  cheminFichier: string | null;
  peutEditer: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4">
      <div className="min-w-0">
        <span className="rounded-md bg-rof-royal-sombre px-1.5 py-0.5 font-condensed text-xs font-bold text-rof-or">PDF</span>
        <div className="mt-1 truncate font-condensed text-lg font-bold uppercase leading-tight text-white">{titre}</div>
        {nomFichier && <p className="truncate text-xs text-rof-gris">{nomFichier}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {urlSignee && (
          <a
            href={urlSignee}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg bg-rof-or px-3 py-2 font-condensed text-xs font-bold uppercase tracking-wide text-rof-noir"
          >
            Ouvrir
          </a>
        )}
        {peutEditer && (
          <form action={supprimerDocument}>
            <input type="hidden" name="content_id" value={id} />
            <input type="hidden" name="fichier_path" value={cheminFichier ?? ""} />
            <button type="submit" className="text-sm text-rof-rouge underline">
              Supprimer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
