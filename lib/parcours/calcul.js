// Logique de calcul du questionnaire de parcours.
// Module pur (aucune dépendance) : utilisé par le formulaire ET par le serveur.
// Le serveur recalcule toujours : il ne fait jamais confiance au résultat du navigateur.

export const MOIS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];

export const PARCOURS = [
  { k: 'A', n: '12e année en ligne, 12 mois', off: 1, ceg: false, len: 'Latitude pour l\'entraînement, les voyages et le développement' },
  { k: 'B', n: '12e année en ligne, 24 mois', off: 2, ceg: false, len: 'Latitude pour l\'entraînement, les voyages et le développement, sur deux ans' },
  { k: 'C', n: 'Cégep, 2 ans',         off: 2, ceg: true,  len: 'DEC pré-universitaire' },
  { k: 'D', n: 'Cégep, 3 ans',         off: 3, ceg: true,  len: 'DEC technique' },
];

export const NIVEAUX = ['Secondaire III', 'Secondaire IV', 'Secondaire V', '12e année / diplômée', 'Cégep'];

export function fmtDate(d) {
  return d.getDate() + (d.getDate() === 1 ? 'er ' : ' ') + MOIS[d.getMonth()] + ' ' + d.getFullYear();
}

export function parseDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || '');
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  return d.getMonth() === +m[2] - 1 ? d : null;
}

// Année de la rentrée qui suit le 19e anniversaire :
// anniversaire avant le 1er septembre -> cet automne; sinon l'automne suivant.
export function dateRepere(dob) {
  const y = dob.getFullYear() + 19;
  const b = new Date(y, dob.getMonth(), dob.getDate());
  return b < new Date(y, 8, 1) ? y : y + 1;
}

const saisons = (entree, debut) => Math.max(0, Math.min(5, 5 - (entree - debut)));
export const plage = (a, b) => (a === b ? String(a) : a + ' à ' + b);

/**
 * @param {object} i  { dob:'YYYY-MM-DD', fin:2027, niveau, projet:'dip'|'direct'|'idk', duree:'1'|'2'|'idk' }
 * @param {Date} now
 */
export function calculer(i, now = new Date()) {
  const dob = parseDate(i.dob);
  const G = Number(i.fin);
  if (!dob || !Number.isInteger(G) || G < 2024 || G > 2035) return null;
  const T = dateRepere(dob);
  const projet = ['dip', 'direct'].includes(i.projet) ? i.projet : 'idk';
  const duree = ['1', '2'].includes(String(i.duree)) ? String(i.duree) : 'idk';

  const liste = PARCOURS.map((d) => {
    const entree = G + d.off;
    const debutB = d.ceg ? T : Math.min(entree, T);          // lecture B : seul l'âge démarre l'horloge
    const debutA = d.ceg ? Math.min(G, T) : Math.min(entree, T); // lecture A : le cégep démarre l'horloge à l'entrée
    const sB = saisons(entree, debutB), sA = saisons(entree, debutA);
    const best = Math.max(sA, sB), worst = Math.min(sA, sB);
    let score = worst * 3 + best;
    if (projet === 'dip' && d.ceg) score += 3;
    if (projet === 'direct' && !d.ceg) score += 3;
    if (duree === '1' && d.k === 'A') score += 3;
    if (duree === '2' && d.off >= 2) score += 3;
    if (duree === '1' && d.off >= 3) score -= 2;
    return {
      ...d, entree, worst, best, marge: T - entree, score,
      d2: new Date(entree - 3, 5, 15), d1: new Date(entree - 3, 8, 1),
      signature: 'novembre ' + (entree - 1),
      sram: d.ceg ? '1er mars ' + G : null,
    };
  });

  // Parcours retenus : filtre selon les choix déjà faits, puis un par option encore indécise.
  let pool = liste.filter((o) => {
    if (projet === 'dip' && !o.ceg) return false;
    if (projet === 'direct' && o.ceg) return false;
    if (duree === '1' && o.off !== 1) return false;
    if (duree === '2' && o.off < 2) return false;
    return true;
  });
  if (!pool.length) pool = liste.slice();
  pool.sort((a, b) => b.score - a.score);
  const meilleur = (f) => pool.find(f) || null;
  const cands = [];
  const add = (o) => { if (o && !cands.includes(o)) cands.push(o); };
  if (projet === 'idk') { add(meilleur((o) => o.ceg)); add(meilleur((o) => !o.ceg)); }
  if (duree === 'idk') { add(meilleur((o) => o.off === 1)); add(meilleur((o) => o.off >= 2)); }
  if (!cands.length) add(pool[0]);
  cands.sort((a, b) => b.score - a.score);

  // Alertes
  const alertes = [];
  if (T <= G) alertes.push("Sa date repère tombe avant ou pendant sa dernière année de secondaire : l'horloge pourrait démarrer avant son arrivée au collège américain. Ce cas doit être validé individuellement avec le NCAA Eligibility Center.");
  const ce = now.getFullYear() + (now.getMonth() >= 7 ? 1 : 0);
  let incoherent = false;
  const nv = i.niveau;
  const attendu = nv === 'Secondaire III' ? ce + 2 : nv === 'Secondaire IV' ? ce + 1 : nv === 'Secondaire V' ? ce : null;
  if (attendu !== null && G !== attendu) {
    incoherent = true;
    alertes.push("Vérifiez l'année de fin du secondaire : une joueuse actuellement en " + nv.replace('Secondaire', 'secondaire') + ' termine normalement son secondaire V en juin ' + attendu + ', et non en juin ' + G + ". Les dates suivent l'année entrée.");
  } else if ((nv === '12e année / diplômée' || nv === 'Cégep') && G >= ce) {
    incoherent = true;
    alertes.push("Vérifiez l'année de fin du secondaire : une joueuse déjà en " + (nv === 'Cégep' ? 'cégep' : '12e année ou diplômée') + ' a terminé son secondaire V en juin ' + (ce - 1) + ' ou avant, et non en juin ' + G + '.');
  }
  if (!incoherent && (G < now.getFullYear() || (G === now.getFullYear() && now.getMonth() >= 5)))
    alertes.push("L'année de fin du secondaire est déjà passée ou terminée : certaines étapes du calendrier peuvent être en retard. Nous en discuterons à la rencontre.");

  return {
    dob, fin: G, repere: T,
    anniversaire19: new Date(dob.getFullYear() + 19, dob.getMonth(), dob.getDate()),
    projet, duree, parcours: liste, candidats: cands, multi: cands.length > 1, alertes,
  };
}

