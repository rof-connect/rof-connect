// Contenu éditorial du nouveau site public (hors équipes : celles-ci viennent de ROF Connect).
export type Sport = "softball" | "baseball";

export const SPORTS: Sport[] = ["softball", "baseball"];

export function sportDe(valeur: string | undefined): Sport {
  return valeur === "baseball" ? "baseball" : "softball";
}

export type Evenement = { m: string; y: string; t: string; p: string; tag: string; hl?: boolean };
export type Palmares = { y: string; l: string[] };
export type Engagee = { who: string; s: string; m: string; c: string; photo?: string };

type Contenu = {
  mot: string; // « Softball » / « Baseball »
  kicker: string;
  accroche: string;
  saison: string;
  noteCalendrier: string;
  engagementsSous: string;
  lead: string;
  stats: [string, string][]; // chiffres fixes (les chiffres tirés de ROF Connect s'ajoutent)
  calendrier: Evenement[];
  palmares: Palmares[];
  engagees: Engagee[];
  videCalendrier: string;
  videPalmares: string;
  videEngagements: string;
};

// À confirmer par la Direction : calendrier 2027 et chiffres. Modifier ici, aucune autre étape.
export const CONTENU: Record<Sport, Contenu> = {
  softball: {
    mot: "Softball",
    kicker: "Royal Softball On Field · Repentigny, QC",
    accroche:
      "Le programme élite de softball de Lanaudière. Performance athlétique, parcours académique et caractère — de 10U jusqu'au collège américain.",
    saison: "Saison 2027",
    noteCalendrier: "Volet JV / Varsity",
    engagementsSous: "Elles ont signé.",
    lead: "De l'école primaire au collège américain : un chemin clair, un accompagnement personnalisé vers la NCAA, la NAIA et la NJCAA.",
    stats: [
      ["9", "Titres canadiens"],
      ["8", "Séries mondiales LL"],
      ["3", "Athlètes signées"],
    ],
    calendrier: [
      { m: "MAI", y: "2027", t: "Tournoi Maryland", p: "Maryland, États-Unis", tag: "JV / Varsity" },
      { m: "JUIN", y: "2027", t: "Alliance Softball Qualifier", p: "Syracuse, New York", tag: "Qualification", hl: true },
      { m: "JUIL", y: "2027", t: "PGF New Jersey", p: "New Jersey, États-Unis", tag: "Showcase" },
    ],
    palmares: [
      {
        y: "2026",
        l: [
          "Champion canadien Softball — 12U, 14U, 16U",
          "World Series Softball — 12U, 14U, 16U",
          "Champion de l'Est du Canada (Softball Canada)",
          "Champion Fastpitch Nation « Firecrackers » 16U",
        ],
      },
      { y: "2025", l: ["Champion canadien Softball — 12U, 14U, 16U", "World Series Softball — 12U, 14U, 16U"] },
      { y: "2024", l: ["Champion canadien Softball — 12U, 14U", "World Series Softball — 12U, 14U"] },
    ],
    engagees: [
      { who: "Maeva Gascon", s: "North Platte Community College", m: "NJCAA D1 · Nebraska", c: "2026", photo: "/photos/committed-maeva-gascon.jpg" },
      { who: "Julia Collard", s: "Dodge City Community College", m: "NJCAA D1 · Kansas", c: "2027", photo: "/photos/committed-julia-collard.jpg" },
      { who: "Béatrice Vézina", s: "Hill College", m: "NJCAA D1 · Texas", c: "2027", photo: "/photos/committed-hill-college.webp" },
    ],
    videCalendrier: "",
    videPalmares: "",
    videEngagements: "",
  },
  baseball: {
    mot: "Baseball",
    kicker: "Royal Baseball On Field · Repentigny, QC",
    accroche:
      "Le programme élite de baseball de Lanaudière. De 10U à Varsity, bâti sur le même standard Royal : travail, caractère, excellence.",
    saison: "Saison 2027",
    noteCalendrier: "Calendrier en préparation",
    engagementsSous: "Les prochains noms.",
    lead: "Le même parcours Royal, adapté au baseball : développement, exposition et accompagnement vers les programmes collégiaux américains.",
    stats: [["10U", "à Varsity"]],
    calendrier: [],
    palmares: [],
    engagees: [],
    videCalendrier: "Les tournois et showcases du programme baseball seront publiés ici dès qu'ils seront confirmés.",
    videPalmares: "Le palmarès du programme baseball sera ajouté ici.",
    videEngagements: "Les premiers engagements universitaires du programme baseball seront célébrés ici.",
  },
};

