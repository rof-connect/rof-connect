// ============================================================================
//  Programme sprint ROF : données partagées (page /membres/sprint, agenda et plans)
//  Ce fichier n'a pas de « use client » : il peut être lu par le serveur.
// ============================================================================

/** Date de la 1re séance (un lundi). Séance A le lundi, séance B le mercredi de chaque semaine. */
export const DEBUT_SPRINT = "2026-11-16";
const DECALAGE_SEANCE = { A: 0, B: 2 };

export const EXERCICES = {
  jogging: {
    nom: "Jogging léger", anim: "jogging",
    consignes: ["Rythme où tu peux parler", "Épaules relâchées"],
    recherche: "light jog warm up athletes",
  },
  mobilite: {
    nom: "Fentes avec rotation", anim: "mobilite",
    consignes: ["Grand pas vers l'avant, genou arrière près du sol", "Bras tendus devant, tourner le tronc du côté de la jambe avant", "Revenir au centre, puis pas suivant", "Genou avant au-dessus de la cheville"],
    erreurs: ["Genou avant qui dépasse les orteils", "Dos rond"],
    recherche: "walking lunge with rotation warm up",
  },
  balancements: {
    nom: "Balancements de jambes", anim: "balancements",
    consignes: ["Une main sur un mur, une clôture ou un partenaire", "Balancer la jambe d'avant en arrière, de plus en plus haut", "Tronc droit, jambe d'appui stable", "Faire les deux jambes"],
    erreurs: ["Se pencher pour aller plus haut", "Forcer : l'amplitude vient toute seule"],
    recherche: "leg swings front to back dynamic warm up",
  },
  talonsFesses: {
    nom: "Talons-fesses", anim: "talonsFesses",
    consignes: ["Petits pas rapides vers l'avant", "Talons qui remontent vers les fesses", "Genoux qui pointent vers le sol", "Bras qui suivent le rythme"],
    erreurs: ["Se pencher vers l'avant", "Lancer le pied sur le côté"],
    recherche: "butt kicks running drill warm up",
  },
  askip: {
    nom: "A-skip", anim: "askip",
    consignes: ["Tronc droit, regard devant", "Genou à la hauteur de la hanche", "Pointe du pied relevée", "Le pied frappe le sol sous la hanche", "Bras opposé actif"],
    erreurs: ["Se pencher vers l'arrière", "Pied qui atterrit devant le corps"],
    recherche: "A skip sprint drill technique",
  },
  sautLongueur: {
    nom: "Saut en longueur sans élan", anim: "saut",
    consignes: ["Pieds à la largeur des hanches", "Bras vers l'arrière, puis lancés vers l'avant", "Pousser fort avec les deux pieds", "Atterrissage collé 2 secondes"],
    erreurs: ["Tomber vers l'arrière à l'atterrissage", "Genoux qui rentrent vers l'intérieur"],
    recherche: "standing broad jump technique",
  },
  pogos: {
    nom: "Pogos", anim: "pogos",
    consignes: ["Sur la pointe des pieds", "Genoux presque droits", "Rebondir comme un ressort", "Contact au sol le plus court possible"],
    erreurs: ["Talons qui touchent le sol", "Plier les genoux à chaque saut"],
    recherche: "pogo jumps plyometric technique",
  },
  departChute: {
    nom: "Départ en chute", anim: "chute",
    consignes: ["Debout, le corps bien droit", "Se pencher vers l'avant comme une planche", "Sprinter au moment où tu perds l'équilibre", "Premiers pas courts et puissants"],
    erreurs: ["Plier à la taille", "Faire un pas de recul avant de partir"],
    recherche: "falling start acceleration drill",
  },
  leadOff: {
    nom: "Lead-off → sprint 60 pi", anim: "leadOff",
    consignes: ["Position athlétique, poids vers l'avant", "Partir au lâcher de la balle", "Premier pas puissant vers le 2e but", "Courir à travers la ligne"],
    erreurs: ["Se relever avant de partir", "Regarder la balle en courant"],
    recherche: "softball baserunning lead off first step",
  },
  tuckJumps: {
    nom: "Tuck jumps", anim: "tuck",
    consignes: ["Sauter le plus haut possible", "Genoux à la poitrine", "Atterrir doucement et rebondir aussitôt"],
    erreurs: ["Genoux qui rentrent à l'atterrissage", "Se pencher vers l'avant en l'air"],
    recherche: "tuck jump plyometric technique",
  },
  bonds: {
    nom: "Bonds alternés", anim: "bonds",
    consignes: ["Grandes enjambées, une jambe à la fois", "Pousser le sol derrière toi", "Genou avant haut, bras opposé actif", "Réception stable"],
    recherche: "bounding drill sprint technique",
  },
  haiesPiedsJoints: {
    nom: "Mini-haies – sauts pieds joints", anim: "haiesPJ",
    consignes: ["Installation commune : 5 haies à 3 pi l'une de l'autre", "Pieds collés, sur la pointe", "Rebondir aussitôt au contact : le sol est chaud", "Bras qui montent pour aider le saut"],
    erreurs: ["Pause entre les haies", "Atterrir sur les talons"],
    recherche: "mini hurdle two foot hops reactive drill",
  },
  haiesSprint: {
    nom: "Mini-haies → sprint 30 pi", anim: "haiesSprint",
    consignes: ["Sauts pieds joints rapides par-dessus les 5 haies", "Après la dernière haie, sprinter jusqu'au cône (30 pi) sans arrêter", "Premier pas puissant, corps penché vers l'avant"],
    erreurs: ["Ralentir ou se relever entre les haies et le sprint"],
    recherche: "mini hurdle hops into sprint acceleration",
  },
  haiesZigzag: {
    nom: "Mini-haies – zigzag pieds joints", anim: "haiesZig",
    consignes: ["Départ à gauche de la 1re haie", "Sauter de côté par-dessus la haie, puis en diagonale vers l'avant jusqu'à la suivante", "Alterner gauche-droite jusqu'au bout de la rangée", "Épaules toujours face à l'avant"],
    erreurs: ["Aller trop vite au début : la précision avant la vitesse", "Atterrir sur une haie : ralentis"],
    recherche: "mini hurdle zig zag lateral hops",
  },
  haiesLaterales: {
    nom: "Mini-haie – sauts latéraux", anim: "haiesLat",
    consignes: ["Utilise la dernière haie de la rangée, sans rien déplacer", "Sauter d'un côté à l'autre, pieds joints", "Contacts au sol très courts", "Hanches et épaules face à l'avant"],
    erreurs: ["Genoux qui rentrent à l'atterrissage", "Regarder ses pieds"],
    recherche: "lateral mini hurdle hops quickness",
  },
  haiesUnipodal: {
    nom: "Mini-haies – sauts sur une jambe", anim: "haiesUni",
    consignes: ["Même rangée de 5 haies, sur une seule jambe", "Trop loin ? Saute seulement les 3 premières haies, sans les déplacer", "Atterrissage doux et stable", "Genou aligné avec l'orteil", "Faire les deux jambes"],
    erreurs: ["Genou qui plie vers l'intérieur", "Perdre l'équilibre : réduire l'espacement"],
    recherche: "single leg mini hurdle hops",
  },
  sprintLance: {
    nom: "Sprint lancé", anim: "sprint",
    consignes: ["30 pi d'élan progressif", "Puis 30 pi à vitesse MAX", "Tronc grand, genoux hauts", "Rester relâchée (visage, épaules)"],
    recherche: "flying sprint drill max velocity",
  },
  sprint30: {
    nom: "Sprint 100 pi", anim: "sprint",
    consignes: ["Départ debout", "Accélérer sur 30 pi, puis grandir", "Bras de la hanche au menton"],
    recherche: "100 ft sprint technique acceleration",
  },
  premierTroisieme: {
    nom: "Course du 1er au 3e but", anim: "sprint",
    consignes: ["Toucher l'intérieur du 2e but", "S'incliner vers l'intérieur dans le virage", "Garder la vitesse dans la courbe"],
    recherche: "softball baserunning rounding bases first to third",
  },
  retourCalme: {
    nom: "Marche et étirements légers", anim: "marche",
    consignes: ["Respiration lente", "Étirements sans forcer"],
    recherche: "cool down stretches after sprint",
  },
};