export const LIBELLE_PROJET = { dip: 'diplôme québécois (DEC)', direct: '12e année en ligne', idk: 'pas décidé entre le DEC et la 12e année en ligne' };
export const LIBELLE_DUREE = { '1': '1 an', '2': '2 ans', idk: 'pas décidé : 1 an ou 2 ans' };
export const DIVISIONS = ['NCAA D1', 'NCAA D2', 'NCAA D3', 'NAIA', 'NJCAA'];

export const ouverture = (d, now) => (d <= now ? 'ouverte depuis le ' + fmtDate(d) : 'ouvre le ' + fmtDate(d));

export function margeTexte(o) {
  if (o.marge > 0) return o.marge + ' an' + (o.marge > 1 ? 's' : '') + ' de marge';
  if (o.marge === 0) return 'aucune marge';
  return 'arrivée ' + -o.marge + ' an' + (o.marge < -1 ? 's' : '') + ' après la date repère';
}

export function resumeTexte(i, r) {
  const L = [];
  L.push('QUESTIONNAIRE DE PARCOURS — Royal Softball On Field');
  L.push('Joueuse : ' + ((i.prenom || '') + ' ' + (i.nom || '')).trim());
  L.push('Naissance : ' + fmtDate(r.dob) + ' · Date repère (19 ans) : automne ' + r.repere);
  L.push('Fin du secondaire V : juin ' + r.fin + ' · Niveau actuel : ' + (i.niveau || '—'));
  L.push('Position : ' + (i.position || '—') + ' · Équipe : ' + (i.equipe || '—'));
  L.push('Projet scolaire : ' + LIBELLE_PROJET[r.projet] + ' · Développement : ' + LIBELLE_DUREE[r.duree]);
  L.push('Divisions : ' + ((i.divisions || []).join(', ') || '—') + ' · Anglais : ' + (i.anglais || '—') + ' · Domaine : ' + (i.domaine || '—'));
  L.push('');
  r.parcours.forEach((o) => L.push(o.k + ' · ' + o.n + ' : arrivée ' + o.entree + ', saisons ' + plage(o.worst, o.best) + '/5, ' + margeTexte(o)));
  L.push('Options correspondant à ses choix : ' + r.candidats.map((o) => o.k).join(', '));
  if (i.objectifs) L.push('', 'Objectifs / questions : ' + i.objectifs);
  L.push('', 'Parent / tuteur : ' + (i.parent || '—') + ' · Courriel : ' + (i.courrielParent || '—') + (i.telephone ? ' · Tél. : ' + i.telephone : ''));
  L.push('', 'Calculs informatifs; à confirmer par écrit auprès du NCAA Eligibility Center.');
  return L.join('\n');
}
