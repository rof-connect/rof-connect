// Contenu éditorial du nouveau site public (hors équipes : celles-ci viennent de ROF Connect).
export type Sport = "softball" | "baseball";

export const SPORTS: Sport[] = ["softball", "baseball"];

export function sportDe(valeur: string | undefined): Sport {
  return valeur === "baseball" ? "baseball" : "softball";
}

export type Evenement = { m: string; y: string; t: string; p: string; tag: string; hl?: boolean; important?: boolean };
export type Palmares = { y: string; l: string[] };
export type Banniere = {
  style: "canam" | "canada" | "provincial" | "tournoi";
  titre: string; // ex. « Can-Am United »
  sous?: string; // ex. « Baseball League »
  annee: string;
  mention: string; // ex. « Champions »
  categorie: string; // ex. « 12U »
  embleme?: "canada" | "ll" | "tc" | "fpn" | "homerun" | "nsa" | "pbr" | "otw"; // drapeau du Canada (titre canadien) ou logo Little League (World Series)
};
export type Engagee = { who: string; s: string; m: string; c: string; photo?: string };

type Contenu = {
  mot: string; // « Softball » / « Baseball »
  kicker: string;
  accroche: string;
  saison: string;
  noteCalendrier: string;
  engagementsSous: string;
  lead: string;
  etapes: { n: string; t: string; d: string }[];
  academique: { t: string; d: string; lien?: string }[]; // parcours académique (propre au sport)
  volet?: { titre: string; groupes: { nom: string; sous?: string; equipes: { niveau: string; nom: string }[] }[] }; // volet scolaire (sous les équipes)
  aVenir?: { etiquette: string; niveau: string; nom: string; titre: string; sous: string; details: string[]; intro: string; places: string; periode: string; programme: string[]; envies: string[]; conclusion: string; signature: string }; // programme annoncé (carte dans Équipes) // parcours Royal
  stats: [string, string][]; // chiffres fixes (les chiffres tirés de ROF Connect s'ajoutent)
  calendrier: Evenement[];
  palmares: Palmares[];
  bannieres: Banniere[]; // bannières de championnat affichées au-dessus du palmarès
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
    noteCalendrier: "",
    engagementsSous: "Elles ont signé.",
    lead: "De l'école primaire au collège américain : un chemin clair, un accompagnement personnalisé vers la NCAA, la NAIA et la NJCAA.",
    etapes: [
      { n: "01", t: "Royal Junior", d: "10U à 11U — les fondations : technique, plaisir du jeu et habitudes d'athlète." },
      { n: "02", t: "Royal Relève", d: "12U à 13U — compétition provinciale et canadienne, avec le rêve des World Series Softball." },
      { n: "03", t: "Royal Prospect", d: "14U à 15U — développement élite : un calibre de jeu et une préparation qui visent le niveau supérieur." },
      { n: "04", t: "Royal Élite", d: "16U à 18U — le niveau vitrine : tournois aux États-Unis, exposition aux recruteurs et accompagnement vers la NCAA, la NAIA et la NJCAA." },
    ],
    academique: [
      { t: "PSES", d: "Programme sport-études au primaire (5e et 6e année), pour les joueuses de Lanaudière." },
      { t: "Collège L'Assomption", d: "Concilier études secondaires et softball de haut niveau. Ouvert à toutes les joueuses, sans restriction de région." },
      { t: "École en ligne", d: "12e année : école en ligne pour concilier études et softball de haut niveau." },
      { t: "Collège américain", d: "Accompagnement vers la NCAA, la NAIA et la NJCAA (parcours 12e année ou cégep)." },
    ],
    aVenir: {
      etiquette: "À VENIR",
      niveau: "Varsity", // grand titre de la carte (même format que les autres équipes)
      nom: "Royal On Field", // petit nom sous le niveau
      titre: "Royal On Field Varsity/JV",
      sous: "Automne 2027",
      details: ["12 mois par année", "École en ligne", "18U · 16U"],
      intro: "Un nouveau programme Varsity/JV, à l'année, qui combine softball de haut niveau et école en ligne.",
      places: "Places limitées",
      periode: "Programme de septembre 2027 à août 2028",
      programme: ["Showcase National Automne", "Tournée Collège", "Voyage Floride", "Voyage Texas", "Voyage Tennessee"],
      envies: ["Voyager, compétitionner face aux meilleurs programmes", "Améliorer tes chances de recrutement", "Poursuivre tes études en ligne"],
      conclusion: "C'est ici que ça commence !",
      signature: "Programme unique au Canada",
    },
    stats: [
      ["9", "Titres canadiens"],
      ["8", "Séries mondiales LL"],
      ["3", "Athlètes signées"],
    ],
    calendrier: [
      { m: "MAI", y: "2027", t: "Memorial Day Madness", p: "Maryland, États-Unis", tag: "Tournoi", important: true },
      { m: "MAI", y: "2027", t: "Fastpitch Nation", p: "Lieu à confirmer", tag: "Tournoi" },
      { m: "JUIN", y: "2027", t: "Alliance Softball Qualifier", p: "Syracuse, New York", tag: "Qualification", hl: true },
      { m: "JUIN", y: "2027", t: "Binghamton", p: "Binghamton, New York", tag: "Tournoi" },
      { m: "JUIL", y: "2027", t: "PGF New Jersey", p: "New Jersey, États-Unis", tag: "Showcase", important: true },
      { m: "JUIL", y: "2027", t: "Championnat Canadien LL", p: "Lieu à confirmer", tag: "Championnat", hl: true, important: true },
    ],
    bannieres: [
      { style: "canada", titre: "Champion canadien", sous: "Softball", annee: "2026", mention: "Championnes", categorie: "12U · 14U · 16U", embleme: "canada" },
      { style: "canada", titre: "World Series", sous: "Softball", annee: "2026", mention: "Participation", categorie: "12U · 14U · 16U", embleme: "ll" },
      { style: "canada", titre: "Eastern Canadian Championship", sous: "Softball Canada", annee: "2026", mention: "Champions", categorie: "Est du Canada", embleme: "canada" },
      { style: "provincial", titre: "Champion provincial", sous: "Softball Québec", annee: "2026", mention: "Championnes", categorie: "17U" },
      { style: "tournoi", titre: "Fastpitch Nation", sous: "Firecracker on the 4th", annee: "2026", mention: "Championnes", categorie: "16U · 8-2", embleme: "fpn" },
      { style: "tournoi", titre: "Fastpitch Nation", sous: "The Thin Blue Line", annee: "2026", mention: "Championnes", categorie: "14U · 5-2", embleme: "fpn" },
      { style: "tournoi", titre: "Homerun Softball", sous: "Binghamton", annee: "2026", mention: "Championnes", categorie: "14U · 16U", embleme: "homerun" },
      { style: "tournoi", titre: "NSA", sous: "Lakeland, Floride", annee: "2026", mention: "Championnes", categorie: "14U · 16U", embleme: "nsa" },
      { style: "canada", titre: "Champion canadien", sous: "Softball", annee: "2025", mention: "Championnes", categorie: "12U · 14U · 16U", embleme: "canada" },
      { style: "canada", titre: "World Series", sous: "Softball", annee: "2025", mention: "Participation", categorie: "12U · 14U · 16U", embleme: "ll" },
      { style: "provincial", titre: "Champion provincial", sous: "Softball Québec", annee: "2025", mention: "Championnes", categorie: "15U" },
      { style: "tournoi", titre: "Triple Crown", sous: "Binghamton", annee: "2025", mention: "Championnes", categorie: "Binghamton", embleme: "tc" },
      { style: "canada", titre: "Champion canadien", sous: "Softball", annee: "2024", mention: "Championnes", categorie: "12U · 14U", embleme: "canada" },
      { style: "canada", titre: "World Series", sous: "Softball", annee: "2024", mention: "Participation", categorie: "12U · 14U", embleme: "ll" },
      { style: "provincial", titre: "Champion provincial", sous: "Softball Québec", annee: "2024", mention: "Championnes", categorie: "15U" },
    ],
    palmares: [
      {
        y: "2026",
        l: [
          "Champion canadien Softball — 12U, 14U, 16U",
          "World Series Softball — 12U, 14U, 16U",
          "Champion de l'Est du Canada (Softball Canada)",
          "Champion Fastpitch Nation « Firecracker on the 4th » — 16U (8 victoires, 2 défaites)",
          "Champion Fastpitch Nation « The Thin Blue Line » — 14U (5 victoires, 2 défaites)",
        ],
      },
      {
        y: "2025",
        l: [
          "Champion canadien Softball — 12U, 14U, 16U",
          "World Series Softball — 12U, 14U, 16U",
        ],
      },
      {
        y: "2024",
        l: [
          "Champion canadien Softball — 12U, 14U",
          "World Series Softball — 12U, 14U",
        ],
      },
      {
        y: "2023",
        l: [],
      },
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
      "Le programme élite de baseball de Lanaudière. Du 8U au Prep School, bâti sur le même standard Royal : travail, caractère, excellence.",
    saison: "Saison 2027",
    noteCalendrier: "Calendrier en préparation",
    engagementsSous: "Les prochains noms.",
    lead: "Le même parcours Royal, adapté au baseball : développement, exposition et accompagnement vers les programmes collégiaux américains.",
    etapes: [
      { n: "01", t: "PSES", d: "5e et 6e année — les fondations : technique, plaisir du jeu et habitudes d'athlète." },
      { n: "02", t: "Collège L'Assomption", d: "Le secondaire : conciliation sport-études et développement structuré." },
      { n: "03", t: "JV / Varsity", d: "Le niveau vitrine : tournois aux États-Unis, préparation physique et exposition aux recruteurs." },
      { n: "04", t: "Collège américain", d: "La signature : parcours 12e année ou cégep, dossier, vidéos et contacts avec les entraîneurs." },
    ],
    academique: [],
    volet: {
      titre: "Volet scolaire",
      groupes: [
        {
          nom: "PSES",
          sous: "Primaire · 5e et 6e année",
          equipes: [
            { niveau: "Bleu", nom: "PSES" },
            { niveau: "Noir", nom: "PSES" },
          ],
        },
        {
          nom: "Collège L'Assomption",
          sous: "Secondaire",
          equipes: [
            { niveau: "Sec. 1", nom: "Collège L'Assomption" },
            { niveau: "Sec. 2-3", nom: "Collège L'Assomption" },
            { niveau: "Sec. 4-5", nom: "Collège L'Assomption" },
          ],
        },
      ],
    },
    stats: [
      ["4", "Titres provinciaux"],
      ["2", "Titres Can-Am United"],
      ["1", "Titre ECTBL"],
    ],
    calendrier: [],
    bannieres: [
      { style: "provincial", titre: "Champion provincial", sous: "Petite Ligue Québec", annee: "2026", mention: "Champions invaincus", categorie: "Mineur" },
      { style: "tournoi", titre: "ECTBL", sous: "Séries Minor", annee: "2026", mention: "Champions", categorie: "10U · 11-1" },
      { style: "tournoi", titre: "PBR Baseball", sous: "Cortland, NY", annee: "2026", mention: "Champions", categorie: "8U", embleme: "pbr" },
      { style: "tournoi", titre: "Peter Loyen Classic", sous: "PBR Baseball · Ottawa West", annee: "2026", mention: "Champions", categorie: "10U", embleme: "otw" },
      { style: "tournoi", titre: "Ontario Rookie Invitational", sous: "Kingston", annee: "2026", mention: "Champions", categorie: "8U" },
      { style: "tournoi", titre: "Thanksgiving Wood Bat Classic", sous: "Le Sandlot", annee: "2026", mention: "Champions", categorie: "PSES" },
      { style: "canam", titre: "Can-Am United", sous: "Baseball League", annee: "2025", mention: "Playoff Champions", categorie: "12U" },
      { style: "canam", titre: "Can-Am United", sous: "Baseball League", annee: "2024", mention: "Playoff Champions", categorie: "12U" },
      { style: "canam", titre: "Can-Am United", sous: "Baseball League", annee: "2023", mention: "Playoff Champions", categorie: "12U" },
      { style: "tournoi", titre: "Cornwall Invitational", sous: "All-Star Tournament", annee: "2023", mention: "Champions", categorie: "8U" },
    ],
    palmares: [
      {
        y: "2026",
        l: [
          "Champions provinciaux Petite Ligue Québec — Mineur, parcours invaincu",
          "Champions ECTBL (séries éliminatoires Minor) — 10U, victoire de 11-1 en finale",
          "Champions PBR Baseball (Cortland, NY) — 8U",
          "Champions Peter Loyen Classic (PBR Baseball Ottawa West) — 10U",
          "Champions Ontario Rookie Invitational (Kingston) — 8U",
          "Champions Thanksgiving Wood Bat Classic — Programme scolaire PSES",
        ],
      },
      { y: "2025", l: ["Champion 2025 Can-Am United League 12U"] },
      { y: "2024", l: ["Champion 2024 Can-Am United League 12U"] },
      { y: "2023", l: ["Champion 2023 Can-Am United League 12U", "Champions Cornwall Invitational All-Star Tournament — 8U"] },
    ],
    engagees: [],
    videCalendrier: "Les tournois et showcases du programme baseball seront publiés ici dès qu'ils seront confirmés.",
    videPalmares: "Le palmarès du programme baseball sera ajouté ici.",
    videEngagements: "Les premiers engagements universitaires du programme baseball seront célébrés ici.",
  },
};

