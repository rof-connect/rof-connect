/**
 * Contenu de la saison 2026 de la LFJMQ (Division 1), fourni par la Direction.
 * Source des statistiques : GameChanger.
 */

export type EquipeClassement = { nom: string; v: number; d: number; n: number; pct: string; ecart: string; pm: number; champ?: boolean };

export const CLASSEMENT_D1: EquipeClassement[] = [
  { nom: "Force", v: 11, d: 6, n: 1, pct: ".639", ecart: "—", pm: 126 },
  { nom: "Golden Crown", v: 12, d: 7, n: 0, pct: ".632", ecart: "—", pm: 115, champ: true },
  { nom: "Dominion", v: 8, d: 8, n: 2, pct: ".500", ecart: "2,5", pm: 99 },
  { nom: "Dynastie", v: 5, d: 9, n: 4, pct: ".389", ecart: "4,5", pm: 98 },
  { nom: "Impérial", v: 6, d: 12, n: 1, pct: ".342", ecart: "5,5", pm: 88 },
];

export type FicheEquipe = { nom: string; sigle: string; rang: number; v: number; d: number; n: number; pct: string; pm: number; champ?: boolean; bat: [string, string]; pit: [string, string] };

export const EQUIPES_D1: FicheEquipe[] = [
  { nom: "Force", sigle: "FO", rang: 1, v: 11, d: 6, n: 1, pct: ".639", pm: 126, bat: ["Rosie D'Andrieu", "18 PP · 1re de la ligue"], pit: ["Kassandra Turmel", "81 RB · 3,72 MPM"] },
  { nom: "Golden Crown", sigle: "GC", rang: 2, v: 12, d: 7, n: 0, pct: ".632", pm: 115, champ: true, bat: ["Laurence Dupont", ".478 · 2 CC"], pit: ["Beatrice Vezina", "1,34 MPM · 82 RB"] },
  { nom: "Dominion", sigle: "DO", rang: 3, v: 8, d: 8, n: 2, pct: ".500", pm: 99, bat: ["Angelica Passarelli", ".462 · 6 doubles"], pit: ["Alyssa Thibeault", "39 RB · 4,43 MPM"] },
  { nom: "Dynastie", sigle: "DY", rang: 4, v: 5, d: 9, n: 4, pct: ".389", pm: 98, bat: ["Kellyane Hache", ".523 · 1re de la ligue"], pit: ["Alysson Tanguay Malcomber", "41 RB"] },
  { nom: "Impérial", sigle: "IM", rang: 5, v: 6, d: 12, n: 1, pct: ".342", pm: 88, bat: ["Tekeya Buckley", ".375 · 15 CS"], pit: ["Estelle Dionne", "20 RB · 5,83 MPM"] },
];

export type Meneuses = { titre: string; sous?: string; lignes: [string, string, string][] };

export const MENEUSES_ATTAQUE: Meneuses[] = [
  { titre: "Moyenne au bâton", lignes: [["Kellyane Hache", "Dynastie", ".523"], ["Alexia Gagliano", "Force", ".520"], ["Laurence Dupont", "Golden Crown", ".478"], ["Angelica Passarelli", "Dominion", ".462"], ["Rosie D'Andrieu", "Force", ".459"]] },
  { titre: "OPS", sous: "Présence + puissance", lignes: [["Alexia Gagliano", "Force", "1,407"], ["Rosie D'Andrieu", "Force", "1,389"], ["Laurence Dupont", "Golden Crown", "1,349"], ["Angelica Passarelli", "Dominion", "1,332"], ["Lily Kirlin", "Golden Crown", "1,312"]] },
  { titre: "Points produits", lignes: [["Rosie D'Andrieu", "Force", "18"], ["Kendra Crompton", "Force", "14"], ["Alyssa Thibeault", "Dominion", "14"], ["Rosalie Paquette", "Golden Crown", "12"], ["Laurence Dupont", "Golden Crown", "11"]] },
  { titre: "Coups sûrs", lignes: [["Kellyane Hache", "Dynastie", "23"], ["Rosie D'Andrieu", "Force", "17"], ["Adele Dostaler", "Force", "17"], ["Eve Beaudoin", "Force", "17"], ["Maika Larrivee", "Dominion", "16"]] },
];

