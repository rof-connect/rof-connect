"use client";

// ============================================================================
//  ROF Connect — Module « Programme sprint » (6 semaines, 2 × 30 min)
//
//  • Chaque exercice a une ANIMATION EXPLICATIVE intégrée (silhouette animée),
//    sans fichier externe ni lien qui peut briser.
//  • Bouton « Voir des exemples vidéo » : ouvre une recherche YouTube ciblée.
//  • Pour mettre VOS propres vidéos : remplissez l'objet VIDEOS_ROF ci-dessous
//    (YouTube, Vimeo ou MP4 Supabase). La vidéo s'affiche alors sous l'animation.
//
//  Utilisation :
//    import ProgrammeSprint from "./ProgrammeSprint";
//    <ProgrammeSprint joueuse={membre} onSoumettre={(rapport) => sauvegarder(rapport)} />
// ============================================================================

import React, { useState, useEffect, useRef } from "react";

// ---------------------------------------------------------------------------
//  0. VOS VIDÉOS DE DÉMONSTRATION (facultatif) — ajoutez un lien ici quand vous aurez filmé vos joueuses
// ---------------------------------------------------------------------------
export const VIDEOS_ROF = {
  // askip:      { type: "youtube", url: "https://youtu.be/XXXXXXXXXXX" },
  // leadOff:    { type: "fichier", url: "https://<projet>.supabase.co/storage/v1/object/public/videos/lead-off.mp4" },
};

// ---------------------------------------------------------------------------
//  1. COULEURS ROF
// ---------------------------------------------------------------------------
const C = {
  // Thème sombre ROF Connect (voir app/globals.css)
  royal: "#5B8FEA",      // titres et liens (rof-poudre)
  bouton: "#2F63C4",     // boutons (rof-royal)
  royalSombre: "#12294F",
  panneau: "#171717",    // rof-carte-haut
  carte: "#0A0A0A",      // rof-blanc (fond des cartes)
  champ: "#111111",      // rof-craie
  or: "#D9B44A",
  texte: "#FFFFFF",
  gris: "#A8A8A8",
  bord: "#2A2A2A",
  vert: "#4FB477",
  rouge: "#E0524A",
  // Animation
  fondAnim: "#12294F",
  sol: "#2F63C4",
  traits: "#1d3a6e",
  proche: "#FFFFFF",
  loin: "#7FA3E8",
};

// ---------------------------------------------------------------------------
//  2. MOTEUR D'ANIMATION (silhouette)
//     Angles en degrés, 0 = segment vers le bas, positif = vers l'avant.
//     p = côté proche (foncé), l = côté éloigné (pâle)
//     torse, pc/lc = cuisses, pg/lg = genoux, pf/lf = pieds,
//     pb/lb = bras, pe/le = coudes, air = hauteur du saut, dx = déplacement
// ---------------------------------------------------------------------------
const CHAMPS = ["torse", "pc", "pg", "pf", "lc", "lg", "lf", "pb", "pe", "lb", "le", "air", "dx"];
const rad = (d) => (d * Math.PI) / 180;
const SOL = 132;

export function squelette(p, baseX = 100) {
  const t = rad(p.torse || 0);
  const epaule = { x: 38 * Math.sin(t), y: -38 * Math.cos(t) };
  const tete = { x: 48 * Math.sin(t), y: -48 * Math.cos(t) };

  const jambe = (a = 0, k = 0, f = 0) => {
    const genou = { x: 25 * Math.sin(rad(a)), y: 25 * Math.cos(rad(a)) };
    const sa = rad(a - k);
    const cheville = { x: genou.x + 25 * Math.sin(sa), y: genou.y + 25 * Math.cos(sa) };
    const fa = rad(a - k + 90 + f);
    const orteil = { x: cheville.x + 9 * Math.sin(fa), y: cheville.y + 9 * Math.cos(fa) };
    return { genou, cheville, orteil };
  };
  const bras = (u = 0, e = 0) => {
    const coude = { x: epaule.x + 19 * Math.sin(rad(u)), y: epaule.y + 19 * Math.cos(rad(u)) };
    const main = { x: coude.x + 17 * Math.sin(rad(u + e)), y: coude.y + 17 * Math.cos(rad(u + e)) };
    return { coude, main };
  };

  const jp = jambe(p.pc, p.pg, p.pf);
  const jl = jambe(p.lc, p.lg, p.lf);
  const bp = bras(p.pb, p.pe);
  const bl = bras(p.lb, p.le);

  // Le pied le plus bas touche le sol, puis on ajoute la hauteur de saut
  const bas = Math.max(jp.cheville.y, jp.orteil.y, jl.cheville.y, jl.orteil.y);
  const hx = baseX + (p.dx || 0);
  const hy = SOL - bas - (p.air || 0);
  const m = (pt) => ({ x: hx + pt.x, y: hy + pt.y });

  return {
    hanche: { x: hx, y: hy },
    epaule: m(epaule),
    tete: m(tete),
    jp: { genou: m(jp.genou), cheville: m(jp.cheville), orteil: m(jp.orteil) },
    jl: { genou: m(jl.genou), cheville: m(jl.cheville), orteil: m(jl.orteil) },
    bp: { coude: m(bp.coude), main: m(bp.main) },
    bl: { coude: m(bl.coude), main: m(bl.main) },
  };
}