export const GALERIE: { src: string; alt: string }[] = [
  { src: "/photos/trio-sourire.jpg", alt: "Trois joueuses de Royal On Field posent ensemble devant le décor « Earn the Crown »" },
  { src: "/photos/receveuse.jpg", alt: "Gros plan sur le regard d'une receveuse sous son casque rouge" },
  { src: "/photos/canada.jpg", alt: "Une joueuse tient le chandail Canada numéro 8" },
  { src: "/photos/trio-fun.jpg", alt: "Trois joueuses de Royal On Field s'amusent devant le décor de l'académie" },
  { src: "/photos/galerie-01.jpg", alt: "Une jeune lanceuse tend une balle de softball vers la caméra" },
];

export const PARTENAIRES: { nom: string; src?: string; sports?: Sport[] }[] = [
  { nom: "Little League Canada", src: "/partenaires/n-little-league.png" },
  { nom: "USA Softball", src: "/partenaires/n-usa-softball.png", sports: ["softball"] },
  { nom: "Fastpitch Nation", src: "/partenaires/n-fastpitch-nation.png", sports: ["softball"] },
  { nom: "Alliance Fastpitch", src: "/partenaires/n-alliance-fastpitch.png", sports: ["softball"] },
  { nom: "Babe Ruth Softball", src: "/partenaires/n-babe-ruth-softball.png", sports: ["softball"] },
  { nom: "PGF · Premier Girls Fastpitch", src: "/partenaires/n-pgf.png", sports: ["softball"] },
  { nom: "Triple Crown Fastpitch", src: "/partenaires/n-triple-crown.png", sports: ["softball"] },
  { nom: "Homerun Softball & Baseball", src: "/partenaires/n-homerun.png", sports: ["softball"] },
  { nom: "NSA Softball", src: "/partenaires/n-nsa.png", sports: ["softball"] },
  { nom: "Salt City Sports", src: "/partenaires/n-salt-city.png", sports: ["softball"] },
  { nom: "Accelerate Sports", src: "/partenaires/n-accelerate.png", sports: ["softball"] },
  { nom: "Ligue Fastpitch Junior Majeur du Québec (LFJMQ)", src: "/partenaires/n-lfjmq.png", sports: ["softball"] },
  { nom: "L'Entrepôt du Baseball", src: "/partenaires/n-entrepot-du-baseball.png" },
  { nom: "Sébastien Gervais Photo", src: "/partenaires/n-sebastien-gervais-photo.png" },
  { nom: "Gym L'Armure", src: "/partenaires/n-gym-armure.png" },
  { nom: "Remorques Dionne", src: "/partenaires/n-remorques-dionne.png" },
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
  "18U Di Peco": "7995b8d4-b175-40db-9190-7719a306837c",
  "16U Dostaler": "1f3faad8-a77c-44a3-986c-848b65a6ac07",
};

