import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { idGameChanger, lienGameChanger } from "@/lib/site-v2/donnees";

const FICHIER = "lfjmq.json"; // bucket privé « media » : classement, résumés et liens de la page LFJMQ (aucune migration nécessaire)

export type LigneClassement = { equipe: string; j: number; v: number; d: number; n: number; pts: number };
export type Division = { nom: string; lignes: LigneClassement[] };
export type Resume = {
  id: string;
  date: string; // AAAA-MM-JJ
  titre: string;
  fr: string; // texte affiché sur le site
  en: string; // texte original GameChanger (gardé pour référence, jamais affiché)
  lien: string; // lien vers le match sur GameChanger (facultatif)
};
export type DonneesLfjmq = {
  maj: string | null; // dernière mise à jour du classement (ISO)
  widgetId: string; // calendrier GameChanger de la ligue ou de l'équipe (facultatif)
  lienClassement: string; // page du classement sur GameChanger (facultatif)
  lienHoraire: string; // page de l'horaire sur GameChanger (facultatif)
  divisions: Division[];
  resumes: Resume[];
};

export const VIDE: DonneesLfjmq = { maj: null, widgetId: "", lienClassement: "", lienHoraire: "", divisions: [], resumes: [] };

/**
 * La page est préparée mais cachée : elle n'est visible en production que si la variable d'environnement LFJMQ_PUBLIC vaut « 1 ».
 * En développement, elle est toujours visible.
 */
export function lfjmqPublie() {
  return process.env.NODE_ENV !== "production" || process.env.LFJMQ_PUBLIC === "1";
}

export async function chargerLfjmq(): Promise<DonneesLfjmq> {
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return VIDE;
  try {
    const o = JSON.parse(await data.text());
    return {
      maj: typeof o.maj === "string" ? o.maj : null,
      widgetId: idGameChanger(o.widgetId),
      lienClassement: lienGameChanger(o.lienClassement),
      lienHoraire: lienGameChanger(o.lienHoraire),
      divisions: Array.isArray(o.divisions) ? o.divisions : [],
      resumes: Array.isArray(o.resumes) ? o.resumes : [],
    };
  } catch {
    return VIDE;
  }
}

export async function sauverLfjmq(d: DonneesLfjmq) {
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(d)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}

/**
 * Texte → divisions. Une ligne « # 18U » ouvre une division ; chaque ligne suivante : Équipe ; J ; V ; D ; N ; PTS
 * (séparateurs : point-virgule, tabulation ou virgule, donc un tableau copié depuis GameChanger fonctionne).
 * Sans la colonne PTS, les points sont calculés : 2 par victoire, 1 par nulle.
 */
export function lireClassement(texte: string): Division[] {
  const divisions: Division[] = [];
  let courante: Division | null = null;
  for (const brut of texte.split(/\r?\n/)) {
    const ligne = brut.trim();
    if (!ligne) continue;
    if (ligne.startsWith("#")) {
      courante = { nom: ligne.replace(/^#+\s*/, "").slice(0, 40), lignes: [] };
      divisions.push(courante);
      continue;
    }
    const c = ligne.split(/[;\t]|,(?=\s*\d)/).map((x) => x.trim());
    if (c.length < 4 || !c[0]) continue;
    if (!courante) {
      courante = { nom: "Classement", lignes: [] };
      divisions.push(courante);
    }
    const nb = (i: number) => {
      const n = Number(String(c[i] ?? "").replace(",", "."));
      return Number.isFinite(n) ? n : 0;
    };
    const v = nb(2), n = nb(4);
    courante.lignes.push({ equipe: c[0].slice(0, 60), j: nb(1), v, d: nb(3), n, pts: c[5] !== undefined && c[5] !== "" ? nb(5) : v * 2 + n });
  }
  return divisions;
}

export function texteClassement(divisions: Division[]): string {
  return divisions.map((d) => [`# ${d.nom}`, ...d.lignes.map((l) => [l.equipe, l.j, l.v, l.d, l.n, l.pts].join(";"))].join("\n")).join("\n\n");
}

/** Données fictives pour l'aperçu (?demo=1), disponibles seulement en développement. Rien n'est enregistré. */
const DEMO: DonneesLfjmq = {
  maj: new Date().toISOString(),
  widgetId: "",
  lienHoraire: "https://web.gc.com",
  lienClassement: "https://web.gc.com",
  divisions: [
    {
      nom: "18U",
      lignes: [
        { equipe: "Royal On Field", j: 10, v: 8, d: 2, n: 0, pts: 16 },
        { equipe: "Équipe exemple A", j: 10, v: 6, d: 4, n: 0, pts: 12 },
        { equipe: "Équipe exemple B", j: 10, v: 3, d: 6, n: 1, pts: 7 },
        { equipe: "Équipe exemple C", j: 10, v: 2, d: 8, n: 0, pts: 4 },
      ],
    },
  ],
  resumes: [
    { id: "1", date: "2026-11-14", titre: "Royal 5, Équipe exemple A 3", fr: "Une grosse quatrième manche a permis à Royal de prendre les devants. La lanceuse a retiré sept frappeuses sur des prises.", en: "", lien: "https://web.gc.com" },
    { id: "2", date: "2026-11-07", titre: "Équipe exemple B 2, Royal 6", fr: "Royal a frappé quatre doubles et a gardé l'avance du début à la fin.", en: "", lien: "" },
  ],
};

export async function donneesLfjmq(demo: boolean): Promise<DonneesLfjmq> {
  return demo && process.env.NODE_ENV !== "production" ? DEMO : chargerLfjmq();
}
