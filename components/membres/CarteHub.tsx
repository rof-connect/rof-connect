import Link from "next/link";

export function CarteHub({
  href,
  titre,
  description,
  bientot,
}: {
  href?: string;
  titre: string;
  description: string;
  bientot?: string;
}) {
  const contenu = (
    <>
      <div className="min-w-0">
        <p className="font-condensed text-lg font-semibold uppercase text-rof-texte">{titre}</p>
        <p className="text-sm text-rof-gris">{description}</p>
      </div>
      {bientot ? (
        <span className="shrink-0 rounded-full border border-rof-or px-2 py-0.5 font-condensed text-[11px] uppercase tracking-wide text-rof-or">
          {bientot}
        </span>
      ) : (
        <span aria-hidden="true" className="shrink-0 text-xl text-rof-poudre">›</span>
      )}
    </>
  );
  const classes = "flex items-center justify-between gap-3 rounded-xl border border-rof-ligne bg-rof-blanc p-4";
  return href && !bientot ? (
    <Link href={href} className={`${classes} transition-colors hover:border-rof-poudre`}>
      {contenu}
    </Link>
  ) : (
    <div className={`${classes} opacity-70`}>{contenu}</div>
  );
}