export const idGameChanger = (v: unknown) => (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(v ?? "").trim()) ? String(v).trim() : "");

export const GAMECHANGER_LIEN_PROVISOIRE: Record<string, string> = {
  "18U Di Peco": "https://web.gc.com/teams/t4fZDVd8st2F",
  "16U Dostaler": "https://web.gc.com/teams/8MQao52hpmge",
};

/** Lien de page d'équipe GameChanger (web.gc.com/teams/…), sans les paramètres de suivi. */
export function lienGameChanger(v: unknown): string {
  const m = String(v ?? "").trim().match(/^https?:\/\/web\.gc\.com\/teams\/([A-Za-z0-9]{6,20})/i);
  return m ? `https://web.gc.com/teams/${m[1]}` : "";
}

/** Affiliations affichées selon le sport (pied de page et section Organisation). */
export const AFFILIATIONS: Record<Sport, string[]> = {
  softball: ["Little League", "Babe Ruth League", "Softball USA", "Triple Crown", "Alliance Fastpitch"],
  baseball: ["Little League", "Can-Am League"],
};

const bb = (n: number) => `/photos/baseball-${String(n).padStart(2, "0")}.jpg`;

/** Photo du haut de page (baseball : photo des receveurs). */
export const HERO: Record<Sport, { src: string; alt: string; position: string }> = {
  softball: {
    src: "/photos/celebration.jpg",
    alt: "Les joueuses de Royal On Field, de dos, lèvent les bras ensemble sur le terrain",
    position: "62% 30%",
  },
  baseball: {
    src: bb(11),
    alt: "Deux receveurs de Royal On Field, en équipement complet, tendent leur gant vers la caméra",
    position: "50% 40%",
  },
};

