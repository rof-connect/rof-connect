/**
 * Contenu de la saison 2026 de la LFJMQ (Division 1), fourni par la Direction. Source des statistiques : GameChanger.
 * Chaque texte a une version française (fr) et anglaise (en). Les décimales sont écrites à la française (virgule) ;
 * `dec(lang, valeur)` les convertit en point pour l'anglais.
 */

export type Lang = "fr" | "en";
export type Bi = { fr: string; en: string };

/** Décimales : virgule en français, point en anglais. */
export const dec = (lang: Lang, v: string) => (lang === "en" ? v.replace(",", ".") : v);

export type EquipeClassement = { nom: string; v: number; d: number; n: number; pct: string; ecart: string; pm: number; champ?: boolean };

export const CLASSEMENT_D1: EquipeClassement[] = [
  { nom: "Force", v: 11, d: 6, n: 1, pct: ".639", ecart: "—", pm: 126 },
  { nom: "Golden Crown", v: 12, d: 7, n: 0, pct: ".632", ecart: "—", pm: 115, champ: true },
  { nom: "Dominion", v: 8, d: 8, n: 2, pct: ".500", ecart: "2,5", pm: 99 },
  { nom: "Dynastie", v: 5, d: 9, n: 4, pct: ".389", ecart: "4,5", pm: 98 },
  { nom: "Impérial", v: 6, d: 12, n: 1, pct: ".342", ecart: "5,5", pm: 88 },
];

export type FicheEquipe = { nom: string; sigle: string; rang: number; v: number; d: number; n: number; pct: string; pm: number; champ?: boolean; bat: [string, Bi]; pit: [string, Bi] };

export const EQUIPES_D1: FicheEquipe[] = [
  { nom: "Force", sigle: "FO", rang: 1, v: 11, d: 6, n: 1, pct: ".639", pm: 126, bat: ["Rosie D'Andrieu", { fr: "18 PP · 1re de la ligue", en: "18 RBI · 1st in the league" }], pit: ["Kassandra Turmel", { fr: "81 RB · 3,72 MPM", en: "81 K · 3.72 ERA" }] },
  { nom: "Golden Crown", sigle: "GC", rang: 2, v: 12, d: 7, n: 0, pct: ".632", pm: 115, champ: true, bat: ["Laurence Dupont", { fr: ".478 · 2 CC", en: ".478 · 2 HR" }], pit: ["Beatrice Vezina", { fr: "1,34 MPM · 82 RB", en: "1.34 ERA · 82 K" }] },
  { nom: "Dominion", sigle: "DO", rang: 3, v: 8, d: 8, n: 2, pct: ".500", pm: 99, bat: ["Angelica Passarelli", { fr: ".462 · 6 doubles", en: ".462 · 6 doubles" }], pit: ["Alyssa Thibeault", { fr: "39 RB · 4,43 MPM", en: "39 K · 4.43 ERA" }] },
  { nom: "Dynastie", sigle: "DY", rang: 4, v: 5, d: 9, n: 4, pct: ".389", pm: 98, bat: ["Kellyane Hache", { fr: ".523 · 1re de la ligue", en: ".523 · 1st in the league" }], pit: ["Alysson Tanguay Malcomber", { fr: "41 RB", en: "41 K" }] },
  { nom: "Impérial", sigle: "IM", rang: 5, v: 6, d: 12, n: 1, pct: ".342", pm: 88, bat: ["Tekeya Buckley", { fr: ".375 · 15 CS", en: ".375 · 15 H" }], pit: ["Estelle Dionne", { fr: "20 RB · 5,83 MPM", en: "20 K · 5.83 ERA" }] },
];

export type Meneuses = { titre: Bi; sous?: Bi; lignes: [string, string, string][] };

export const MENEUSES_ATTAQUE: Meneuses[] = [
  { titre: { fr: "Moyenne au bâton", en: "Batting average" }, lignes: [["Kellyane Hache", "Dynastie", ".523"], ["Alexia Gagliano", "Force", ".520"], ["Laurence Dupont", "Golden Crown", ".478"], ["Angelica Passarelli", "Dominion", ".462"], ["Rosie D'Andrieu", "Force", ".459"]] },
  { titre: { fr: "OPS", en: "OPS" }, sous: { fr: "Présence + puissance", en: "On-base + slugging" }, lignes: [["Alexia Gagliano", "Force", "1,407"], ["Rosie D'Andrieu", "Force", "1,389"], ["Laurence Dupont", "Golden Crown", "1,349"], ["Angelica Passarelli", "Dominion", "1,332"], ["Lily Kirlin", "Golden Crown", "1,312"]] },
  { titre: { fr: "Points produits", en: "Runs batted in" }, lignes: [["Rosie D'Andrieu", "Force", "18"], ["Kendra Crompton", "Force", "14"], ["Alyssa Thibeault", "Dominion", "14"], ["Rosalie Paquette", "Golden Crown", "12"], ["Laurence Dupont", "Golden Crown", "11"]] },
  { titre: { fr: "Coups sûrs", en: "Hits" }, lignes: [["Kellyane Hache", "Dynastie", "23"], ["Rosie D'Andrieu", "Force", "17"], ["Adele Dostaler", "Force", "17"], ["Eve Beaudoin", "Force", "17"], ["Maika Larrivee", "Dominion", "16"]] },
];