// ---------------------------------------------------------------------------
//  4. PROGRAMME — 6 semaines, séance A (accélération) et B (vitesse)
//     test: "distance" (pouces) ou "temps" (secondes)
// ---------------------------------------------------------------------------
export const PROGRAMME = {
  titre: "Programme sprint ROF",
  echauffement: [
    { id: "jogging", dosage: "2 min" },
    { id: "mobilite", dosage: "50 pi (environ 6 par jambe)" },
    { id: "balancements", dosage: "10 par jambe" },
    { id: "talonsFesses", dosage: "2 × 50 pi" },
    { id: "askip", dosage: "2 × 65 pi (séance B : + 2 × 65 pi en hauteur)" },
  ],
  retour: [{ id: "retourCalme", dosage: "3 min" }],
  seances: {
    A: { titre: "Explosion et accélération", repos: "1 min 30 entre chaque sprint" },
    B: { titre: "Vitesse maximale", repos: "2 min complètes entre chaque sprint" },
  },
  circuit: [
    { id: "haiesPiedsJoints", dosage: "1 passage" },
    { id: "haiesUnipodal", dosage: "1 passage par jambe" },
    { id: "haiesZigzag", dosage: "1 passage" },
    { id: "haiesLaterales", dosage: "10 contacts" },
    { id: "haiesSprint", dosage: "1 × jusqu'au cône" },
  ],
  semaines: [
    {
      no: 1, theme: "Tests de départ",
      A: [
        { id: "sautLongueur", dosage: "TEST : 3 essais, le meilleur compte", test: "distance" },
        { id: "leadOff", dosage: "TEST : 3 essais, le meilleur compte", test: "temps" },
        { id: "pogos", dosage: "2 × 15" },
        { id: "departChute", dosage: "3 × 30 pi" },
      ],
      B: [
        { id: "tuckJumps", dosage: "2 × 5" },
        { id: "bonds", dosage: "2 × 65 pi" },
        { id: "sprintLance", dosage: "3 ×" },
        { id: "sprint30", dosage: "2 ×" },
      ],
    },
    {
      no: 2, theme: "Apprendre le circuit", circuit: 1,
      A: [
        { id: "departChute", dosage: "3 × 30 pi" },
        { id: "leadOff", dosage: "4 ×" },
      ],
      B: [
        { id: "tuckJumps", dosage: "2 × 5" },
        { id: "bonds", dosage: "2 × 65 pi" },
        { id: "sprintLance", dosage: "3 ×" },
        { id: "sprint30", dosage: "3 ×" },
        { id: "premierTroisieme", dosage: "1 ×" },
      ],
    },
    {
      no: 3, theme: "Monter l'intensité", circuit: 2,
      A: [
        { id: "departChute", dosage: "2 × 30 pi" },
        { id: "leadOff", dosage: "4 ×" },
      ],
      B: [
        { id: "tuckJumps", dosage: "3 × 5" },
        { id: "bonds", dosage: "2 × 80 pi" },
        { id: "sprintLance", dosage: "4 ×" },
        { id: "sprint30", dosage: "3 ×" },
        { id: "premierTroisieme", dosage: "2 ×" },
      ],
    },
    {
      no: 4, theme: "Pic de la charge", circuit: 3,
      A: [
        { id: "leadOff", dosage: "4 ×" },
      ],
      B: [
        { id: "tuckJumps", dosage: "2 × 5" },
        { id: "bonds", dosage: "2 × 80 pi" },
        { id: "sprintLance", dosage: "4 ×" },
        { id: "sprint30", dosage: "3 ×" },
        { id: "premierTroisieme", dosage: "2 ×" },
      ],
    },
    {
      no: 5, theme: "Allègement – rester vive", circuit: 1,
      A: [
        { id: "leadOff", dosage: "3 ×" },
      ],
      B: [
        { id: "tuckJumps", dosage: "2 × 4" },
        { id: "sprintLance", dosage: "2 ×" },
        { id: "sprint30", dosage: "2 ×" },
      ],
    },
    {
      no: 6, theme: "Tests finaux – comparer", circuit: 1,
      A: [
        { id: "sautLongueur", dosage: "TEST : 3 essais, le meilleur compte", test: "distance" },
        { id: "leadOff", dosage: "TEST : 3 essais, le meilleur compte", test: "temps" },
      ],
      B: [
        { id: "tuckJumps", dosage: "3 × 5" },
        { id: "bonds", dosage: "2 × 80 pi" },
        { id: "sprintLance", dosage: "4 ×" },
        { id: "sprint30", dosage: "3 ×" },
        { id: "premierTroisieme", dosage: "2 ×" },
      ],
    },
  ],
  materiel: "5 mini-haies de 6 po (semaines 2 à 6). À défaut : des cônes bas ou des petits objets mous, jamais des bouteilles ou des bâtons.",
  regles: [
    "Gazon ou synthétique seulement, jamais sur l'asphalte ou le béton.",
    "Chaque sprint à 100 %. Si la vitesse baisse, la séance est terminée.",
    "Le repos complet n'est pas optionnel : c'est ce qui rend plus rapide.",
    "Tests (semaines 1 et 6) : dans les mêmes conditions, juste après l'échauffement (même terrain, mêmes souliers).",
    "Circuit mini-haies : la qualité des contacts avant la vitesse. Si tu accroches une haie, ralentis.",
    "À faire avant les autres entraînements, jamais après une pratique ou un match.",
    "Douleur à l'ischio, au tibia ou à la cheville = arrêt immédiat, et tu écris au coach.",
    "Après la semaine 6 : recommence à la semaine 2 avec 1 tour de circuit de plus, et sprint lancé à fond sur 50 pi.",
  ],
};

