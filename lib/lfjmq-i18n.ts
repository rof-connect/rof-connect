import type { Metadata } from "next";
import type { Lang } from "@/lib/lfjmq-saison";

export const LANGS: Lang[] = ["fr", "en"];
export const estLang = (v: string): v is Lang => v === "fr" || v === "en";

export type Page = "equipes" | "meneuses" | "finale" | "divisions" | "inscription";

/** Adresses publiques : /lfjmq/equipes (français) et /lfjmq/en/teams (anglais). */
const SLUG: Record<Page, Record<Lang, string>> = {
  equipes: { fr: "equipes", en: "teams" },
  meneuses: { fr: "meneuses", en: "leaders" },
  finale: { fr: "finale", en: "final" },
  divisions: { fr: "divisions", en: "divisions" },
  inscription: { fr: "inscription", en: "register" },
};

export function adresse(lang: Lang, page?: Page, ancre?: string) {
  const base = lang === "en" ? "/lfjmq/en" : "/lfjmq";
  return base + (page ? "/" + SLUG[page][lang] : "") + (ancre ? "#" + ancre : "");
}

/** Même page dans l'autre langue (pour le bouton FR / EN). */
export function adresseAutreLangue(lang: Lang, page?: Page) {
  return adresse(lang === "fr" ? "en" : "fr", page);
}

export const MAIL = "royal@lentrepotdubaseball.com";

type Dico = {
  htmlLang: string;
  marque: string;
  nav: { classement: string; equipes: string; meneuses: string; finale: string; divisions: string; inscrire: string; inscrireSuite: string; langue: string; langueLabel: string; aria: string };
  bande: { region: string; division: string; suivants: string; tous: string; aucun: string; debut: string };
  meta: { titre: string; description: string; equipes: [string, string]; meneuses: [string, string]; finale: [string, string]; divisions: [string, string]; inscription: [string, string] };
  accueil: {
    tag: string; h1: string; resume: string; imgAlt: string; scoreAria: string; scoreCols: [string, string, string, string];
    btnFinale: string; btnClassement: string; classementTitre: string; classementSous: string;
    cols: { equipe: string; v: string; d: string; n: string; pct: string; ecart: string; pm: string }; champions: string; legende: string;
    explorerTitre: string; explorer: { page: Page; titre: string; texte: string }[];
  };
  equipes: { titre: string; sous: string; rang: (n: number) => string; vdn: string; pm: string; bat: string; pit: string; champ: string };
  meneuses: { titre: string; sous: string; attaque: string; monticule: string; callout: string; calloutTexte: string };
  finale: { titre: string; sous: string; h3: string; lead: string; p: [string, string, string]; imgAlt: string; legende: string };
  divisions: { titre: string; sous: string; voirClassement: string; inscrire: string };
  inscription: {
    titre: string; lead: string; demander: string; voirDivisions: string; chip: string;
    regionsTitre: string; regionsSous: string; regions: { nom: string; texte: string }[];
    divisionsTitre: string; divisionsSous: string;
    formulesTitre: string; formules: { nom: string; texte: string }[];
    calendrierTitre: string; calendrier: { quand: string; quoi: string }[];
    etapesTitre: string; etapes: { titre: string; texte: string }[];
    finalTitre: string; finalTexte: string;
  };
  pied: { equipes: string; divisions: string; question: string; retour: string; descr: string; saison: string };
};