export const MENEUSES_MONTICULE: Meneuses[] = [
  { titre: { fr: "Moyenne de points mérités", en: "Earned run average" }, lignes: [["Beatrice Vezina", "Golden Crown", "1,34"], ["Kassandra Turmel", "Force", "3,72"], ["Alice Rochon", "Force", "4,04"], ["Alyssa Thibeault", "Dominion", "4,43"], ["Lexy Launière", "Dominion", "4,58"]] },
  { titre: { fr: "Retraits au bâton", en: "Strikeouts" }, lignes: [["Beatrice Vezina", "Golden Crown", "82"], ["Kassandra Turmel", "Force", "81"], ["Alysson Tanguay Malcomber", "Dynastie", "41"], ["Alyssa Thibeault", "Dominion", "39"], ["Arielle Prescott", "Golden Crown", "32"]] },
  { titre: { fr: "WHIP", en: "WHIP" }, sous: { fr: "Coureuses allouées par manche", en: "Baserunners allowed per inning" }, lignes: [["Beatrice Vezina", "Golden Crown", "0,86"], ["Kassandra Turmel", "Force", "1,64"], ["Alyssa Thibeault", "Dominion", "1,67"], ["Alice Rochon", "Force", "1,77"], ["Lexy Launière", "Dominion", "1,85"]] },
  { titre: { fr: "Coups de plus d'un but", en: "Extra-base hits" }, sous: { fr: "Doubles + triples + circuits", en: "Doubles + triples + home runs" }, lignes: [["Rosie D'Andrieu", "Force", "9"], ["Eve Beaudoin", "Force", "8"], ["Angelica Passarelli", "Dominion", "7"], ["Lily Kirlin", "Golden Crown", "6"], ["Virginie Bluteau", "Golden Crown", "6"]] },
];

export const LIGNES_FINALE: [string, Bi][] = [
  ["Beatrice Vezina", { fr: "6 MN · 3 CS · 0 P · 9 RB · 1 BB", en: "6 IP · 3 H · 0 R · 9 K · 1 BB" }],
  ["Rosalie Paquette", { fr: "1 en 3 · triple · 3 PP", en: "1-for-3 · triple · 3 RBI" }],
  ["Arielle Prescott", { fr: "1 MN · 0 CS · 1 RB · dernier retrait", en: "1 IP · 0 H · 1 K · final out" }],
  ["Kassandra Turmel", { fr: "6,1 MN · 8 CS · 4 P · 6 RB", en: "6.1 IP · 8 H · 4 R · 6 K" }],
];

export const DIVISIONS: { cle: string; nom: Bi; niveau: Bi; points: { fr: string[]; en: string[] }; lien: "classement" | "inscription" }[] = [
  {
    cle: "d1",
    nom: { fr: "Division 1", en: "Division 1" },
    niveau: { fr: "Junior majeur", en: "Junior major" },
    points: { fr: ["5 équipes", "Saison 2026 complétée", "Championnes : Golden Crown"], en: ["5 teams", "2026 season complete", "Champions: Golden Crown"] },
    lien: "classement",
  },
  {
    cle: "d2",
    nom: { fr: "Division 2", en: "Division 2" },
    niveau: { fr: "15U", en: "15U" },
    points: { fr: ["Saison 2027 : mai à septembre", "Tournoi de printemps en mai", "Inscriptions ouvertes"], en: ["2027 season: May to September", "Spring tournament in May", "Registration open"] },
    lien: "inscription",
  },
  {
    cle: "d3",
    nom: { fr: "Division 3", en: "Division 3" },
    niveau: { fr: "13U", en: "13U" },
    points: { fr: ["Saison 2027 : mai à septembre", "Tournoi de printemps en mai", "Inscriptions ouvertes"], en: ["2027 season: May to September", "Spring tournament in May", "Registration open"] },
    lien: "inscription",
  },
];

/** Résultats affichés dans la bande du haut quand le widget GameChanger de la division n'est pas encore branché. */
export const RESULTATS: Record<string, { st: Bi; d: string; a: [string, number]; b: [string, number] }[]> = {
  d1: [{ st: { fr: "Finale", en: "Final" }, d: "2026", a: ["Golden Crown", 4], b: ["Force", 0] }],
  d2: [],
  d3: [],
};

export const OPTIONS_DIVISION: { cle: string; nom: Bi }[] = [
  { cle: "d1", nom: { fr: "Division 1", en: "Division 1" } },
  { cle: "d2", nom: { fr: "Division 2 · 15U", en: "Division 2 · 15U" } },
  { cle: "d3", nom: { fr: "Division 3 · 13U", en: "Division 3 · 13U" } },
];