const lissage = (x) => x * x * (3 - 2 * x);

export function poseAuTemps(anim, temps) {
  const kf = anim.cles;
  let i = kf.length - 1;
  while (i > 0 && kf[i].t > temps) i--;
  const a = kf[i];
  const fin = i + 1 < kf.length;
  const b = fin ? kf[i + 1] : anim.reset ? kf[i] : { ...kf[0], t: 1 };
  const span = b.t - a.t || 1;
  const x = lissage(Math.min(1, Math.max(0, (temps - a.t) / span)));
  const pose = {};
  CHAMPS.forEach((c) => (pose[c] = (a[c] || 0) + ((b[c] || 0) - (a[c] || 0)) * x));
  return pose;
}

// Inverse côté proche / côté éloigné (pour la 2e moitié d'un cycle)
const miroir = (p, t) => ({
  ...p, t,
  pc: p.lc, pg: p.lg, pf: p.lf, lc: p.pc, lg: p.pg, lf: p.pf,
  pb: p.lb, pe: p.le, lb: p.pb, le: p.pe,
});

const DEBOUT = { torse: 0, pc: 0, pg: 0, lc: 0, lg: 0, pb: -5, pe: 15, lb: 5, le: 15 };

// --- Poses de course réutilisées ---
const MARCHE_A = { torse: 0, pc: 90, pg: 90, pf: 15, lc: 0, lg: 0, lb: 50, le: 85, pb: -40, pe: 45 };
const SKIP_A = { ...MARCHE_A, air: 7 };
const SKIP_N = { ...DEBOUT, pb: 5, pe: 60, lb: 5, le: 60 };
const VOL_SPRINT = { torse: 8, pc: 80, pg: 105, pf: 15, lc: -25, lg: 70, air: 8, lb: 55, le: 85, pb: -50, pe: 45 };
const APPUI_SPRINT = { torse: 8, pc: 15, pg: 20, lc: 30, lg: 120, air: 0, pb: 0, pe: 70, lb: 0, le: 70 };
const PAS_1 = { torse: 45, pc: 75, pg: 95, pf: 10, lc: -45, lg: 10, lf: -30, lb: 70, le: 80, pb: -60, pe: 40 };

