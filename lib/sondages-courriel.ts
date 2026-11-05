// Contenu du courriel envoyé à la Direction à chaque réponse à un sondage.
// Module sans dépendance serveur : facile à tester seul.
import type { Sondage } from "./sondages";

const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

const dateFr = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-CA", { dateStyle: "long" });

export type ActionVote = { type: "choix"; option: string } | { type: "dates"; dates: string[] } | { type: "retrait" };

export function courrielSondage(s: Sondage, nom: string, action: ActionVote) {
  const resume =
    action.type === "choix"
      ? `a voté « ${action.option} »`
      : action.type === "dates"
        ? `a indiqué : ${action.dates.map(dateFr).join(", ")}`
        : "a retiré sa réponse";

  let resultats: string;
  if (s.kind === "date") {
    resultats = s.dates.length
      ? `<table style="border-collapse:collapse;font-size:14px">${s.dates
          .map(
            (d) =>
              `<tr><td style="padding:4px 14px 4px 0"><b>${esc(dateFr(d.date))}</b></td><td style="padding:4px 0;color:#555">${esc(d.nom)}</td></tr>`,
          )
          .join("")}</table>`
      : "<p>Aucune date pour le moment.</p>";
  } else {
    resultats = `<table style="border-collapse:collapse;font-size:14px">${s.options
      .map((o) => {
        const pct = s.total ? Math.round((o.votes / s.total) * 100) : 0;
        const noms = s.votants.filter((v) => v.optionId === o.id).map((v) => v.nom);
        return `<tr><td style="padding:6px 14px 2px 0"><b>${esc(o.label)}</b></td><td style="padding:6px 0 2px 0">${o.votes} vote${o.votes > 1 ? "s" : ""} (${pct} %)</td></tr>${
          noms.length ? `<tr><td colspan="2" style="padding:0 0 4px 0;color:#555;font-size:13px">${esc(noms.join(", "))}</td></tr>` : ""
        }`;
      })
      .join("")}</table><p style="color:#555">${s.total} vote${s.total > 1 ? "s" : ""} au total</p>`;
  }

  const html =
    `<div style="font-family:Arial,sans-serif;color:#111;max-width:560px;line-height:1.5">` +
    `<div style="background:#000;color:#fff;padding:16px 20px"><div style="color:#D9B44A;font-size:12px;letter-spacing:2px">ROF CONNECT · SONDAGE</div>` +
    `<div style="font-size:19px;font-weight:bold;margin-top:4px">${esc(s.title)}</div></div>` +
    `<div style="padding:16px 20px;border:1px solid #ddd;border-top:0">` +
    `<p><b>${esc(nom)}</b> ${esc(resume)}.</p>` +
    `<p style="margin-bottom:6px"><b>Résultats à jour</b></p>${resultats}` +
    `</div></div>`;

  return { subject: `Sondage « ${s.title} » : ${nom} ${resume}`, html };
}
