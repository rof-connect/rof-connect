import { Fragment } from "react";
import type { Sondage } from "@/lib/sondages";

const dateFr = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-CA", { dateStyle: "long" });

type Ligne = { sondage: string; reponse: string; nb: number; pct: number | null; noms: string };

function lignesDe(s: Sondage): Ligne[] {
  if (s.kind === "date") {
    const parDate = new Map<string, string[]>();
    s.dates.forEach((d) => parDate.set(d.date, [...(parDate.get(d.date) ?? []), d.nom]));
    return [...parDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, noms]) => ({ sondage: s.title, reponse: dateFr(date), nb: noms.length, pct: null, noms: noms.join(", ") }));
  }
  return s.options.map((o) => ({
    sondage: s.title,
    reponse: o.label,
    nb: o.votes,
    pct: s.total ? Math.round((o.votes / s.total) * 100) : 0,
    noms: s.votants
      .filter((v) => v.optionId === o.id)
      .map((v) => v.nom)
      .join(", "),
  }));
}

/** Tableau récapitulatif de tous les sondages (page Direction). */
export function TableauSondages({ sondages }: { sondages: Sondage[] }) {
  if (sondages.length === 0) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-rof-texte">Résultats des sondages</h2>
      <div className="overflow-x-auto rounded-xl border border-rof-ligne bg-rof-blanc">
        <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-rof-ligne text-xs uppercase tracking-wide text-rof-gris">
              <th className="px-3 py-2 font-semibold">Sondage</th>
              <th className="px-3 py-2 font-semibold">Réponse</th>
              <th className="px-3 py-2 text-right font-semibold">Total</th>
              <th className="px-3 py-2 text-right font-semibold">%</th>
              <th className="px-3 py-2 font-semibold">Qui</th>
            </tr>
          </thead>
          <tbody>
            {sondages.map((s) => {
              const lignes = lignesDe(s);
              const total = s.kind === "date" ? new Set(s.dates.map((d) => d.nom)).size : s.total;
              return (
                <Fragment key={s.id}>
                  {lignes.length === 0 && (
                    <tr>
                      <td className="px-3 py-2 font-semibold text-rof-texte">{s.title}</td>
                      <td className="px-3 py-2 text-rof-gris" colSpan={4}>
                        Aucune réponse
                      </td>
                    </tr>
                  )}
                  {lignes.map((l, i) => (
                    <tr key={i} className="align-top">
                      <td className="px-3 py-2 font-semibold text-rof-texte">{i === 0 ? l.sondage : ""}</td>
                      <td className="px-3 py-2 text-rof-texte">{l.reponse}</td>
                      <td className="px-3 py-2 text-right text-rof-or">{l.nb}</td>
                      <td className="px-3 py-2 text-right text-rof-gris">{l.pct === null ? "" : `${l.pct} %`}</td>
                      <td className="px-3 py-2 text-xs text-rof-gris">{l.noms || "—"}</td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="border-b border-rof-ligne px-3 pb-2 text-xs text-rof-gris">
                      {total} {s.kind === "date" ? "répondante" : "vote"}
                      {total > 1 ? "s" : ""} · {s.closed ? "Fermé" : "Ouvert"}
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