export const ANIMATIONS = {
  jogging: {
    duree: 750, defile: 70,
    cles: [
      { t: 0, torse: 5, pc: 35, pg: 60, lc: -20, lg: 40, air: 3, lb: 30, le: 70, pb: -25, pe: 50 },
      { t: 0.5, ...miroir({ torse: 5, pc: 35, pg: 60, lc: -20, lg: 40, air: 3, lb: 30, le: 70, pb: -25, pe: 50 }, 0.5) },
    ],
  },
  mobilite: {
    duree: 2600, defile: 30,
    cles: [
      { t: 0, ...DEBOUT, pb: 0, pe: 90, lb: 0, le: 90 },
      { t: 0.25, torse: 0, pc: 80, pg: 85, lc: -45, lg: 45, pb: 90, pe: 0, lb: 75, le: 0 },
      { t: 0.5, ...DEBOUT, pb: 0, pe: 90, lb: 0, le: 90 },
      { t: 0.75, torse: 0, lc: 80, lg: 85, pc: -45, pg: 45, pb: 75, pe: 0, lb: 90, le: 0 },
    ],
  },
  balancements: {
    duree: 1200, defile: 0,
    cles: [
      { t: 0, torse: -5, pc: 70, pg: 10, pf: 10, lc: 0, lg: 0, pb: 20, pe: 10, lb: 85, le: 0 },
      { t: 0.5, torse: 8, pc: -40, pg: 20, lc: 0, lg: 0, pb: 20, pe: 10, lb: 85, le: 0 },
    ],
  },
  talonsFesses: {
    duree: 520, defile: 55,
    cles: [
      { t: 0, torse: 3, pc: 5, pg: 140, lc: 0, lg: 5, pb: 25, pe: 80, lb: -25, le: 80, air: 4 },
      miroir({ torse: 3, pc: 5, pg: 140, lc: 0, lg: 5, pb: 25, pe: 80, lb: -25, le: 80, air: 4 }, 0.5),
    ],
  },
  amarch: {
    duree: 1800, defile: 30,
    cles: [
      { t: 0, ...MARCHE_A },
      { t: 0.25, ...DEBOUT },
      miroir(MARCHE_A, 0.5),
      { t: 0.75, ...DEBOUT },
    ],
  },
  askip: {
    duree: 850, defile: 70,
    cles: [{ t: 0, ...SKIP_A }, { t: 0.25, ...SKIP_N }, miroir(SKIP_A, 0.5), { t: 0.75, ...SKIP_N }],
  },
  pogos: {
    duree: 450, defile: 0,
    cles: [
      { t: 0, torse: 0, pc: 3, pg: 8, lc: -3, lg: 8, pf: -5, lf: -5, pb: 10, pe: 80, lb: 10, le: 80, air: 0 },
      { t: 0.5, torse: 0, pc: 2, pg: 0, lc: -2, lg: 0, pf: -30, lf: -30, pb: 10, pe: 80, lb: 10, le: 80, air: 13 },
    ],
  },
  tuck: {
    duree: 1100, defile: 0,
    cles: [
      { t: 0, torse: 30, pc: 45, pg: 90, lc: 40, lg: 90, pb: -40, pe: 20, lb: -35, le: 20 },
      { t: 0.3, torse: 5, pc: 0, pg: 0, lc: 0, lg: 0, pf: -30, lf: -30, pb: 160, pe: 0, lb: 155, le: 0, air: 18 },
      { t: 0.5, torse: 15, pc: 110, pg: 140, lc: 105, lg: 140, pb: 60, pe: 60, lb: 60, le: 60, air: 46 },
      { t: 0.75, torse: 30, pc: 45, pg: 90, lc: 40, lg: 90, pb: 30, pe: 40, lb: 30, le: 40 },
    ],
  },
  saut: {
    duree: 2200, defile: 0, baseX: 60, reset: true,
    cles: [
      { t: 0, ...DEBOUT },
      { t: 0.2, torse: 45, pc: 50, pg: 95, lc: 45, lg: 95, pb: -60, pe: 10, lb: -55, le: 10 },
      { t: 0.35, torse: 40, pc: -10, pg: 0, lc: -15, lg: 0, pf: -30, lf: -30, pb: 150, pe: 0, lb: 145, le: 0, air: 8, dx: 12 },
      { t: 0.5, torse: 20, pc: 90, pg: 70, lc: 85, lg: 70, pb: 90, pe: 20, lb: 85, le: 20, air: 26, dx: 45 },
      { t: 0.65, torse: 35, pc: 70, pg: 110, lc: 65, lg: 110, pb: 70, pe: 10, lb: 65, le: 10, dx: 78 },
      { t: 0.95, torse: 35, pc: 70, pg: 110, lc: 65, lg: 110, pb: 70, pe: 10, lb: 65, le: 10, dx: 78 },
    ],
  },
  bonds: {
    duree: 1100, defile: 130,
    cles: [
      { t: 0, torse: 10, pc: 75, pg: 70, pf: 15, lc: -35, lg: 40, lb: 60, le: 70, pb: -50, pe: 30, air: 18 },
      { t: 0.25, torse: 10, pc: 10, pg: 15, lc: 10, lg: 80, pb: 10, pe: 60, lb: 0, le: 60 },
      miroir({ torse: 10, pc: 75, pg: 70, pf: 15, lc: -35, lg: 40, lb: 60, le: 70, pb: -50, pe: 30, air: 18 }, 0.5),
      miroir({ torse: 10, pc: 10, pg: 15, lc: 10, lg: 80, pb: 10, pe: 60, lb: 0, le: 60 }, 0.75),
    ],
  },
  chute: {
    duree: 2400, defile: 0, baseX: 45, reset: true,
    cles: [
      { t: 0, ...DEBOUT, pb: 0, pe: 70, lb: 0, le: 70 },
      { t: 0.3, torse: 22, pc: -22, lc: -22, pb: 0, pe: 70, lb: 0, le: 70, dx: 5 },
      { t: 0.45, ...PAS_1, dx: 20 },
      { t: 0.6, ...miroir(PAS_1, 0.6), torse: 40, dx: 42 },
      { t: 0.75, ...PAS_1, torse: 30, dx: 65 },
      { t: 0.9, ...miroir(PAS_1, 0.9), torse: 20, dx: 88 },
    ],
  },
  leadOff: {
    duree: 2400, defile: 0, baseX: 40, reset: true, decor: "but",
    cles: [
      { t: 0, torse: 35, pc: 25, pg: 45, lc: -25, lg: 30, pb: 20, pe: 30, lb: -15, le: 30 },
      { t: 0.3, torse: 35, pc: 25, pg: 45, lc: -25, lg: 30, pb: 20, pe: 30, lb: -15, le: 30 },
      { t: 0.45, ...PAS_1, dx: 20 },
      { t: 0.6, ...miroir(PAS_1, 0.6), torse: 40, dx: 42 },
      { t: 0.75, ...PAS_1, torse: 30, dx: 65 },
      { t: 0.9, ...miroir(PAS_1, 0.9), torse: 20, dx: 90 },
    ],
  },
  sprint: {
    duree: 580, defile: 160,
    cles: [{ t: 0, ...VOL_SPRINT }, { t: 0.25, ...APPUI_SPRINT }, miroir(VOL_SPRINT, 0.5), miroir(APPUI_SPRINT, 0.75)],
  },
  // --- Mini-haies ---
  haiesPJ: {
    duree: 620, defile: 50, haies: "defile",
    cles: [
      { t: 0, torse: 15, pc: 30, pg: 55, lc: 25, lg: 55, pb: -35, pe: 30, lb: -30, le: 30 },
      { t: 0.5, torse: 10, pc: 75, pg: 105, lc: 70, lg: 105, pb: 45, pe: 60, lb: 40, le: 60, air: 24 },
    ],
  },
  haiesUni: {
    duree: 700, defile: 45, haies: "defile",
    cles: [
      { t: 0, torse: 15, pc: 25, pg: 45, lc: 20, lg: 100, pb: -35, pe: 40, lb: 30, le: 70 },
      { t: 0.5, torse: 10, pc: 65, pg: 95, lc: 35, lg: 110, pb: 40, pe: 70, lb: -20, le: 50, air: 22 },
    ],
  },
  haiesLat: {
    duree: 900, defile: 0, haies: [100],
    cles: [
      { t: 0, torse: 10, pc: 25, pg: 45, lc: 20, lg: 45, pb: 0, pe: 80, lb: 0, le: 80, dx: -30 },
      { t: 0.25, torse: 5, pc: 55, pg: 85, lc: 50, lg: 85, pb: 10, pe: 80, lb: 10, le: 80, air: 20, dx: 0 },
      { t: 0.5, torse: 10, pc: 25, pg: 45, lc: 20, lg: 45, pb: 0, pe: 80, lb: 0, le: 80, dx: 30 },
      { t: 0.75, torse: 5, pc: 55, pg: 85, lc: 50, lg: 85, pb: 10, pe: 80, lb: 10, le: 80, air: 20, dx: 0 },
    ],
  },
  haiesZig: {
    duree: 700, defile: 50, haies: "defile",
    cles: [
      { t: 0, torse: 12, pc: 30, pg: 55, lc: 25, lg: 55, pb: -30, pe: 40, lb: -25, le: 40, dx: -12 },
      { t: 0.5, torse: 8, pc: 65, pg: 95, lc: 60, lg: 95, pb: 30, pe: 70, lb: 25, le: 70, air: 20, dx: 12 },
    ],
  },
  haiesSprint: {
    duree: 2600, defile: 0, baseX: 25, reset: true, haies: [52, 97],
    cles: [
      { t: 0, torse: 15, pc: 30, pg: 55, lc: 25, lg: 55, pb: -35, pe: 30, lb: -30, le: 30 },
      { t: 0.12, torse: 10, pc: 75, pg: 105, lc: 70, lg: 105, pb: 45, pe: 60, lb: 40, le: 60, air: 24, dx: 27 },
      { t: 0.24, torse: 15, pc: 30, pg: 55, lc: 25, lg: 55, pb: -35, pe: 30, lb: -30, le: 30, dx: 50 },
      { t: 0.36, torse: 10, pc: 75, pg: 105, lc: 70, lg: 105, pb: 45, pe: 60, lb: 40, le: 60, air: 24, dx: 72 },
      { t: 0.48, torse: 25, pc: 30, pg: 55, lc: 25, lg: 55, pb: -35, pe: 30, lb: -30, le: 30, dx: 92 },
      { t: 0.6, ...PAS_1, dx: 108 },
      { t: 0.72, ...miroir(PAS_1, 0.72), torse: 40, dx: 128 },
      { t: 0.84, ...PAS_1, torse: 30, dx: 148 },
      { t: 0.95, ...miroir(PAS_1, 0.95), torse: 20, dx: 168 },
    ],
  },
  marche: {
    duree: 1300, defile: 35,
    cles: [
      { t: 0, torse: 0, pc: 20, pg: 5, lc: -15, lg: 10, lb: 15, le: 15, pb: -15, pe: 15 },
      miroir({ torse: 0, pc: 20, pg: 5, lc: -15, lg: 10, lb: 15, le: 15, pb: -15, pe: 15 }, 0.5),
    ],
  },
};