export const MENEUSES_MONTICULE: Meneuses[] = [
  { titre: "Moyenne de points mérités", lignes: [["Beatrice Vezina", "Golden Crown", "1,34"], ["Kassandra Turmel", "Force", "3,72"], ["Alice Rochon", "Force", "4,04"], ["Alyssa Thibeault", "Dominion", "4,43"], ["Lexy Launière", "Dominion", "4,58"]] },
  { titre: "Retraits au bâton", lignes: [["Beatrice Vezina", "Golden Crown", "82"], ["Kassandra Turmel", "Force", "81"], ["Alysson Tanguay Malcomber", "Dynastie", "41"], ["Alyssa Thibeault", "Dominion", "39"], ["Arielle Prescott", "Golden Crown", "32"]] },
  { titre: "WHIP", sous: "Coureuses allouées par manche", lignes: [["Beatrice Vezina", "Golden Crown", "0,86"], ["Kassandra Turmel", "Force", "1,64"], ["Alyssa Thibeault", "Dominion", "1,67"], ["Alice Rochon", "Force", "1,77"], ["Lexy Launière", "Dominion", "1,85"]] },
  { titre: "Coups de plus d'un but", sous: "Doubles + triples + circuits", lignes: [["Rosie D'Andrieu", "Force", "9"], ["Eve Beaudoin", "Force", "8"], ["Angelica Passarelli", "Dominion", "7"], ["Lily Kirlin", "Golden Crown", "6"], ["Virginie Bluteau", "Golden Crown", "6"]] },
];

export const LIGNES_FINALE: [string, string][] = [
  ["Beatrice Vezina", "6 MN · 3 CS · 0 P · 9 RB · 1 BB"],
  ["Rosalie Paquette", "1 en 3 · triple · 3 PP"],
  ["Arielle Prescott", "1 MN · 0 CS · 1 RB · dernier retrait"],
  ["Kassandra Turmel", "6,1 MN · 8 CS · 4 P · 6 RB"],
];

export const CHIFFRES: [string, string][] = [
  ["5", "équipes en Division 1"],
  ["46", "matchs de saison régulière"],
  ["526", "points marqués"],
  ["82", "retraits au bâton pour Beatrice Vezina, meilleure de la ligue"],
];

export const DIVISIONS = [
  { cle: "d1", nom: "Division 1", niveau: "Junior majeur", points: ["5 équipes", "Saison 2026 complétée", "Championnes : Golden Crown"], lien: { href: "/lfjmq#classement", texte: "Voir le classement" } },
  { cle: "d2", nom: "Division 2", niveau: "14U", points: ["Saison 2027 : mai à septembre", "Tournoi de printemps en mai", "Inscriptions ouvertes"], lien: { href: "/lfjmq/inscription", texte: "Inscrire une équipe" } },
  { cle: "d3", nom: "Division 3", niveau: "12U", points: ["Saison 2027 : mai à septembre", "Tournoi de printemps en mai", "Inscriptions ouvertes"], lien: { href: "/lfjmq/inscription", texte: "Inscrire une équipe" } },
] as const;

/** Résultats affichés dans la bande du haut quand le widget GameChanger de la division n'est pas encore branché. */
export const RESULTATS: Record<string, { st: string; d: string; a: [string, number]; b: [string, number] }[]> = {
  d1: [{ st: "Finale", d: "2026", a: ["Golden Crown", 4], b: ["Force", 0] }],
  d2: [],
  d3: [],
};

export const OPTIONS_DIVISION = [
  { cle: "d1", nom: "Division 1" },
  { cle: "d2", nom: "Division 2 · 14U" },
  { cle: "d3", nom: "Division 3 · 12U" },
];