/** Galerie « En images » par sport. */
export const GALERIES: Record<Sport, { src: string; alt: string }[]> = {
  softball: GALERIE,
  baseball: [
    { src: bb(5), alt: "Trois jeunes joueurs avec gants et bâton, une balle lancée dans les airs" },
    { src: bb(1), alt: "Quatre joueurs de Royal On Field se cachent la bouche et pointent vers la caméra" },
    { src: bb(9), alt: "Trois joueurs en position défensive, le gant près du sol" },
    { src: bb(7), alt: "Deux jeunes joueurs souriants, l'un avec un bâton sur l'épaule, l'autre avec son gant" },
    { src: bb(2), alt: "Deux joueurs posent en uniforme noir, l'une debout, l'autre à genoux avec un bâton multicolore" },
    { src: bb(6), alt: "Trois joueurs font un « dab » devant le décor de l'académie" },
    { src: bb(8), alt: "Deux jeunes joueurs debout avec un gant, une balle et un bâton" },
    { src: bb(4), alt: "Un jeune joueur fait semblant de croquer un gant de baseball en peluche" },
    { src: bb(10), alt: "Un jeune joueur fait semblant de frapper son entraîneur avec un bâton orange" },
  ],
};

/**
 * Équipes dont le roster (liste des joueuses) est affiché sur le site. Sert seulement tant que la migration 0009 n'est pas
 * appliquée ; ensuite, la case « Afficher le roster » de la gestion des équipes décide.
 */