function Silhouette({ s }) {
  const ligne = (a, b, coul, w = 6) => (
    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={coul} strokeWidth={w} strokeLinecap="round" />
  );
  return (
    <g>
      {/* Côté éloigné */}
      {ligne(s.hanche, s.jl.genou, C.loin)}{ligne(s.jl.genou, s.jl.cheville, C.loin)}{ligne(s.jl.cheville, s.jl.orteil, C.loin, 5)}
      {ligne(s.epaule, s.bl.coude, C.loin, 5)}{ligne(s.bl.coude, s.bl.main, C.loin, 5)}
      {/* Tronc et tête */}
      {ligne(s.hanche, s.epaule, C.proche, 8)}
      <circle cx={s.tete.x} cy={s.tete.y} r={8} fill={C.proche} />
      {/* Côté proche */}
      {ligne(s.hanche, s.jp.genou, C.proche)}{ligne(s.jp.genou, s.jp.cheville, C.proche)}{ligne(s.jp.cheville, s.jp.orteil, C.proche, 5)}
      {ligne(s.epaule, s.bp.coude, C.proche, 5)}{ligne(s.bp.coude, s.bp.main, C.proche, 5)}
    </g>
  );
}

export function Animation({ id, hauteur = 150 }) {
  const anim = ANIMATIONS[id];
  const [ms, setMs] = useState(0);
  const [pause, setPause] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (pause) return;
    let debut = performance.now() - ms;
    const boucle = (now) => {
      setMs(now - debut);
      ref.current = requestAnimationFrame(boucle);
    };
    ref.current = requestAnimationFrame(boucle);
    return () => cancelAnimationFrame(ref.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pause, id]);

  if (!anim) return null;
  const t = (ms % anim.duree) / anim.duree;
  const s = squelette(poseAuTemps(anim, t), anim.baseX ?? 100);
  const decalage = ((ms / anim.duree) * (anim.defile || 0)) % 40;

  return (
    <svg
      viewBox="0 0 200 150" style={{ width: "100%", height: hauteur, display: "block", cursor: "pointer" }}
      onClick={() => setPause(!pause)} role="img" aria-label="Démonstration animée"
    >
      <rect x="0" y="0" width="200" height="150" rx="10" fill={C.fondAnim} />
      <line x1="0" y1={SOL} x2="200" y2={SOL} stroke={C.sol} strokeWidth="2" />
      {Array.from({ length: 7 }).map((_, i) => {
        const x = i * 40 - decalage;
        return <line key={i} x1={x} y1={SOL + 7} x2={x + 16} y2={SOL + 7} stroke={C.traits} strokeWidth="3" strokeLinecap="round" />;
      })}
      {anim.decor === "but" && <rect x={18} y={SOL - 3} width={16} height={6} fill="#fff" stroke={C.sol} />}
      {anim.haies && (anim.haies === "defile"
        ? [-3, -2, -1, 0, 1, 2].map((k) => 125 + k * anim.defile - (((ms / anim.duree) * anim.defile) % anim.defile))
        : anim.haies
      ).map((x, i) => (
        <path key={`h${i}`} d={`M${x - 7} ${SOL} L${x - 7} ${SOL - 12} L${x + 7} ${SOL - 12} L${x + 7} ${SOL}`} fill="none" stroke="#e3b505" strokeWidth="3" strokeLinejoin="round" />
      ))}
      <Silhouette s={s} />
      {pause && <text x="100" y="20" textAnchor="middle" fontSize="11" fill={C.gris}>⏸ pause</text>}
    </svg>
  );
}