export const ETAPES = [
  { n: "01", t: "PSES", d: "5e et 6e année — les fondations : technique, plaisir du jeu et habitudes d'athlète." },
  { n: "02", t: "Collège L'Assomption", d: "Le secondaire : conciliation sport-études et développement structuré." },
  { n: "03", t: "JV / Varsity", d: "Le niveau vitrine : tournois aux États-Unis, préparation physique et exposition aux recruteurs." },
  { n: "04", t: "Collège américain", d: "La signature : parcours 12e année ou cégep, dossier, vidéos et contacts avec les entraîneurs." },
];

export const GALERIE: { src: string; alt: string }[] = [
  { src: "/photos/trio-sourire.jpg", alt: "Trois joueuses de Royal On Field posent ensemble devant le décor « Earn the Crown »" },
  { src: "/photos/receveuse.jpg", alt: "Gros plan sur le regard d'une receveuse sous son casque rouge" },
  { src: "/photos/canada.jpg", alt: "Une joueuse tient le chandail Canada numéro 8" },
  { src: "/photos/trio-fun.jpg", alt: "Trois joueuses de Royal On Field s'amusent devant le décor de l'académie" },
  { src: "/photos/galerie-01.jpg", alt: "Une jeune lanceuse tend une balle de softball vers la caméra" },
];

export const PARTENAIRES: { nom: string; src?: string }[] = [
  { nom: "Little League Canada", src: "/partenaires/little-league.jpg" },
  { nom: "USA Softball", src: "/partenaires/usa-softball.png" },
  { nom: "Fastpitch Nation", src: "/partenaires/fastpitch-nation.jpg" },
  { nom: "L'Entrepôt du Baseball", src: "/partenaires/entrepot-du-baseball.png" },
  { nom: "Sébastien Gervais Photo", src: "/partenaires/sebastien-gervais-photo.jpg" },
  { nom: "Gym L'Armure" }, // logo à fournir
];

const sansAccent = (n: string) => n.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Engagement universitaire d'une joueuse (par son nom). Pour en ajouter un : ajouter une entrée dans CONTENU.softball.engagees
 * (nom, école, division · État, année, photo) : il apparaît à la fois sur l'accueil et au bas de son profil.
 */
export function engagementDe(nom: string): Engagee | null {
  const cle = sansAccent(nom);
  return Object.values(CONTENU).flatMap((c) => c.engagees).find((e) => sansAccent(e.who) === cle) ?? null;
}

/**
 * Comptes des réseaux sociaux du programme (adresse ou @nom). À renseigner ici ou par variables d'environnement
 * (NEXT_PUBLIC_INSTAGRAM_URL, NEXT_PUBLIC_FACEBOOK_URL, NEXT_PUBLIC_TIKTOK_URL). Vide = ce réseau n'est pas affiché
 * (un rappel s'affiche seulement en développement).
 */
export const INSTAGRAM = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://www.instagram.com/royal_onfield_softball/";
export const FACEBOOK = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "https://www.facebook.com/royalonfieldsoftball";
export const TIKTOK = process.env.NEXT_PUBLIC_TIKTOK_URL ?? "https://www.tiktok.com/@royalonfieldsoftball";

export function compteInstagram(brut: string): string {
  const m = brut.trim().match(/instagram\.com\/([A-Za-z0-9._]{1,30})/i) ?? brut.trim().match(/^@?([A-Za-z0-9._]{1,30})$/);
  return m ? m[1] : "";
}

/** Page Facebook : adresse complète (https://www.facebook.com/nom-de-la-page). */
export function pageFacebook(brut: string): string {
  const m = brut.trim().match(/^(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/([A-Za-z0-9._\-/]{2,100})/i);
  return m ? `https://www.facebook.com/${m[1].replace(/\/+$/, "")}` : "";
}

export function compteTiktok(brut: string): string {
  const m = brut.trim().match(/tiktok\.com\/@([A-Za-z0-9._]{1,30})/i) ?? brut.trim().match(/^@([A-Za-z0-9._]{1,30})$/);
  return m ? m[1] : "";
}

/**
 * Calendriers GameChanger par équipe (identifiant du widget). Sert seulement tant que la migration 0009 n'est pas appliquée ;
 * ensuite, la Direction le saisit dans la gestion des équipes.
 */
export const GAMECHANGER_PROVISOIRE: Record<string, string> = {
  "18U - Di Peco": "7995b8d4-b175-40db-9190-7719a306837c",
};

export const idGameChanger = (v: unknown) => (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v ?? "").trim()) ? String(v).trim() : "");

export const GAMECHANGER_LIEN_PROVISOIRE: Record<string, string> = {
  "16U - Dostaler": "https://web.gc.com/teams/8MQao52hpmge",
};

/** Lien de page d'équipe GameChanger (web.gc.com/teams/…), sans les paramètres de suivi. */
export function lienGameChanger(v: unknown): string {
  const m = String(v ?? "").trim().match(/^https?:\/\/web\.gc\.com\/teams\/([A-Za-z0-9]{6,20})/i);
  return m ? `https://web.gc.com/teams/${m[1]}` : "";
}