export const ROSTER_PROVISOIRE = ["18U Di Peco"];

/** Étiquettes de niveau de compétition par équipe (softball : NATIONAL = Varsity, SCOUT TEAM = JV ; aucune étiquette sinon). Sert seulement tant que la migration 0009 n'est pas appliquée. */
export const NIVEAU_COMPETITION_PROVISOIRE: Record<string, string> = {
  "18U Di Peco": "NATIONAL",
  "16U Bertrand": "SCOUT TEAM",
};

/** Ordre d'affichage par défaut des équipes (quand la Direction n'a pas saisi d'ordre). */
export const ORDRE_PUBLIC: Record<Sport, string[]> = {
  softball: [],
  baseball: ["8U", "9/10U", "11/12U", "13U", "14U", "16U", "Prep School"],
};

/** Texte « niveaux » de l'accès rapide Équipes. */
export const NIVEAUX: Record<Sport, string> = { softball: "10U à Varsity", baseball: "8U à Prep School" };

/** Comptes des réseaux sociaux par sport. Vide = ce réseau n'est pas affiché (le baseball n'a pas de TikTok). */
export const RESEAUX: Record<Sport, { instagram: string; facebook: string; tiktok: string }> = {
  softball: { instagram: INSTAGRAM, facebook: FACEBOOK, tiktok: TIKTOK },
  baseball: {
    instagram: "https://www.instagram.com/royal_onfield_baseball/",
    facebook: "https://www.facebook.com/royalbaseballsubarurepentigny/",
    tiktok: "",
  },
};

