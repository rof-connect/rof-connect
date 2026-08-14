"use client";

import { useState } from "react";
import { supprimerContenu } from "@/app/membres/[section]/actions";
import type { SectionConfig } from "@/lib/section-config";

export function CarteContenu({
  slug,
  kind,
  id,
  index,
  titre,
  body,
  peutEditer,
}: {
  slug: string;
  kind: SectionConfig["kind"];
  id: string;
  index: number;
  titre: string;
  body: Record<string, string>;
  peutEditer: boolean;
}) {
  const boutonSupprimer = peutEditer && (
    <form action={supprimerContenu} className="mt-3 text-right">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="content_id" value={id} />
      <button type="submit" className="text-sm text-rof-rouge underline">
        Supprimer
      </button>
    </form>
  );

  if (kind === "signal") {
    return <CarteSignal titre={titre} body={body} boutonSupprimer={boutonSupprimer} />;
  }

  if (kind === "relay") {
    return (
      <div className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <div className="font-condensed text-xl font-bold uppercase leading-tight text-white">{titre}</div>
        <div className="mt-2 grid gap-2">
          {[
            ["Relayeur", body.relayeur],
            ["Coupeur (cut-off)", body.coupeur],
            ["Couvertures", body.couvertures],
          ]
            .filter(([, v]) => v)
            .map(([l, v]) => (
              <div key={l} className="rounded-lg bg-rof-craie px-3 py-2">
                <div className="font-condensed text-xs font-bold uppercase tracking-wide text-rof-gazon">{l}</div>
                <div className="text-base text-rof-texte">{v}</div>
              </div>
            ))}
          {body.note && <p className="text-sm italic text-rof-gris">{body.note}</p>}
        </div>
        {boutonSupprimer}
      </div>
    );
  }

  if (kind === "video") {
    return (
      <div className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <div className="font-condensed text-xl font-bold uppercase leading-tight text-white">{titre}</div>
        {body.categorie && <div className="mt-0.5 text-sm text-rof-gris">{body.categorie}</div>}
        {body.note && <p className="mt-2 text-base text-rof-texte">{body.note}</p>}
        <a
          href={body.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-lg bg-rof-royal px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wider text-white"
        >
          ▶ Regarder la vidéo
        </a>
        {boutonSupprimer}
      </div>
    );
  }

  if (kind === "gamechanger") {
    return (
      <div className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
        <span className="rounded-md bg-rof-royal-sombre px-1.5 py-0.5 font-condensed text-xs font-bold text-rof-or">GC</span>
        <div className="mt-1 font-condensed text-xl font-bold uppercase leading-tight text-white">{titre}</div>
        {body.note && <p className="mt-2 text-sm text-rof-texte">{body.note}</p>}
        {!body.widgetId && (
          <div className="mt-3 rounded-lg bg-rof-craie px-4 py-5 text-sm text-rof-gris">
            {body.url ? "Lien d'équipe — touche le bouton ci-dessous pour ouvrir GameChanger." : "Aucun widget ni lien enregistré."}
          </div>
        )}
        {body.widgetId && (
          <div className="mt-3 rounded-lg bg-rof-craie px-4 py-5 text-sm text-rof-gris">
            Identifiant widget : {body.widgetId} — le tableau GameChanger s&apos;affichera une fois le domaine déclaré auprès de GameChanger.
          </div>
        )}
        {body.url && (
          <a
            href={body.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-block rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wider text-rof-noir"
          >
            Ouvrir dans GameChanger ↗
          </a>
        )}
        {boutonSupprimer}
      </div>
    );
  }

  // plan (par défaut)
  return (
    <div className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
      <div className="font-condensed text-xl font-bold uppercase leading-tight text-white">{titre}</div>
      <div className="mt-0.5 text-sm text-rof-gris">
        {body.date} {body.focus ? `· ${body.focus}` : ""}
      </div>
      {body.contenu && <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed text-rof-texte">{body.contenu}</p>}
      {boutonSupprimer}
    </div>
  );
}

function CarteSignal({
  titre,
  body,
  boutonSupprimer,
}: {
  titre: string;
  body: Record<string, string>;
  boutonSupprimer: React.ReactNode;
}) {
  const [revele, setRevele] = useState(false);
  return (
    <div className={`w-full rounded-xl border border-rof-marine2 p-4 text-left ${revele ? "bg-rof-marine2" : "bg-rof-royal-sombre"}`}>
      <button onClick={() => setRevele(!revele)} className="flex w-full items-center justify-between gap-2">
        <div className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-or">{titre}</div>
      </button>
      {revele ? (
        <div className="mt-2">
          <div className="whitespace-pre-wrap text-base leading-relaxed text-white">{body.sequence}</div>
          {body.note && <p className="mt-2 text-sm italic text-rof-gris">{body.note}</p>}
          <button onClick={() => setRevele(false)} className="mt-2 font-condensed text-xs uppercase tracking-wide text-rof-poudre">
            Touche pour masquer
          </button>
        </div>
      ) : (
        <button onClick={() => setRevele(true)} className="mt-2 font-condensed text-sm uppercase tracking-wide text-rof-poudre">
          🔒 Touche pour révéler
        </button>
      )}
      {revele && boutonSupprimer}
    </div>
  );
}