// ---------------------------------------------------------------------------
//  3. BIBLIOTHÈQUE D'EXERCICES
// ---------------------------------------------------------------------------
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
//  5. LECTEUR VIDÉO (pour VIDEOS_ROF)
// ---------------------------------------------------------------------------
function LecteurVideo({ video, titre }) {
  const cadre = { position: "relative", width: "100%", aspectRatio: "16 / 9", background: "#0b1220", borderRadius: 10, overflow: "hidden", marginTop: 10 };
  if (video.type === "youtube") {
    const m = video.url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
    if (!m) return null;
    return <div style={cadre}><iframe title={titre} src={`https://www.youtube-nocookie.com/embed/${m[1]}?rel=0&playsinline=1`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} allow="encrypted-media; picture-in-picture" allowFullScreen /></div>;
  }
  if (video.type === "vimeo") {
    const m = video.url.match(/vimeo\.com\/(\d+)/);
    if (!m) return null;
    return <div style={cadre}><iframe title={titre} src={`https://player.vimeo.com/video/${m[1]}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }} allow="fullscreen; picture-in-picture" allowFullScreen /></div>;
  }
  return <div style={cadre}><video src={video.url} style={{ width: "100%", height: "100%", objectFit: "contain" }} controls loop muted playsInline preload="metadata" /></div>;
}

// ---------------------------------------------------------------------------
//  6. CARTE EXERCICE
// ---------------------------------------------------------------------------
function CarteExercice({ item, fait, onToggle, valeurTest, onTest, reference }) {
  const [ouvert, setOuvert] = useState(false);
  const ex = EXERCICES[item.id];
  const video = VIDEOS_ROF[item.id];
  const lienYoutube = `https://www.youtube.com/results?search_query=${encodeURIComponent(ex.recherche)}`;

  return (
    <div style={{ border: `1px solid ${fait ? C.vert : C.bord}`, borderRadius: 12, marginBottom: 10, background: C.carte, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 10, cursor: "pointer" }} onClick={() => setOuvert(!ouvert)}>
        <div style={{ width: 84, flexShrink: 0, borderRadius: 8, overflow: "hidden" }}>
          <Animation id={ex.anim} hauteur={63} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, color: C.texte, textDecoration: fait ? "line-through" : "none" }}>{ex.nom}</div>
          <div style={{ fontSize: 13, color: item.test ? C.or : C.gris, fontWeight: item.test ? 700 : 400 }}>
            {item.dosage}{item.nouveau && <span style={{ marginLeft: 6, background: C.or, color: "#fff", borderRadius: 4, padding: "0 5px", fontSize: 11, fontWeight: 800 }}>NOUVEAU</span>}{video && " · 🎬"}
          </div>
        </div>
        <input
          type="checkbox" checked={fait} aria-label="Exercice fait"
          onClick={(e) => e.stopPropagation()} onChange={onToggle}
          style={{ width: 24, height: 24, accentColor: C.vert, flexShrink: 0 }}
        />
      </div>

      {ouvert && (
        <div style={{ padding: "0 14px 14px" }}>
          <Animation id={ex.anim} hauteur={190} />
          <div style={{ fontSize: 11, color: C.gris, textAlign: "center", marginTop: 4 }}>Touche l&apos;animation pour la mettre en pause</div>

          {video && <LecteurVideo video={video} titre={ex.nom} />}

          <div style={{ marginTop: 12, fontSize: 14 }}>
            <div style={{ fontWeight: 700, color: C.royal, marginBottom: 4 }}>👉 Points clés</div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>{ex.consignes.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </div>

          {ex.erreurs && (
            <div style={{ marginTop: 10, fontSize: 14 }}>
              <div style={{ fontWeight: 700, color: C.rouge, marginBottom: 4 }}>⚠️ Erreurs à éviter</div>
              <ul style={{ margin: 0, paddingLeft: 18 }}>{ex.erreurs.map((c, i) => <li key={i}>{c}</li>)}</ul>
            </div>
          )}

          {item.test && (
            <label style={{ display: "block", marginTop: 12, fontSize: 14, fontWeight: 700 }}>
              {item.test === "temps" ? "⏱️ Meilleur temps (secondes)" : "📏 Meilleur saut (en pouces, ex. 6 pi 2 po = 74)"}
              <input
                type="number" inputMode="decimal" step={item.test === "temps" ? "0.01" : "1"} min="0"
                value={valeurTest || ""} onChange={(e) => onTest(e.target.value)}
                placeholder={item.test === "temps" ? "ex. 3.15" : "ex. 74"}
                style={{ display: "block", marginTop: 6, width: "100%", padding: 10, fontSize: 16, borderRadius: 8, border: `1px solid ${C.bord}`, background: C.champ, color: C.texte, boxSizing: "border-box" }}
              />
              {reference != null && reference !== "" && (
                <Comparaison type={item.test} avant={parseFloat(reference)} apres={valeurTest ? parseFloat(valeurTest) : null} />
              )}
            </label>
          )}

          <a
            href={lienYoutube} target="_blank" rel="noopener noreferrer"
            style={{ display: "block", marginTop: 12, padding: 10, textAlign: "center", borderRadius: 8, border: `1px solid ${C.royal}`, color: C.royal, fontWeight: 700, textDecoration: "none", fontSize: 14 }}
          >
            ▶ Voir des exemples vidéo
          </a>
        </div>
      )}
    </div>
  );
}

export function Comparaison({ type, avant, apres }) {
  const temps = type === "temps";
  const piPo = (v) => { const po = Math.round(v); return `${Math.floor(po / 12)} pi ${po % 12} po`; };
  const fmt = (v) => (temps ? v.toFixed(2).replace(".", ",") + " s" : piPo(v));
  let ecart = null;
  if (apres != null && !isNaN(apres)) {
    const gain = temps ? avant - apres : apres - avant; // moins de temps = mieux
    const valeur = temps ? Math.abs(gain).toFixed(2).replace(".", ",") + " s" : Math.round(Math.abs(gain)) + " po";
    const texte = gain === 0 ? "égal"
      : temps ? (gain > 0 ? `🔥 ${valeur} plus rapide` : `${valeur} plus lent`)
      : (gain > 0 ? `🔥 +${valeur}` : `−${valeur}`);
    ecart = { gain, texte };
  }
  return (
    <div style={{ marginTop: 8, padding: 10, borderRadius: 8, background: C.panneau, fontWeight: 600, fontSize: 14 }}>
      Semaine 1 : {fmt(avant)}
      {ecart && (
        <div style={{ marginTop: 4, color: ecart.gain > 0 ? C.vert : ecart.gain < 0 ? C.rouge : C.gris }}>
          Semaine 6 : {fmt(apres)} · {ecart.texte}
        </div>
      )}
    </div>
  );
}

function Section({ titre, sousTitre, items, faits, basculer, tests, setTest, references = {} }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
        <div style={{ fontWeight: 800, fontSize: 17, color: C.royal }}>{titre}</div>
        {sousTitre && <div style={{ fontSize: 12, color: C.gris }}>{sousTitre}</div>}
      </div>
      {items.map((item, i) => {
        const cle = `${titre}-${item.id}-${i}`;
        return (
          <CarteExercice
            key={cle} item={item} fait={!!faits[cle]} onToggle={() => basculer(cle)}
            valeurTest={tests[item.id]} onTest={(v) => setTest(item.id, v)} reference={references[item.id]}
          />
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
//  6b. INSTALLATION UNIQUE DES MINI-HAIES
// ---------------------------------------------------------------------------
function InstallationHaies({ tours }) {
  const xs = [30, 62, 94, 126, 158];
  return (
    <div style={{ border: `2px dashed ${C.or}`, borderRadius: 12, padding: 12, marginBottom: 12, background: C.panneau }}>
      <div style={{ fontWeight: 800, color: C.texte, marginBottom: 6 }}>🟨 Circuit explosif : {tours} tour{tours > 1 ? "s" : ""}</div>
      <svg viewBox="0 0 300 70" style={{ width: "100%", height: 80, display: "block" }} role="img" aria-label="Schéma d'installation des mini-haies">
        <line x1="10" y1="48" x2="290" y2="48" stroke={C.bord} strokeWidth="2" />
        {xs.map((x, i) => (
          <g key={i}>
            <path d={`M${x - 7} 48 L${x - 7} 36 L${x + 7} 36 L${x + 7} 48`} fill="none" stroke="#e3b505" strokeWidth="3" strokeLinejoin="round" />
            {i < 4 && <text x={x + 16} y="62" textAnchor="middle" fontSize="9" fill={C.gris}>3 pi</text>}
          </g>
        ))}
        <text x="158" y="28" textAnchor="middle" fontSize="9" fill={C.royal} fontWeight="700">latéraux</text>
        <line x1="170" y1="20" x2="268" y2="20" stroke={C.royal} strokeWidth="1.5" strokeDasharray="4 3" />
        <text x="219" y="15" textAnchor="middle" fontSize="9" fill={C.royal}>30 pi</text>
        <path d="M262 48 L268 34 L274 48 Z" fill="#f97316" />
        <text x="268" y="62" textAnchor="middle" fontSize="9" fill={C.gris}>cône</text>
      </svg>
      <ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13 }}>
        <li>5 mini-haies en ligne, à 3 pi l&apos;une de l&apos;autre.</li>
        <li>Un cône à 30 pi après la dernière haie.</li>
        <li>Installe-les une seule fois, pendant l&apos;échauffement.</li>
        <li><b>1 tour = les 5 exercices un après l&apos;autre</b>, sans pause (seulement le retour en marchant).</li>
        <li>Repos de 2 min entre les tours.</li>
        <li>Les sauts latéraux se font sur la dernière haie. Ramasse les haies avant les sprints.</li>
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
//  7. COMPOSANT PRINCIPAL
// ---------------------------------------------------------------------------
/**
 * @param {{
 *   programme?: any,
 *   joueuse?: { id: string } | null,
 *   semaineInitiale?: number,
 *   testsInitiaux?: Record<string, Record<string, string>>,
 *   onSoumettre?: (rapport: any) => void,
 * }} props
 */
export default function ProgrammeSprint({ programme = PROGRAMME, joueuse, semaineInitiale = 1, testsInitiaux, onSoumettre }) {
  const [semaine, setSemaine] = useState(semaineInitiale);
  const [seance, setSeance] = useState("A");
  const [faits, setFaits] = useState({});
  // Résultats des tests par semaine, ex. { 1: { sautLongueur: "185", leadOff: "3.21" }, 6: {...} }
  // Conservés sur l'appareil (et/ou fournis par Supabase via testsInitiaux) pour comparer S1 → S6.
  const cleStockage = `rof-sprint-tests-${joueuse?.id ?? "local"}`;
  const [resultats, setResultats] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem(cleStockage) || "{}");
      return { ...local, ...(testsInitiaux || {}) };
    } catch { return testsInitiaux || {}; }
  });
  useEffect(() => {
    try { localStorage.setItem(cleStockage, JSON.stringify(resultats)); } catch {}
  }, [resultats, cleStockage]);
  const tests = resultats[semaine] || {};
  const [envoye, setEnvoye] = useState(false);
  const [voirRegles, setVoirRegles] = useState(false);

  const sem = programme.semaines[semaine - 1];
  const tours = seance === "A" ? sem.circuit || 0 : 0;
  const haies = tours ? programme.circuit : [];
  const testsSeance = sem[seance].filter((x) => x.test);
  const bloc = sem[seance].filter((x) => !x.test);
  const infoSeance = programme.seances[seance];
  const total = programme.echauffement.length + testsSeance.length + haies.length + bloc.length + programme.retour.length;
  const nbFaits = Object.values(faits).filter(Boolean).length;

  const changer = (s, se) => { setSemaine(s); setSeance(se); setFaits({}); setEnvoye(false); };
  const basculer = (cle) => setFaits((f) => ({ ...f, [cle]: !f[cle] }));
  const setTest = (id, v) => setResultats((r) => ({ ...r, [semaine]: { ...(r[semaine] || {}), [id]: v } }));
  const num = (v) => (v === undefined || v === "" ? null : parseFloat(v));

  const soumettre = () => {
    onSoumettre?.({
      programme: "sprint-6sem",
      joueuseId: joueuse?.id ?? null,
      semaine, seance,
      date: new Date().toISOString(),
      exercicesFaits: Object.keys(faits).filter((k) => faits[k]),
      tests: testsSeance.length ? {
        sautLongueurPo: num(tests.sautLongueur),
        leadOff60piSec: num(tests.leadOff),
      } : null,
      testsSemaine1: semaine === 6 ? {
        sautLongueurPo: num(resultats[1]?.sautLongueur),
        leadOff60piSec: num(resultats[1]?.leadOff),
      } : null,
    });
    setEnvoye(true);
  };

  const puce = (actif) => ({
    padding: "8px 0", flex: 1, borderRadius: 8, border: 0, cursor: "pointer", fontWeight: 800, fontSize: 15,
    background: actif ? C.or : "rgba(255,255,255,.15)", color: actif ? C.royalSombre : "#fff",
  });

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", fontFamily: "system-ui, -apple-system, sans-serif", color: C.texte }}>
      {/* En-tête */}
      <div style={{ background: C.royalSombre, color: "#fff", border: `1px solid ${C.bord}`, borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 12, letterSpacing: 1, color: C.or, fontWeight: 700 }}>ROYAL ON FIELD</div>
        <div style={{ fontSize: 22, fontWeight: 800 }}>{programme.titre}</div>
        <div style={{ opacity: 0.85, fontSize: 13 }}>6 semaines · 2 séances de 30 min par semaine</div>

        <div style={{ fontSize: 12, marginTop: 12, marginBottom: 6, opacity: 0.85 }}>Semaine</div>
        <div style={{ display: "flex", gap: 6 }}>
          {programme.semaines.map((s) => (
            <button key={s.no} style={puce(s.no === semaine)} onClick={() => changer(s.no, seance)}>{s.no}</button>
          ))}
        </div>
        <div style={{ fontSize: 13, marginTop: 6, color: C.or, fontWeight: 700 }}>{sem.theme}</div>

        <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
          {Object.entries(programme.seances).map(([k, v]) => (
            <button key={k} style={{ ...puce(k === seance), fontSize: 13 }} onClick={() => changer(semaine, k)}>
              Séance {k} · {v.titre}
            </button>
          ))}
        </div>

        <div style={{ marginTop: 12, background: "rgba(255,255,255,.2)", borderRadius: 99, height: 8 }}>
          <div style={{ width: `${Math.round((nbFaits / total) * 100)}%`, background: C.or, height: 8, borderRadius: 99, transition: "width .3s" }} />
        </div>
        <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>{nbFaits}/{total} exercices</div>
      </div>

      {/* Règles */}
      <div style={{ background: C.panneau, border: `1px solid ${C.bord}`, borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 14 }}>
        <div style={{ fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "space-between" }} onClick={() => setVoirRegles(!voirRegles)}>
          <span>⚠️ Règles d&apos;or</span><span>{voirRegles ? "▴" : "▾"}</span>
        </div>
        {semaine > 1 && programme.materiel && <div style={{ marginTop: 8 }}>🟨 <b>Matériel :</b> {programme.materiel}</div>}
        {voirRegles && <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>{programme.regles.map((r, i) => <li key={i} style={{ marginBottom: 4 }}>{r}</li>)}</ul>}
      </div>

      {(() => {
        let n = 1;
        const props = { faits, basculer, tests, setTest };
        return (
          <>
            <Section titre={`${n++}. Échauffement`} sousTitre="7 min" items={programme.echauffement} {...props} />
            {testsSeance.length > 0 && (
              <Section
                titre={`${n++}. Tests ${semaine === 1 ? "de départ" : "finaux"}`}
                sousTitre={semaine === 1 ? "à refaire à la semaine 6" : "compare avec la semaine 1"}
                items={testsSeance} references={semaine === 6 ? resultats[1] || {} : {}} {...props}
              />
            )}
            {tours > 0 && (
              <>
                <InstallationHaies tours={tours} />
                <Section titre={`${n++}. Circuit mini-haies`} sousTitre={`${tours} tour${tours > 1 ? "s" : ""} · 2 min entre les tours`} items={haies} {...props} />
              </>
            )}
            {bloc.length > 0 && <Section titre={`${n++}. ${infoSeance.titre}`} sousTitre={`Repos : ${infoSeance.repos}`} items={bloc} {...props} />}
            <Section titre={`${n++}. Retour au calme`} sousTitre="3 min" items={programme.retour} {...props} />
          </>
        );
      })()}

      {/* Soumission */}
      <div style={{ border: `2px solid ${C.or}`, borderRadius: 12, padding: 14, marginBottom: 30 }}>
        <button
          onClick={soumettre} disabled={envoye || nbFaits === 0}
          style={{ width: "100%", padding: 14, fontSize: 16, fontWeight: 800, borderRadius: 10, border: 0, cursor: envoye ? "default" : "pointer", background: envoye ? C.vert : C.bouton, color: "#fff", opacity: nbFaits === 0 ? 0.5 : 1 }}
        >
          {envoye ? "✅ Séance enregistrée" : `Terminer ma séance · Semaine ${semaine}, ${seance}`}
        </button>
      </div>
    </div>
  );
}
