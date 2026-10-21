// Génère le bilan de parcours (PDF, Letter) à partir des réponses et du calcul.
import PDFDocument from 'pdfkit';
import { fmtDate, plage, margeTexte, ouverture, LIBELLE_PROJET, LIBELLE_DUREE } from './calcul.js';

const NAVY = '#0B1F3A', GOLD = '#C9A227', TXT = '#1B2433', MUTED = '#6B7789', LINE = '#DDE3EC', SOFT = '#F4F6FA', RED = '#A8421F', GREEN = '#1F7A4D';
const W = 612, H = 792, M = 46, CW = W - 2 * M;

export function genererBilanPdf(i, r, now = new Date()) {
  const doc = new PDFDocument({ size: 'LETTER', margin: M, bufferPages: true, info: { Title: 'Bilan de parcours', Author: 'Royal Softball On Field' } });
  const chunks = [];
  doc.on('data', (c) => chunks.push(c));
  const fini = new Promise((res) => doc.on('end', () => res(Buffer.concat(chunks))));

  const nom = ((i.prenom || '') + ' ' + (i.nom || '')).trim() || 'La joueuse';
  const prenom = i.prenom || 'La joueuse';
  const bas = H - 56;
  const ensure = (h) => { if (doc.y + h > bas) doc.addPage(); };

  const kicker = (t) => { ensure(60); doc.moveDown(0.6); doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).text(t.toUpperCase(), M, doc.y, { characterSpacing: 1.5 }); };
  const h2 = (t) => { doc.font('Helvetica-Bold').fontSize(15).fillColor(NAVY).text(t.toUpperCase(), M, doc.y + 2, { width: CW }); doc.moveTo(M, doc.y + 3).lineTo(M + CW, doc.y + 3).lineWidth(1).strokeColor(GOLD).stroke(); doc.y += 9; };
  const p = (t, o = {}) => { doc.font(o.bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(o.size || 9.5).fillColor(o.color || TXT).text(t, M, doc.y, { width: CW, lineGap: 2, align: 'left' }); doc.moveDown(0.5); };

  function box(texte, couleur, titre) {
    doc.font('Helvetica').fontSize(9.2);
    const h = doc.heightOfString(texte, { width: CW - 26, lineGap: 2 }) + 16 + (titre ? 13 : 0);
    ensure(h + 8);
    const y = doc.y;
    doc.rect(M, y, CW, h).fillColor(couleur === RED ? '#FBEAE4' : couleur === GREEN ? '#E6F4EC' : '#FBF4DC').fill();
    doc.rect(M, y, 3, h).fillColor(couleur).fill();
    let ty = y + 8;
    if (titre) { doc.font('Helvetica-Bold').fontSize(9.2).fillColor(TXT).text(titre, M + 13, ty, { width: CW - 26 }); ty += 13; }
    doc.font('Helvetica').fontSize(9.2).fillColor(TXT).text(texte, M + 13, ty, { width: CW - 26, lineGap: 2 });
    doc.y = y + h + 8;
  }

  // table générique : cols = [{w, align}], rows = [[...]], entête en navy
  function table(cols, head, rows, opt = {}) {
    const tw = cols.reduce((a, c) => a + c.w, 0);
    const pad = 5;
    const hauteur = (cells, bold) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.6);
      return Math.max(...cells.map((c, k) => doc.heightOfString(String(c), { width: cols[k].w - 2 * pad, lineGap: 1 }))) + 2 * pad;
    };
    const ligne = (cells, y, h, o = {}) => {
      if (o.fill) doc.rect(M, y, tw, h).fillColor(o.fill).fill();
      let x = M;
      cells.forEach((c, k) => {
        doc.font(o.bold || (k === 0 && opt.premiereGras) ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.6).fillColor(o.color || TXT)
          .text(String(c), x + pad, y + pad, { width: cols[k].w - 2 * pad, lineGap: 1, align: cols[k].align || 'left' });
        x += cols[k].w;
      });
      if (!o.fill || o.line) doc.moveTo(M, y + h).lineTo(M + tw, y + h).lineWidth(0.5).strokeColor(LINE).stroke();
    };
    if (head) { const h = hauteur(head, true); ensure(h + 30); const y0 = doc.y; ligne(head, y0, h, { fill: NAVY, color: '#FFFFFF', bold: true }); doc.y = y0 + h; }
    rows.forEach((row, n) => {
      const h = hauteur(row.cells || row, false);
      ensure(h);
      const y0 = doc.y;
      ligne(row.cells || row, y0, h, { fill: (!Array.isArray(row) && row.fill) || (n % 2 ? SOFT : null), line: true });
      doc.y = y0 + h;
    });
    doc.moveDown(0.8);
  }

  // ---------- Page 1 : bandeau
  doc.rect(0, 0, W, 128).fillColor(NAVY).fill();
  doc.font('Helvetica-Bold').fontSize(8).fillColor(GOLD).text('BILAN DE PARCOURS', M, 34, { characterSpacing: 2 });
  doc.font('Helvetica-Bold').fontSize(26).fillColor('#FFFFFF').text(nom.toUpperCase(), M, 50, { width: CW });
  doc.font('Helvetica').fontSize(9).fillColor('#C9D3E3').text('Royal Softball On Field · Repentigny, Lanaudière · Établi le ' + fmtDate(now) + ' à partir du questionnaire de parcours', M, 92, { width: CW });
  doc.rect(M, 112, 60, 2).fillColor(GOLD).fill();
  doc.y = 150;

  // ---------- Situation
  kicker('Sa situation');
  h2('Une date repère en ' + r.repere);
  const cand = r.candidats.map((o) => o.k).join(', ');
  p(prenom + ' termine son secondaire V en juin ' + r.fin + '. Projet scolaire : ' + LIBELLE_PROJET[r.projet] + '. Temps de préparation : ' + LIBELLE_DUREE[r.duree] + '. ' + (r.multi ? 'Ce bilan compare donc les parcours ' + cand + '.' : 'Le parcours qui correspond le mieux à ses réponses est le parcours ' + cand + '.'));

  const fiche = [
    ['Joueuse', nom + (i.position ? ', ' + i.position.toLowerCase() : '') + (i.equipe ? ' · ' + i.equipe : '')],
    ['Naissance', fmtDate(r.dob)],
    ['Fin du secondaire V', 'Juin ' + r.fin + (i.niveau ? ' (niveau actuel : ' + i.niveau + ')' : '')],
    ['Divisions visées', (i.divisions || []).join(', ') || 'À préciser'],
    ['Domaine d\'études · anglais', (i.domaine || 'À préciser') + ' · ' + (i.anglais ? i.anglais.toLowerCase() : 'à préciser')],
  ];
  table([{ w: 150 }, { w: CW - 150 }], ['Fiche', 'Réponses au questionnaire'], fiche, { premiereGras: true });

  doc.font('Helvetica-Bold').fontSize(10.5).fillColor(NAVY).text('Son horloge de cinq ans', M, doc.y); doc.moveDown(0.3);
  p("L'horloge démarre au premier de deux événements : la première inscription à temps plein dans un collège ou une université, ou la rentrée de septembre qui suit le 19e anniversaire. " + prenom + ' a 19 ans le ' + fmtDate(r.anniversaire19) + '. Sa date repère est donc l\'automne ' + r.repere + ", même si elle n'étudie pas au collège avant. Une 12e année, de 12 ou de 24 mois, ne démarre pas l'horloge.");
  r.alertes.forEach((a) => box(a, RED, 'À vérifier'));
  box("Le NCAA classe le DEC comme preuve de graduation du secondaire, mais sa règle de l'horloge vise « n'importe quel collège ». Si le cégep démarre l'horloge, la joueuse peut perdre jusqu'à deux saisons. Aucun texte ne le tranche : la réponse doit venir du NCAA, par écrit.", RED, 'La question non tranchée du cégep');

  // ---------- Parcours
  kicker('Les parcours');
  h2('Comparaison des quatre parcours');
  const lignes = r.parcours.map((o) => {
    const c = r.candidats.includes(o);
    return { fill: c ? '#FBF4DC' : null, cells: [o.k + ' · ' + o.n + (c ? (r.multi ? '  (à comparer)' : '  (suggéré)') : ''), 'Automne ' + o.entree, plage(o.worst, o.best) + ' sur 5', margeTexte(o)] };
  });
  table([{ w: 190 }, { w: 80 }, { w: 80 }, { w: CW - 350 }], ['Parcours', 'Arrivée NCAA', 'Saisons', 'Marge'], lignes);
  p('Les saisons sont celles qui restent dans la fenêtre de cinq ans à l\'arrivée au NCAA. Pour les cégeps, la fourchette dépend de la lecture du NCAA (le cégep démarre l\'horloge, ou non).', { size: 8.4, color: MUTED });

  r.candidats.forEach((o) => {
    let t;
    if (o.ceg && o.worst < o.best) t = 'Selon la lecture du NCAA, le cégep peut démarrer l\'horloge dès l\'entrée (automne ' + r.fin + ') : ' + o.worst + ' saison' + (o.worst > 1 ? 's' : '') + ' au lieu de ' + o.best + '. À confirmer par écrit avant l\'inscription.';
    else if (!o.ceg && o.marge < 0) t = 'L\'arrivée tombe après la date repère : ' + (5 - o.worst) + ' saison' + ((5 - o.worst) > 1 ? 's' : '') + ' perdue' + ((5 - o.worst) > 1 ? 's' : '') + '.';
    else if (!o.ceg && o.marge > 0) t = 'Cinq saisons garanties, avec ' + o.marge + ' an' + (o.marge > 1 ? 's' : '') + ' de marge si le plan change.';
    else if (!o.ceg) t = 'Cinq saisons, mais sans marge : tout allongement coûte une saison.';
    else t = 'Cinq saisons, quelle que soit la lecture du NCAA.';
    box(t, o.ceg && o.worst < o.best ? RED : GREEN, 'Parcours ' + o.k + ' · ' + o.n);
  });

  kicker('Repères de recrutement');
  h2('Les dates pour les parcours retenus');
  const rep = [];
  r.candidats.forEach((o) => {
    rep.push({ cells: [o.k + ' · Contacts NCAA', 'D2 : ' + ouverture(o.d2, now) + '\nD1 : ' + ouverture(o.d1, now)] });
    rep.push({ cells: [o.k + ' · Ouverture de la signature', o.signature] });
    if (o.sram) rep.push({ cells: [o.k + ' · Demande SRAM au cégep', o.sram + ' (à confirmer)'] });
  });
  rep.push({ cells: ['D3, NAIA, NJCAA', 'Contacts permis en tout temps'] });
  rep.push({ cells: ['Grande fenêtre de contact d\'été', 'Du 12 juin au 31 juillet, chaque année'] });
  table([{ w: 190 }, { w: CW - 190 }], ['Repère', 'Date'], rep);

  // ---------- Détail : comment le calcul est fait
  const sais = (e, d) => Math.max(0, Math.min(5, 5 - (e - d)));
  const debuts = (o) => ({ B: o.ceg ? r.repere : Math.min(o.entree, r.repere), A: o.ceg ? Math.min(r.fin, r.repere) : Math.min(o.entree, r.repere) });
  const pl = (n, s) => n + ' ' + s + (n > 1 ? 's' : '');
  const tete = r.candidats[0];

  kicker('Le détail du calcul');
  h2('Comment sa date repère et ses saisons sont calculées');
  const dt = debuts(tete);
  const etapesCalcul = [
    ['1. Le 19e anniversaire', prenom + ' est née le ' + fmtDate(r.dob) + '. Elle a 19 ans le ' + fmtDate(r.anniversaire19) + '.'],
    ['2. La rentrée qui suit', "Si le 19e anniversaire tombe avant le 1er septembre, l'horloge démarre à cette rentrée; sinon, à la rentrée suivante. Pour " + prenom + ' : automne ' + r.repere + ". C'est sa date repère."],
    ["3. L'arrivée au NCAA", 'Le secondaire V se termine en juin ' + r.fin + ". L'arrivée dépend du parcours : automne " + r.fin + ' + 1 an (parcours A), + 2 ans (B et C) ou + 3 ans (D). Pour le parcours ' + tete.k + ' · ' + tete.n + ' : automne ' + tete.entree + '.'],
    ["4. Le départ de l'horloge", tete.ceg
      ? "Deux lectures sont possibles pour un cégep. Lecture 1 : seul l'âge démarre l'horloge (automne " + dt.B + "). Lecture 2 : le cégep la démarre dès l'entrée (automne " + dt.A + "). Le NCAA n'a pas tranché."
      : "Une 12e année ne démarre pas l'horloge : elle démarre à l'arrivée au NCAA (automne " + tete.entree + ') ou à la date repère (automne ' + r.repere + '), la première de ces dates. Ici : automne ' + dt.B + '.'],
    ['5. Les saisons', "Saisons = 5 − (année d'arrivée − année de départ de l'horloge), entre 0 et 5. Parcours " + tete.k + ' : 5 − (' + tete.entree + ' − ' + dt.B + ') = ' + sais(tete.entree, dt.B) + (dt.A !== dt.B ? ' (lecture 1) ou 5 − (' + tete.entree + ' − ' + dt.A + ') = ' + sais(tete.entree, dt.A) + ' (lecture 2)' : '') + '.'],
  ];
  table([{ w: 150 }, { w: CW - 150 }], null, etapesCalcul, { premiereGras: true });

  // ---------- Détail : saison par saison
  kicker('Saison par saison');
  h2('Année après année, pour chaque parcours retenu');
  r.candidats.forEach((o) => {
    const d = debuts(o);
    const nS = Math.min(sais(o.entree, d.A), sais(o.entree, d.B)), xS = Math.max(sais(o.entree, d.A), sais(o.entree, d.B));
    const avant = {
      A: ['Secondaire V', '12e année, en 12 mois : développement et dossier de recrutement'],
      B: ['Secondaire V', '12e année, première année sur deux : développement', '12e année, deuxième année : dossier, visites et choix'],
      C: ['Secondaire V', 'Cégep, 1re année (DEC pré-universitaire)', 'Cégep, 2e année'],
      D: ['Secondaire V', 'Cégep, 1re année (DEC technique)', 'Cégep, 2e année', 'Cégep, 3e année'],
    }[o.k];
    const lignes = avant.map((t, n) => [(r.fin - 1 + n) + '-' + (r.fin + n), t, '—']);
    for (let k = 0; k < 5; k++) {
      const y = o.entree + k;
      const statut = k < nS ? 'Comptée dans la fenêtre' : k < xS ? 'Comptée selon la lecture du NCAA' : 'Hors de la fenêtre de cinq ans';
      lignes.push([y + '-' + (y + 1), 'Saison NCAA ' + (k + 1) + ' (printemps ' + (y + 1) + ')', statut]);
    }
    p('Parcours ' + o.k + ' · ' + o.n + ' : ' + (nS === xS ? pl(nS, 'saison') : plage(nS, xS) + ' saisons') + ' sur 5.', { bold: true, size: 9.5, color: NAVY });
    table([{ w: 80 }, { w: 250 }, { w: CW - 330 }], ['Année scolaire', 'Où elle est', 'Fenêtre de cinq ans'], lignes);
  });

  // ---------- Détail : si le plan change
  kicker('Les imprévus');
  h2("Si le plan change d'un an");
  const imprevus = r.parcours.map((o) => {
    const d = debuts(o);
    const plus = Math.min(sais(o.entree + 1, o.ceg ? r.repere : Math.min(o.entree + 1, r.repere)), sais(o.entree + 1, o.ceg ? Math.min(r.fin, r.repere) : Math.min(o.entree + 1, r.repere)));
    const nS = Math.min(sais(o.entree, d.A), sais(o.entree, d.B));
    return [o.k + ' · ' + o.n, 'Automne ' + o.entree + ' : ' + plage(nS, Math.max(sais(o.entree, d.A), sais(o.entree, d.B))) + ' sur 5', 'Automne ' + (o.entree + 1) + ' : ' + plus + ' sur 5 (au pire)'];
  });
  table([{ w: 190 }, { w: 160 }, { w: CW - 350 }], ['Parcours', 'Plan actuel', "Arrivée repoussée d'un an"], imprevus);
  p("Une arrivée repoussée (blessure, résultats scolaires, décision tardive) coûte une saison dès que la marge est épuisée. C'est pourquoi les parcours avec marge sont préférables si la décision du cégep reste incertaine.", { size: 8.6, color: MUTED });

  // ---------- Détail : calendrier d'actions
  kicker('Le calendrier');
  h2('Les actions à poser, dans le temps (parcours ' + tete.k + ')');
  const cal = [
    ['Dans les 30 jours', "Envoyer la question du cégep au NCAA Eligibility Center; créer ou mettre à jour le profil de la joueuse; rassembler les bulletins du secondaire des deux dernières années."],
    ['Dans les 3 mois', "Filmer ou mettre à jour la vidéo de recrutement (voir plus bas); préparer le CV sportif d'une page; commencer la liste cible."],
    ['15 juin ' + (tete.entree - 3), 'Contacts D2 : ' + ouverture(tete.d2, now) + ". Envoyer les premiers courriels aux entraîneurs des écoles de la liste cible."],
    ['1er septembre ' + (tete.entree - 3), 'Contacts D1 : ' + ouverture(tete.d1, now) + '. Relancer les entraîneurs et planifier des appels.'],
    ['Du 12 juin au 31 juillet', "Grande fenêtre de contact d'été : camps, visites informelles et appels avec les entraîneurs."],
  ];
  if (tete.ceg) cal.push(['1er mars ' + r.fin, 'Demande SRAM pour le cégep (à confirmer); la réponse du NCAA sur la question du cégep doit être reçue avant.']);
  cal.push(['Novembre ' + (tete.entree - 1), "Ouverture de la signature : décision finale, lettre d'engagement et préparation du transfert de dossier."]);
  cal.push(['Été ' + tete.entree, "Démarches d'arrivée : relevés officiels, assurance, visa d'étudiante au besoin, examen médical."]);
  table([{ w: 150 }, { w: CW - 150 }], ['Quand', 'Quoi'], cal, { premiereGras: true });

  // ---------- Détail : vidéo selon la position
  const POSITIONS = {
    Lanceuse: 'Lancers de chaque type (rapide, changement de vitesse, courbe) de face et de côté, avec la vitesse affichée; deux ou trois frappes en situation de match.',
    Receveuse: 'Temps de réception à la deuxième base, blocage de balles dans la poussière, réception et cadrage, puis deux ou trois frappes en situation de match.',
    'Avant-champ': 'Ramassés dans les deux directions, relais vers chaque but, tours de jeu, puis frappes de plusieurs types de lancers.',
    Voltigeuse: 'Poursuite de longues balles, relais vers les buts, vitesse de course sur 60 pieds, puis frappes.',
    Polyvalente: 'Séquences à chacune des positions jouées, puis frappes de plusieurs types de lancers.',
  };
  kicker('La vidéo de recrutement');
  h2('Quoi filmer' + (i.position ? ' : ' + i.position.toLowerCase() : ''));
  p((POSITIONS[i.position] || 'Séquences de défensive à la position principale, relais, course et frappes de plusieurs types de lancers.') + ' Durée visée : 3 à 4 minutes, la joueuse identifiée par son numéro et sa position, les meilleurs extraits en premier. Ajouter un extrait de match récent avec la date, et joindre le lien dans chaque courriel aux entraîneurs.');

  // ---------- Détail : documents
  kicker('Les documents');
  h2('Liste de documents à préparer');
  const docs = [
    'Bulletins du secondaire (au moins les deux dernières années) et relevé de notes officiel',
    "Preuve de graduation : diplôme d'études secondaires ou DEC, selon le parcours",
    "Passeport valide (et visa d'étudiante si requis)",
    'Vidéo de recrutement et lien de partage',
    "CV sportif d'une page : statistiques, équipes, résultats de tournois, références",
    "Coordonnées de l'entraîneur actuel pour les références",
    "Résultat d'un test d'anglais si demandé par les écoles (niveau actuel : " + (i.anglais ? i.anglais.toLowerCase() : 'à préciser') + ')',
    "Examen médical et preuve d'assurance, demandés à l'arrivée",
  ];
  docs.forEach((t) => { ensure(20); const y = doc.y; doc.rect(M, y + 1, 8, 8).lineWidth(0.8).strokeColor(NAVY).stroke(); doc.font('Helvetica').fontSize(9.2).fillColor(TXT).text(t, M + 16, y, { width: CW - 16, lineGap: 1.5 }); doc.y += 4; });
  doc.moveDown(0.5);

  // ---------- Détail : liste cible
  kicker('La liste cible');
  h2("Trois paliers d'écoles");
  const divs = (i.divisions || []).join(', ') || 'divisions à préciser';
  table([{ w: 90 }, { w: 70 }, { w: CW - 160 }], ['Palier', 'Écoles', 'Critères'], [
    ['Ambition', '3 à 5', 'Programmes plus compétitifs que son niveau actuel. Divisions : ' + divs + '. Peu de places : le contact commence tôt.'],
    ['Réaliste', '6 à 10', "Programmes où elle peut jouer tôt. Programme d'études " + (i.domaine ? '« ' + i.domaine + ' » ' : '') + 'offert, exigences en anglais atteignables, bourses envisageables.'],
    ['Certitude', '4 à 6', "Écoles où elle est presque assurée d'être acceptée et de jouer. Sert de filet si l'ambition ne se réalise pas."],
  ], { premiereGras: true });
  p('Royal On Field prépare la liste nominale avec la famille à la rencontre : niveau de jeu, admissibilité scolaire, coût, région et programme d\'études.', { size: 8.6, color: MUTED });

  // ---------- Détail : questions aux entraîneurs
  kicker('Les premiers échanges');
  h2('Questions à poser aux entraîneurs');
  [
    'Combien de joueuses recrutez-vous à ma position pour la cohorte de ' + tete.entree + '?',
    "Quelle est votre lecture du DEC québécois pour l'admissibilité et l'horloge de cinq ans?",
    "Quels sont les besoins de l'équipe à ma position dans les deux prochaines années?",
    'Quel est le montant de bourse possible (athlétique et scolaire) et sur combien d\'années?',
    "Quelles sont les exigences d'anglais et les tests demandés par l'école?",
    'Le programme ' + (i.domaine ? '« ' + i.domaine + ' » ' : "d'études visé ") + "est-il compatible avec l'horaire des entraînements et des déplacements?",
    'Quand souhaitez-vous une décision, et quelles visites sont possibles avant la signature?',
  ].forEach((t) => { ensure(18); const y = doc.y; doc.font('Helvetica-Bold').fontSize(9.5).fillColor(GOLD).text('•', M, y, { width: 10 }); doc.font('Helvetica').fontSize(9.2).fillColor(TXT).text(t, M + 14, y, { width: CW - 14, lineGap: 1.5 }); doc.y += 3; });
  doc.moveDown(0.5);

  // ---------- Suite
  kicker('La suite');
  h2('Les actions, dans cet ordre');
  const aCeg = r.candidats.some((o) => o.ceg);
  const etapes = [];
  etapes.push(['Poser la question au NCAA Eligibility Center', 'La famille demande par écrit si le DEC démarre l\'horloge de cinq ans' + (aCeg ? '. La réponse départage les parcours cégep des autres. Objectif : l\'avoir avant la date limite de demande au cégep.' : ', pour confirmer le plan avant toute inscription.')]);
  etapes.push(['Garder les parcours à comparer ouverts', 'Ils restent ouverts jusqu\'à la décision' + (aCeg ? ' : la demande SRAM est due le 1er mars ' + r.fin + ' (à confirmer).' : ' : l\'inscription à l\'école en ligne se fait au printemps ' + r.fin + '.')]);
  etapes.push(['Bâtir la liste cible', 'Trois paliers d\'écoles (ambition, réaliste, certitude) sur ' + ((i.divisions || []).join(', ') || 'les divisions visées') + (i.domaine ? ', en tenant compte du domaine d\'études : ' + i.domaine + '.' : '.')]);
  if ((i.divisions || []).includes('NJCAA')) etapes.push(['Valider la voie NJCAA', 'Ses règles d\'admissibilité diffèrent de celles du NCAA : à confirmer séparément.']);
  etapes.push(['Rencontre avec Royal On Field', 'Choisir le parcours, puis préparer le plan individuel complet : calendrier mensuel, liste cible et liste de documents.']);
  etapes.forEach((e, n) => {
    doc.font('Helvetica-Bold').fontSize(9.5);
    const hh = doc.heightOfString(e[1], { width: CW - 30 }) + 24;
    ensure(hh);
    const y = doc.y;
    doc.font('Helvetica-Bold').fontSize(16).fillColor(GOLD).text(String(n + 1), M, y, { width: 22 });
    doc.font('Helvetica-Bold').fontSize(9.6).fillColor(NAVY).text(e[0], M + 28, y + 1, { width: CW - 30 });
    doc.font('Helvetica').fontSize(9).fillColor(TXT).text(e[1], M + 28, doc.y + 1, { width: CW - 30, lineGap: 1.5 });
    doc.y += 7;
  });

  // ---------- Pied de page : sources et réserve
  ensure(110);
  doc.moveDown(0.6);
  doc.moveTo(M, doc.y).lineTo(M + CW, doc.y).lineWidth(0.5).strokeColor(LINE).stroke(); doc.y += 6;
  doc.font('Helvetica-Bold').fontSize(7.4).fillColor(MUTED).text('Sources. ', M, doc.y, { continued: true, width: CW })
    .font('Helvetica').text('NCAA Division I and II Age-Based Eligibility Rules, NCAA Eligibility Center (mis à jour le 11 août 2026) · Guide NCAA des équivalences scolaires internationales, classement Tier Two du DEC québécois · Calendrier officiel NCAA Division I Softball 2026-2027 (mis à jour le 30 juillet 2026) · Législation NCAA sur la date de contact en softball (avril 2018).');
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(7.4).fillColor(MUTED).text('Bilan automatique établi à partir des réponses au questionnaire. Les règles évoluent; tout calcul se confirme par écrit auprès du NCAA Eligibility Center. Ce document ne remplace ni une décision d\'admissibilité, ni un avis en immigration, ni le plan individuel complet de Royal On Field.', M, doc.y, { width: CW });

  // numéros de page
  const pages = doc.bufferedPageRange();
  for (let n = 0; n < pages.count; n++) {
    doc.switchToPage(n);
    doc.page.margins.bottom = 0;
    doc.font('Helvetica').fontSize(7.5).fillColor('#7A8699').text('Royal Softball On Field · Bilan de parcours · ' + nom + ' · page ' + (n + 1) + ' / ' + pages.count, M, H - 36, { width: CW, align: 'center', lineBreak: false });
  }
  doc.end();
  return fini;
}