// ---------------------------------------------------------------------------
//  Séances du programme sous forme d'événements d'agenda (« à compléter »)
// ---------------------------------------------------------------------------
const ajouterJours = (iso, n) => {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const exercice = (prefixe, i, item) => {
  const ex = EXERCICES[item.id];
  return { code: `${prefixe}${i + 1}`, nom: ex.nom, series: item.dosage, description: ex.consignes.join(" · "), anim: ex.anim };
};

/** Blocs d'exercices d'une séance (même format que les programmes de l'agenda). */
export function blocsSeance(noSemaine, seance) {
  const sem = PROGRAMME.semaines[noSemaine - 1];
  const items = sem[seance];
  const tests = items.filter((x) => x.test);
  const autres = items.filter((x) => !x.test);
  const tours = seance === "A" ? sem.circuit || 0 : 0;
  const blocs = [{ titre: "Échauffement", info: "7 min", exercices: PROGRAMME.echauffement.map((x, i) => exercice("E", i, x)) }];
  if (tests.length) blocs.push({ titre: noSemaine === 1 ? "Tests de départ" : "Tests finaux", info: "Note tes résultats dans Programme sprint", exercices: tests.map((x, i) => exercice("T", i, x)) });
  if (tours) blocs.push({ titre: "Circuit mini-haies", info: `${tours} tour${tours > 1 ? "s" : ""} · 2 min entre les tours · haies à 3 pi`, exercices: PROGRAMME.circuit.map((x, i) => exercice("H", i, x)) });
  if (autres.length) blocs.push({ titre: PROGRAMME.seances[seance].titre, info: `Repos : ${PROGRAMME.seances[seance].repos}`, exercices: autres.map((x, i) => exercice("S", i, x)) });
  blocs.push({ titre: "Retour au calme", info: "3 min", exercices: PROGRAMME.retour.map((x, i) => exercice("R", i, x)) });
  return blocs;
}

/** Les 12 séances (6 semaines × A/B) prêtes à afficher dans l'agenda. */
export function seancesSprintAgenda(debut = DEBUT_SPRINT) {
  return PROGRAMME.semaines.flatMap((sem) =>
    ["A", "B"].map((seance) => ({
      id: `sprint-s${sem.no}-${seance}`,
      title: `Programme sprint · Semaine ${sem.no}, séance ${seance}`,
      event_date: ajouterJours(debut, (sem.no - 1) * 7 + DECALAGE_SEANCE[seance]),
      team_id: "",
      body: {
        type: "Autre",
        mode: "completer",
        lieu: "Autonome · 30 min",
        note: `${sem.theme} · ${PROGRAMME.seances[seance].titre}. Ouvre le programme pour voir les animations de chaque exercice.`,
        exercices_blocs: blocsSeance(sem.no, seance),
      },
    })),
  );
}

/** Semaine (1 à 6) et séance (A ou B) du jour, selon la date de départ du programme. */
export function seanceDuJour(maintenant = new Date()) {
  const jour = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(maintenant);
  const ecoules = Math.round((Date.parse(jour + "T12:00:00Z") - Date.parse(DEBUT_SPRINT + "T12:00:00Z")) / 86400000);
  return {
    semaine: Math.min(6, Math.max(1, Math.floor(ecoules / 7) + 1)),
    seance: ecoules >= 0 && ecoules % 7 >= DECALAGE_SEANCE.B ? "B" : "A",
  };
}