/** Profil FieldLevel de l'organisation, par sport (plateforme de recrutement). */
export const FIELDLEVEL: Record<Sport, string> = {
  softball: "https://www.fieldlevel.com/app/organization/gtgm4xht/softball/overview",
  baseball: "https://www.fieldlevel.com/app/organization/x4r3yyfa/baseball/overview",
};

export function lienFieldLevel(v: string): string {
  const m = v.trim().match(/^https:\/\/www\.fieldlevel\.com\/app\/organization\/([a-z0-9]{6,12})\/(softball|baseball)\/overview/i);
  return m ? `https://www.fieldlevel.com/app/organization/${m[1]}/${m[2].toLowerCase()}/overview` : "";
}

/** Partenaires par sport (le baseball n'affiche ni USA Softball ni Fastpitch Nation ; ajoute PBR Baseball). */
export const PARTENAIRES_PAR_SPORT: Record<Sport, { nom: string; src?: string }[]> = {
  softball: PARTENAIRES.filter((p) => !p.sports || p.sports.includes("softball")),
  baseball: [...PARTENAIRES.filter((p) => !p.sports || p.sports.includes("baseball")), { nom: "PBR Baseball", src: "/partenaires/n-pbr.png" }],
};

/** Page « Centre d'entraînement ». Textes à compléter par la Direction. */
export const CENTRE = {
  titre: "Centre d'entraînement",
  intro:
    "Des cages de frappe avec lanceurs automatiques et une surface dédiée à l'entraînement : un centre privé pour travailler la technique, la répétition et la confiance, au rythme de chaque athlète.",
  photo: "/photos/centre-entrainement.webp",
  alt: "Cages de frappe avec lanceurs automatiques et plaque sur surface rouge au centre d'entraînement privé",
  points: ["Cages de frappe", "Lanceurs automatiques", "Surface d'entraînement dédiée", "Centre privé"],
};

/** Profil de recrutement FieldLevel d'une joueuse (https://www.fieldlevel.com/app/profile/…). Tout autre lien est refusé. */
export function profilFieldLevel(v: unknown): string {
  const m = String(v ?? "").trim().match(/^https:\/\/www\.fieldlevel\.com\/app\/profile\/([A-Za-z0-9._-]{2,60})\/(softball|baseball)(\?m=\d)?/i);
  return m ? `https://www.fieldlevel.com/app/profile/${m[1]}/${m[2].toLowerCase()}` : "";
}

/** Événements et showcases visés par le programme Varsity (logos affichés sur la page Varsity). */
export const LOGOS_VARSITY: { nom: string; src: string; sombre?: boolean }[] = [
  { nom: "Triple Crown Fastpitch", src: "/partenaires/n-triple-crown.png" },
  { nom: "PGF · Premier Girls Fastpitch", src: "/partenaires/n-pgf.png" },
  { nom: "NSA Softball", src: "/partenaires/n-nsa.png" },
  { nom: "Alliance Fastpitch", src: "/partenaires/n-alliance-fastpitch.png" },
  { nom: "East Coast Softball", src: "/partenaires/n-east-coast.png" },
  { nom: "Scenic City Showcase · Chattanooga, TN", src: "/partenaires/n-scenic-city.png" },
];