export const D: Record<Lang, Dico> = {
  fr: {
    htmlLang: "fr",
    marque: "Ligue Fastpitch Junior Majeur du Québec",
    nav: { classement: "Classement", equipes: "Équipes", meneuses: "Meneuses", finale: "Finale", divisions: "Divisions", inscrire: "Inscrire", inscrireSuite: " une équipe", langue: "EN", langueLabel: "English version", aria: "Navigation principale" },
    bande: { region: "Résultats récents", division: "Division", suivants: "Résultats suivants", tous: "Tous les résultats", aucun: "Aucun résultat pour l'instant. La saison commence en mai.", debut: "Saison 2027 : début en mai" },
    meta: {
      titre: "LFJMQ | Ligue Fastpitch Junior Majeur du Québec",
      description: "Classement, équipes, divisions et statistiques de la Ligue Fastpitch Junior Majeur du Québec. Golden Crown, championnes 2026.",
      equipes: ["Équipes | LFJMQ", "Les cinq équipes de la Division 1 de la LFJMQ : fiche 2026, meneuses au bâton et au monticule."],
      meneuses: ["Meneuses 2026 | LFJMQ", "Les meneuses de la saison 2026 de la LFJMQ à l'attaque et au monticule."],
      finale: ["La finale 2026 | LFJMQ", "Golden Crown blanchit Force 4 à 0 et remporte la finale 2026 de la LFJMQ."],
      divisions: ["Divisions | LFJMQ", "Les trois divisions de la LFJMQ : Division 1 (junior majeur), Division 2 (15U) et Division 3 (13U)."],
      inscription: ["Inscrire une équipe en 2027 | LFJMQ", "Inscris ton équipe à la LFJMQ en 2027 : équipes du Québec, de l'Ontario et des États-Unis, trois divisions, formules Événement et Saison."],
    },
    accueil: {
      tag: "Saison 2026 · Division 1",
      h1: "Golden Crown, championnes 2026",
      resume: "Blanchissage en finale : Beatrice Vezina et Arielle Prescott ont limité Force à trois coups sûrs.",
      imgAlt: "Les joueuses de Golden Crown posent avec la bannière Championnes LFJMQ 2026",
      scoreAria: "Pointage de la finale",
      scoreCols: ["Finale", "P", "CS", "E"],
      btnFinale: "Résumé de la finale",
      btnClassement: "Classement final",
      classementTitre: "Classement 2026",
      classementSous: "Saison régulière · Division 1",
      cols: { equipe: "Équipe", v: "V", d: "D", n: "N", pct: "PCT", ecart: "Écart", pm: "Points marqués" },
      champions: "Championnes",
      legende: "V : victoires · D : défaites · N : matchs nuls · PCT : pourcentage de victoires. Source : GameChanger.",
      explorerTitre: "Explorer la ligue",
      explorer: [
        { page: "equipes", titre: "Équipes", texte: "Les cinq équipes de la Division 1 et leurs meneuses" },
        { page: "meneuses", titre: "Meneuses", texte: "Au bâton et au monticule, saison 2026" },
        { page: "finale", titre: "La finale", texte: "Golden Crown 4, Force 0 : le résumé et la photo" },
        { page: "divisions", titre: "Divisions", texte: "Division 1, Division 2 (15U) et Division 3 (13U)" },
        { page: "inscription", titre: "Inscrire une équipe", texte: "Saison 2027 : Québec, Ontario et États-Unis" },
      ],
    },
    equipes: { titre: "Équipes", sous: "Division 1 · fiche 2026", rang: (n) => (n === 1 ? "1re au classement" : `${n}e au classement`), vdn: "V-D-N", pm: "Points marqués", bat: "Au bâton", pit: "Au monticule", champ: "Championnes 2026" },
    meneuses: {
      titre: "Meneuses 2026", sous: "Joueuses qualifiées selon GameChanger · saison complète", attaque: "À l'attaque", monticule: "Au monticule", callout: "1,34 · 82 RB · 0,86",
      calloutTexte: "Beatrice Vezina (Golden Crown) termine première de la ligue pour la moyenne de points mérités, les retraits au bâton et le WHIP.",
    },
    finale: {
      titre: "La finale", sous: "Golden Crown 4, Force 0", h3: "Golden Crown blanchit Force et soulève la bannière",
      lead: "Les deux meilleures équipes de la saison régulière se sont retrouvées en finale, et c'est le lancer qui a fait la différence.",
      p: [
        "Rosalie Paquette a donné le ton dès la première manche avec un triple qui a ouvert la marque. Frappeuse de quatrième, elle a terminé avec trois points produits. Virginie Bluteau et Laurence Dupont ont ajouté deux coups sûrs chacune, pour un total de neuf pour Golden Crown.",
        "Partante, Beatrice Vezina a lancé six manches sans accorder de point : trois coups sûrs, neuf retraits au bâton et un seul but sur balles. Arielle Prescott a fermé la porte en relève et a obtenu le dernier retrait sur un ballon d'Eve Beaudoin.",
        "Kassandra Turmel a tenu Force dans le match pendant six manches et un tiers, avec six retraits au bâton. Adele Dostaler, Gabriela Chacon et Eve Beaudoin ont frappé les trois coups sûrs de Force. Aucune des deux équipes n'a commis d'erreur.",
      ],
      imgAlt: "Les joueuses de Golden Crown et de Force réunies autour de la bannière après la finale",
      legende: "Golden Crown et Force réunies après la finale 2026.",
    },
    divisions: { titre: "Divisions", sous: "Trois niveaux de jeu, une seule ligue", voirClassement: "Voir le classement", inscrire: "Inscrire une équipe" },
    inscription: {
      titre: "Inscrire une équipe en 2027",
      lead: "La LFJMQ entame sa deuxième saison et ouvre la porte à de nouvelles équipes du Québec, de l'Ontario et des États-Unis.",
      demander: "Demander l'information",
      voirDivisions: "Voir les divisions",
      chip: "Formule payée à la présence",
      regionsTitre: "Qui peut s'inscrire",
      regionsSous: "Les équipes situées à moins de 3 heures de route sont les bienvenues.",
      regions: [
        { nom: "Québec", texte: "Des équipes de toute la province, à moins de 3 heures de route." },
        { nom: "Ontario", texte: "Les équipes ontariennes à moins de 3 heures de route sont les bienvenues." },
        { nom: "États-Unis", texte: "Les équipes américaines à moins de 3 heures de route sont les bienvenues." },
      ],
      divisionsTitre: "Trois divisions",
      divisionsSous: "Une division pour chaque niveau de jeu.",
      formulesTitre: "Deux formules",
      formules: [
        { nom: "Événement", texte: "Pour participer à un événement de la ligue, comme le tournoi de printemps en mai." },
        { nom: "Saison", texte: "Pour jouer toute la saison, de mai à août, jusqu'au tournoi de fin de saison et à la finale de septembre." },
      ],
      calendrierTitre: "Le calendrier 2027",
      calendrier: [
        { quand: "Mai", quoi: "Tournoi de printemps" },
        { quand: "Mai à août", quoi: "Saison régulière" },
        { quand: "Septembre", quoi: "Tournoi de fin de saison et finale" },
      ],
      etapesTitre: "Comment s'inscrire",
      etapes: [
        { titre: "Écris-nous", texte: "Envoie-nous un courriel pour recevoir l'information sur la saison 2027." },
        { titre: "Choisis ta division et ta formule", texte: "Division 1, 2 ou 3, en formule Événement ou Saison." },
        { titre: "Joue", texte: "Retrouve ton horaire, le classement et les résumés sur ce site." },
      ],
      finalTitre: "Prête à jouer en 2027?",
      finalTexte: "L'information est aussi offerte en anglais.",
    },
    pied: { equipes: "Équipes · Division 1", divisions: "Divisions", question: "Une question?", retour: "Royal On Field Softball", descr: "Ligue Fastpitch Junior Majeur du Québec", saison: "Saison 2026 : Golden Crown, championnes" },
  },
  en: {
    htmlLang: "en",
    marque: "Québec Major Junior Fastpitch League",
    nav: { classement: "Standings", equipes: "Teams", meneuses: "Leaders", finale: "Final", divisions: "Divisions", inscrire: "Register", inscrireSuite: " a team", langue: "FR", langueLabel: "Version française", aria: "Main navigation" },
    bande: { region: "Recent results", division: "Division", suivants: "Next results", tous: "All results", aucun: "No results yet. The season starts in May.", debut: "2027 season starts in May" },
    meta: {
      titre: "LFJMQ | Québec Major Junior Fastpitch League",
      description: "Standings, teams, divisions and stats of the Québec Major Junior Fastpitch League (LFJMQ). Golden Crown, 2026 champions.",
      equipes: ["Teams | LFJMQ", "The five Division 1 teams of the LFJMQ: 2026 profile, batting and pitching leaders."],
      meneuses: ["2026 Leaders | LFJMQ", "The 2026 LFJMQ season leaders at the plate and on the mound."],
      finale: ["2026 Final | LFJMQ", "Golden Crown shuts out Force 4-0 to win the 2026 LFJMQ final."],
      divisions: ["Divisions | LFJMQ", "The three LFJMQ divisions: Division 1 (junior major), Division 2 (15U) and Division 3 (13U)."],
      inscription: ["Register a team for 2027 | LFJMQ", "Register your team in the LFJMQ for 2027: teams from Québec, Ontario and the United States, three divisions, Event and Season formats."],
    },
    accueil: {
      tag: "2026 season · Division 1",
      h1: "Golden Crown, 2026 champions",
      resume: "A shutout in the final: Beatrice Vezina and Arielle Prescott held Force to three hits.",
      imgAlt: "Golden Crown players pose with the 2026 LFJMQ Champions banner",
      scoreAria: "Final score",
      scoreCols: ["Final", "R", "H", "E"],
      btnFinale: "Final recap",
      btnClassement: "Final standings",
      classementTitre: "2026 standings",
      classementSous: "Regular season · Division 1",
      cols: { equipe: "Team", v: "W", d: "L", n: "T", pct: "PCT", ecart: "GB", pm: "Runs scored" },
      champions: "Champions",
      legende: "W: wins · L: losses · T: ties · PCT: winning percentage · GB: games behind. Source: GameChanger.",
      explorerTitre: "Explore the league",
      explorer: [
        { page: "equipes", titre: "Teams", texte: "The five Division 1 teams and their leaders" },
        { page: "meneuses", titre: "Leaders", texte: "At the plate and on the mound, 2026 season" },
        { page: "finale", titre: "The final", texte: "Golden Crown 4, Force 0: the recap and the photo" },
        { page: "divisions", titre: "Divisions", texte: "Division 1, Division 2 (15U) and Division 3 (13U)" },
        { page: "inscription", titre: "Register a team", texte: "2027 season: Québec, Ontario and the United States" },
      ],
    },
    equipes: { titre: "Teams", sous: "Division 1 · 2026 profile", rang: (n) => `${n}${n === 1 ? "st" : n === 2 ? "nd" : n === 3 ? "rd" : "th"} in the standings`, vdn: "W-L-T", pm: "Runs scored", bat: "At the plate", pit: "On the mound", champ: "2026 champions" },
    meneuses: {
      titre: "2026 Leaders", sous: "Qualified players according to GameChanger · full season", attaque: "Offence", monticule: "Pitching", callout: "1.34 · 82 K · 0.86",
      calloutTexte: "Beatrice Vezina (Golden Crown) finishes first in the league in earned run average, strikeouts and WHIP.",
    },
    finale: {
      titre: "The final", sous: "Golden Crown 4, Force 0", h3: "Golden Crown shuts out Force and raises the banner",
      lead: "The two best teams of the regular season met in the final, and pitching made the difference.",
      p: [
        "Rosalie Paquette set the tone in the first inning with a triple that opened the scoring. Batting fourth, she finished with three runs batted in. Virginie Bluteau and Laurence Dupont added two hits each, for a total of nine for Golden Crown.",
        "Starting pitcher Beatrice Vezina threw six scoreless innings: three hits, nine strikeouts and only one walk. Arielle Prescott closed the door in relief and got the final out on a fly ball by Eve Beaudoin.",
        "Kassandra Turmel kept Force in the game for six and a third innings, with six strikeouts. Adele Dostaler, Gabriela Chacon and Eve Beaudoin hit Force's three hits. Neither team made an error.",
      ],
      imgAlt: "Golden Crown and Force players gathered around the banner after the final",
      legende: "Golden Crown and Force together after the 2026 final.",
    },
    divisions: { titre: "Divisions", sous: "Three levels of play, one league", voirClassement: "See the standings", inscrire: "Register a team" },
    inscription: {
      titre: "Register a team for 2027",
      lead: "The LFJMQ is starting its second season and opening the door to new teams from Québec, Ontario and the United States.",
      demander: "Request information",
      voirDivisions: "See the divisions",
      chip: "Pay-per-attendance format",
      regionsTitre: "Who can register",
      regionsSous: "Teams located within a 3-hour drive are welcome.",
      regions: [
        { nom: "Québec", texte: "Teams from across the province, within a 3-hour drive." },
        { nom: "Ontario", texte: "Ontario teams within a 3-hour drive are welcome." },
        { nom: "United States", texte: "American teams within a 3-hour drive are welcome." },
      ],
      divisionsTitre: "Three divisions",
      divisionsSous: "A division for every level of play.",
      formulesTitre: "Two formats",
      formules: [
        { nom: "Event", texte: "To take part in a league event, such as the spring tournament in May." },
        { nom: "Season", texte: "To play the full season, from May to August, through the end-of-season tournament and the September final." },
      ],
      calendrierTitre: "The 2027 calendar",
      calendrier: [
        { quand: "May", quoi: "Spring tournament" },
        { quand: "May to August", quoi: "Regular season" },
        { quand: "September", quoi: "End-of-season tournament and final" },
      ],
      etapesTitre: "How to register",
      etapes: [
        { titre: "Write to us", texte: "Send us an email to receive the information about the 2027 season." },
        { titre: "Choose your division and format", texte: "Division 1, 2 or 3, in the Event or Season format." },
        { titre: "Play", texte: "Find your schedule, the standings and the recaps on this site." },
      ],
      finalTitre: "Ready to play in 2027?",
      finalTexte: "Information is also available in French.",
    },
    pied: { equipes: "Teams · Division 1", divisions: "Divisions", question: "A question?", retour: "Royal On Field Softball", descr: "Québec Major Junior Fastpitch League", saison: "2026 season: Golden Crown, champions" },
  },
};

/** Page courante (d'après l'adresse affichée) → même page dans l'autre langue. */
export function adresseAutreLangueDepuis(pathname: string, lang: Lang) {
  const sans = pathname.replace(/^\/lfjmq\/?/, "").replace(/^en\/?/, "");
  const page = (Object.keys(SLUG) as Page[]).find((p) => SLUG[p][lang] === sans || SLUG[p].fr === sans || SLUG[p].en === sans);
  return adresseAutreLangue(lang, page);
}


/** Titre, description et lien vers l'autre langue (hreflang) d'une page. */
export function metaPage(lang: Lang, page?: Page): Metadata {
  const m = page ? D[lang].meta[page === "equipes" ? "equipes" : page] : null;
  const titre = m ? m[0] : D[lang].meta.titre;
  const description = m ? m[1] : D[lang].meta.description;
  return {
    title: { absolute: titre },
    description,
    alternates: { canonical: adresse(lang, page), languages: { fr: adresse("fr", page), en: adresse("en", page) } },
    openGraph: { title: titre, description, locale: lang === "fr" ? "fr_CA" : "en_CA" },
  };
}
