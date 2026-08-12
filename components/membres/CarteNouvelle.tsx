import { supprimerNouvelle } from "@/app/membres/nouvelles/actions";

export function CarteNouvelle({
  id,
  titre,
  date,
  texte,
  photoSignedUrl,
  photoPath,
  videoUrl,
  peutEditer,
}: {
  id: string;
  titre: string;
  date: string | null;
  texte: string | null;
  photoSignedUrl: string | null;
  photoPath: string | null;
  videoUrl: string | null;
  peutEditer: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-rof-ligne bg-rof-blanc">
      {photoSignedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoSignedUrl} alt={titre} className="max-h-80 w-full object-cover" />
      )}
      <div className="p-4">
        {date && (
          <div className="font-condensed text-xs font-bold uppercase tracking-[0.1em] text-rof-poudre">{date}</div>
        )}
        <div className="font-condensed text-2xl font-bold uppercase leading-tight text-white">{titre}</div>
        {texte && <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-rof-texte">{texte}</p>}

        {videoUrl && (
          <a
            href={videoUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-lg bg-rof-royal px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wider text-white"
          >
            ▶ Voir la vidéo
          </a>
        )}

        {peutEditer && (
          <form action={supprimerNouvelle} className="mt-3 text-right">
            <input type="hidden" name="content_id" value={id} />
            <input type="hidden" name="photo_path" value={photoPath ?? ""} />
            <button type="submit" className="text-sm text-rof-rouge underline">
              Supprimer
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
