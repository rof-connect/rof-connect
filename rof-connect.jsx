import { useState, useEffect, useCallback, useRef } from "react";

/* ============================================================
   ROF CONNECT — Royal On Field · Baseball & Softball
   Plans d'entraînement · Relais · Vidéos · Signaux
   Rôles : Admin · Entraîneur · Joueur (statuts évolutifs)
   ============================================================ */

const C = {
  noir: "#05070C", // fond principal
  marine: "#0B1220", // section alternée
  marine2: "#152340", // bulles / chips
  royal: "#2C5FE0", // bleu royal
  royalSombre: "#132A5E", // navy accent
  poudre: "#7FC4EC", // bleu poudre — signature Royal
  or: "#E8B93F",
  champagne: "#7FC4EC", // accents/kickers en bleu poudre
  orFonce: "#B8860B",
  craie: "#111A2B", // surfaces en creux
  blanc: "#0E1626", // fond de carte
  carteHaut: "#17203A",
  texte: "#E7EDF7",
  gris: "#93A1BC",
  ligne: "#22304C",
  gazon: "#4FB477",
  rouge: "#E0524A",
  pur: "#FFFFFF",
};

const STATUTS = [
  { id: 1, nom: "Prospect", desc: "Nouveau joueur·euse intéressé·e à joindre le programme", bg: "#E5E7EB", fg: "#374151" },
  { id: 2, nom: "Mineur", desc: "Joueurs et joueuses de 8 à 10 ans", bg: "#D8E8DC", fg: "#1F5C38" },
  { id: 3, nom: "Majeur", desc: "Joueurs et joueuses de 11 et 12 ans", bg: "#CBE3D2", fg: "#14532D" },
  { id: 4, nom: "Intermédiaire", desc: "Baseball seulement — joueurs de 13 ans", bg: "#CFE8E6", fg: "#115E59" },
  { id: 5, nom: "Junior", desc: "Joueurs de 14 ans · joueuses de 13 et 14 ans", bg: "#D9E2F8", fg: "#1E3A8A" },
  { id: 6, nom: "Senior", desc: "Joueurs et joueuses de 15 et 16 ans", bg: "#DDD6F3", fg: "#4C1D95" },
  { id: 7, nom: "JV", desc: "Joueuses élites Prospect — 14 ans et +", bg: "#F6E7C4", fg: "#8A5B00" },
  { id: 8, nom: "Varsity", desc: "Joueuses élites Premier — 14 ans et +", bg: "#101D3C", fg: "#E0A82E" },
];

const EQUIPES_DEFAUT = [
  { id: "bb10u", nom: "Baseball 10U", sport: "Baseball", coachCode: "ROF-BB10" },
  { id: "bb12u", nom: "Baseball 12U", sport: "Baseball", coachCode: "ROF-BB12" },
  { id: "bb14u", nom: "Baseball 14U", sport: "Baseball", coachCode: "ROF-BB14" },
  { id: "sb12u", nom: "Softball 12U", sport: "Softball", coachCode: "ROF-SB12" },
  { id: "sb14u", nom: "Softball 14U", sport: "Softball", coachCode: "ROF-SB14" },
  { id: "sbvar", nom: "Softball Varsity", sport: "Softball", coachCode: "ROF-VAR" },
];

const SECTIONS = [
  { id: "agenda", nom: "Agenda", titre: "Calendrier & présences", accesDefaut: 1 },
  { id: "nouvelles", nom: "Nouvelles", titre: "Nouvelles & photos", accesDefaut: 1 },
  { id: "saison", nom: "Saison", titre: "Plan annuel d'entraînement", accesDefaut: 2 },
  { id: "plans", nom: "Plans", titre: "Plans d'entraînement", accesDefaut: 2 },
  { id: "relais", nom: "Relais", titre: "Système de relayeur", accesDefaut: 2 },
  { id: "videos", nom: "Vidéos", titre: "Vidéos à regarder", accesDefaut: 1 },
  { id: "gamechanger", nom: "GC", titre: "GameChanger", accesDefaut: 1 },
  { id: "signaux", nom: "Signaux", titre: "Signaux de l'équipe", accesDefaut: 2 },
];

/* ---------- Stockage ---------- */
async function sGet(key, shared = true) {
  try {
    const r = await window.storage.get(key, shared);
    return r ? JSON.parse(r.value) : null;
  } catch {
    return null;
  }
}
async function sSet(key, val, shared = true) {
  try {
    await window.storage.set(key, JSON.stringify(val), shared);
    return true;
  } catch {
    return false;
  }
}
async function sDel(key, shared = true) {
  try {
    await window.storage.delete(key, shared);
  } catch {}
}

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const contenuVide = () => ({ agenda: [], nouvelles: [], saison: [], plans: [], relais: [], videos: [], gamechanger: [], signaux: [] });

/* ---------- Petits composants ---------- */
function BadgeStatut({ statut, petit }) {
  const s = STATUTS.find((x) => x.id === statut) || STATUTS[0];
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wide ${
        petit ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-xs"
      }`}
      style={{ background: s.bg, color: s.fg, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}
    >
      {s.nom}
    </span>
  );
}

function Couture() {
  /* couture de balle — détail signature */
  return (
    <svg width="46" height="14" viewBox="0 0 46 14" fill="none" aria-hidden="true">
      <path d="M2 7 Q 23 -6 44 7" stroke={C.rouge} strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M2 7 Q 23 20 44 7" stroke={C.rouge} strokeWidth="1.6" strokeDasharray="3 4" strokeLinecap="round" />
    </svg>
  );
}

const CHAMPAGNE = "#E8B93F";

function LogoR({ h = 96 }) {
  /* R couronné — Royal On Field · Earn the Crown */
  return (
    <svg width={h} height={h * 1.18} viewBox="0 0 100 118" aria-label="Royal On Field">
      <path
        d="M24 34 L31 13 L42 27 L50 7 L58 27 L69 13 L76 34"
        fill="none"
        stroke={CHAMPAGNE}
        strokeWidth="5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx="36" cy="33" r="2.6" fill={CHAMPAGNE} />
      <circle cx="50" cy="30" r="2.6" fill={CHAMPAGNE} />
      <circle cx="64" cy="33" r="2.6" fill={CHAMPAGNE} />
      <text
        x="50"
        y="103"
        textAnchor="middle"
        fontSize="80"
        fontFamily="'Playfair Display', Georgia, serif"
        fontWeight="800"
        fill="#7FC4EC"
        stroke="#FFFFFF"
        strokeWidth="3.5"
        paintOrder="stroke"
      >
        R
      </text>
    </svg>
  );
}


function Champ({ children, ...p }) {
  return (
    <input
      {...p}
      className="w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:ring-2"
      style={{ borderColor: C.ligne, color: C.texte, background: C.blanc }}
    />
  );
}

function Zone({ ...p }) {
  return (
    <textarea
      {...p}
      className="w-full rounded-lg border px-3 py-2.5 text-base outline-none focus:ring-2"
      style={{ borderColor: C.ligne, color: C.texte, background: C.blanc, minHeight: 96 }}
    />
  );
}

function Selecteur({ options, ...p }) {
  return (
    <select
      {...p}
      className="w-full rounded-lg border px-3 py-2.5 text-base outline-none"
      style={{ borderColor: C.ligne, color: C.texte, background: C.blanc }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function Bouton({ enfant, plein, danger, ...p }) {
  return (
    <button
      {...p}
      className="rounded-lg px-4 py-2.5 text-sm font-bold uppercase tracking-wider transition-opacity active:opacity-70 disabled:opacity-40"
      style={{
        fontFamily: "'Barlow Condensed', sans-serif",
        letterSpacing: "0.08em",
        background: danger ? "transparent" : plein ? C.or : "transparent",
        color: danger ? C.rouge : plein ? C.marine : C.royal,
        border: plein ? "none" : `1.5px solid ${danger ? C.rouge : C.royal}`,
      }}
    >
      {enfant}
    </button>
  );
}

function Etiquette({ texte }) {
  return (
    <div
      className="mb-1 mt-3 text-xs font-bold uppercase"
      style={{ color: C.gris, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}
    >
      {texte}
    </div>
  );
}

function SelectAcces({ value, onChange }) {
  return (
    <Selecteur
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      options={STATUTS.map((s) => ({ value: s.id, label: `Visible dès : ${s.nom}` }))}
    />
  );
}

/* ============================================================
   SITE WEB PUBLIC — Royal On Field · Académie élite
   ============================================================ */
const STATS_HERO = [
  ["5", "Titres canadiens Softball"],
  ["3", "Équipes à la World Series en 2025"],
  ["8", "Divisions, du prospect au Varsity"],
  ["2", "Sports — Baseball & Softball"],
];

const PILIERS = [
  {
    t: "Performance athlétique",
    d: "Préparation physique périodisée, analyse vidéo, données de match et encadrement d'entraîneurs d'élite. Chaque geste est mesuré, chaque progression est planifiée sur l'année complète.",
    ic: "⚡",
  },
  {
    t: "Parcours académique",
    d: "Du PSES au primaire jusqu'au sport-études du Collège L'Assomption, l'école passe en premier — parce que les grandes carrières se bâtissent aussi en classe.",
    ic: "🎓",
  },
  {
    t: "Caractère & leadership",
    d: "Earn the Crown n'est pas un slogan : c'est une culture d'exigence, de résilience et de respect qui forme des leaders sur le terrain comme dans la vie.",
    ic: "👑",
  },
];

const PARCOURS = [
  {
    age: "12 ans",
    items: ["Championnat provincial Baseball", "Championnat canadien *", "World Series"],
  },
  {
    age: "14 ans",
    items: [
      "Championnat Est-Canada Baseball 13U",
      "Championnat Est-Canada Baseball 14U",
      "Championnat canadien Baseball & Softball",
      "World Series Baseball & Softball",
    ],
  },
  {
    age: "16 ans",
    items: [
      "Championnat Est-Canada Baseball 16U",
      "Championnat canadien * Baseball & Softball",
      "World Series Baseball & Softball",
    ],
  },
];

const SCOLAIRE = [
  { n: "PSES — 5e et 6e année", t: "Primaire", d: "Programme sport-études au primaire, offert pour la région de Lanaudière." },
  { n: "Collège L'Assomption", t: "Secondaire 1 à 5", d: "Sport-études Baseball et Softball, de la 1re à la 5e secondaire." },
];

const PLACEMENT = [
  "Profil FieldLevel bâti et suivi pour chaque athlète élite",
  "Vidéos de recrutement produites par l'académie",
  "Exposition NCAA · NAIA · U Sports",
  "Tournois-vitrines aux États-Unis (Floride, Texas, New York)",
  "Accompagnement des familles : admissibilité, bourses, contacts",
];

const PALMARES = [
  {
    annee: "2026",
    faits: [
      "Champion Fastpitch Nation « The Thin Blue Line » — 14U",
      "Saison en cours — à suivre 👑",
    ],
  },
  {
    annee: "2025",
    faits: [
      "Champion canadien Softball — 12U · 14U · 16U",
      "Participation à la World Series Softball — 12U · 14U · 16U",
      "Champion Triple Crown Binghamton — 14U",
      "Champion Fastpitch Nation « Firecracker 4th of July » — 16U",
      "Champion Petite Ligue Québec Baseball — 12U",
    ],
  },
  {
    annee: "2024",
    faits: ["Champion canadien Softball — 12U · 14U", "Participation à la World Series Softball"],
  },
];

function SiteWeb({ onEntrer }) {
  const [menu, setMenu] = useState(false);
  const aller = (id) => {
    setMenu(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  const liens = [
    ["apropos", "Approche"],
    ["programmes", "Voies"],
    ["scolaire", "Scolaire"],
    ["academie", "Recrutement"],
    ["champions", "Résultats"],
    ["rejoindre", "Admission"],
  ];

  return (
    <div style={{ background: C.noir, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700&family=Inter:wght@400;600&family=Playfair+Display:wght@800&family=Dancing+Script:wght@600&display=swap');
        html{scroll-behavior:smooth}`}</style>

      {/* Barre de navigation */}
      <header className="sticky top-0 z-30" style={{ background: "rgba(5,7,12,0.92)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${C.ligne}` }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <button onClick={() => aller("haut")} className="flex items-center gap-2">
            <LogoR h={34} />
            <span className="text-xl font-bold uppercase" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}>
              Royal <span style={{ color: C.or }}>On Field</span>
            </span>
          </button>
          <nav className="hidden items-center gap-6 md:flex">
            {liens.map(([id, l]) => (
              <button key={id} onClick={() => aller(id)} className="text-sm font-semibold uppercase tracking-wide" style={{ color: C.gris, letterSpacing: "0.06em" }}>
                {l}
              </button>
            ))}
            <button onClick={onEntrer} className="rounded-lg px-4 py-2 text-sm font-bold uppercase" style={{ background: C.or, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
              Espace membres
            </button>
          </nav>
          <button onClick={() => setMenu(!menu)} className="text-2xl md:hidden" style={{ color: C.or }}>
            ☰
          </button>
        </div>
        {menu && (
          <div className="border-t px-5 py-3 md:hidden" style={{ borderColor: C.ligne, background: C.noir }}>
            {liens.map(([id, l]) => (
              <button key={id} onClick={() => aller(id)} className="block w-full py-2 text-left text-base font-semibold uppercase" style={{ color: C.texte }}>
                {l}
              </button>
            ))}
            <button onClick={onEntrer} className="mt-2 w-full rounded-lg py-2.5 text-base font-bold uppercase" style={{ background: C.or, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
              Espace membres
            </button>
          </div>
        )}
      </header>

      {/* Héro */}
      <section id="haut" className="relative overflow-hidden px-5 pb-10 pt-20 text-center" style={{ background: `radial-gradient(circle at 50% 0%, ${C.royalSombre} 0%, ${C.noir} 62%)` }}>
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 82% 18%, ${C.orFonce}33 0%, transparent 40%)` }} />
        <div className="relative mx-auto max-w-3xl">
          <Kicker texte="Académie élite · Baseball & Softball · Québec" centre />
          <div className="mt-5 flex justify-center">
            <LogoR h={140} />
          </div>
          <h1 className="mt-4 text-5xl font-bold uppercase leading-none sm:text-7xl" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}>
            Deviens l'athlète que tu <span style={{ color: C.or }}>mérites</span> d'être.
          </h1>
          <div className="mt-3 text-4xl sm:text-5xl" style={{ color: C.champagne, fontFamily: "'Dancing Script', cursive" }}>
            Earn the crown.
          </div>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed" style={{ color: C.gris }}>
            Royal On Field est l'académie québécoise de développement complet — athlétique, scolaire et humain — pour les joueurs et
            joueuses de baseball et softball qui visent les plus grandes scènes, jusqu'à Williamsport.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <button onClick={() => aller("apropos")} className="rounded-xl px-6 py-3 text-base font-bold uppercase" style={{ background: C.or, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
              Découvrir l'académie
            </button>
            <button onClick={onEntrer} className="rounded-xl px-6 py-3 text-base font-bold uppercase" style={{ background: "transparent", color: C.or, border: `1.5px solid ${C.or}`, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
              Espace membres
            </button>
          </div>
          <div className="mt-8 text-xs uppercase" style={{ color: C.gris, letterSpacing: "0.2em", fontFamily: "'Barlow Condensed', sans-serif" }}>
            Baseball Québec · Softball Québec
          </div>
        </div>

        {/* Bandeau de statistiques */}
        <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl md:grid-cols-4" style={{ background: C.ligne, border: `1px solid ${C.ligne}` }}>
          {STATS_HERO.map(([n, l]) => (
            <div key={l} className="px-4 py-6" style={{ background: C.marine }}>
              <div className="text-5xl font-bold" style={{ color: C.or, fontFamily: "'Barlow Condensed', sans-serif" }}>
                {n}
              </div>
              <div className="mt-1 text-xs uppercase leading-snug" style={{ color: C.gris, letterSpacing: "0.08em" }}>
                {l}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* L'expérience Royal — les trois piliers */}
      <Section id="apropos" kicker="Notre approche" titre="L'expérience Royal" fond={C.noir}>
        <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed" style={{ color: C.texte }}>
          Comme les grandes académies internationales, nous développons la personne au complet. Trois piliers portent chaque athlète,
          du premier entraînement jusqu'au niveau collégial et universitaire.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PILIERS.map((p, i) => (
            <div key={p.t} className="rounded-2xl border p-7" style={{ background: C.blanc, borderColor: C.ligne }}>
              <div className="flex items-center justify-between">
                <span className="text-3xl">{p.ic}</span>
                <span className="text-5xl font-bold" style={{ color: C.royalSombre, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  0{i + 1}
                </span>
              </div>
              <div className="mt-3 text-2xl font-bold uppercase leading-tight" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}>
                {p.t}
              </div>
              <div className="mt-2 h-0.5 w-10" style={{ background: C.or }} />
              <p className="mt-3 text-sm leading-relaxed" style={{ color: C.gris }}>
                {p.d}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Voies de développement */}
      <Section id="programmes" kicker="Voies de développement" titre="Un parcours. Une destination." fond={C.marine}>
        <p className="mx-auto mb-8 max-w-2xl text-center text-base" style={{ color: C.gris }}>
          Chaque groupe d'âge s'inscrit dans un plan de développement continu qui vise les plus grandes scènes du baseball et de la
          softball mineurs — jusqu'à Williamsport.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {PARCOURS.map((g) => (
            <div key={g.age} className="flex flex-col rounded-2xl border p-6" style={{ background: C.blanc, borderColor: C.ligne }}>
              <div className="text-4xl font-bold uppercase" style={{ color: C.or, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}>
                {g.age}
              </div>
              <div className="mt-2 h-0.5 w-10" style={{ background: C.royal }} />
              <ul className="mt-4 grid gap-2.5">
                {g.items.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-base leading-snug" style={{ color: C.texte }}>
                    <span style={{ color: C.champagne }}>♦</span> {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs" style={{ color: C.gris }}>
          * Selon la qualification
        </p>
      </Section>

      {/* Programme scolaire */}
      <Section id="scolaire" kicker="Étudiant·e-athlète d'abord" titre="Programme scolaire" fond={C.noir}>
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg" style={{ color: C.texte }}>
          La réussite scolaire n'est pas négociable. Notre continuum école-terrain accompagne l'athlète du primaire à la fin du
          secondaire, sans compromis.
        </p>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {SCOLAIRE.map((s) => (
            <div key={s.n} className="rounded-2xl border p-6" style={{ background: C.blanc, borderColor: C.ligne }}>
              <div className="text-xs font-bold uppercase" style={{ color: C.champagne, letterSpacing: "0.1em", fontFamily: "'Barlow Condensed', sans-serif" }}>
                {s.t}
              </div>
              <div className="mt-1 text-2xl font-bold uppercase leading-tight" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}>
                {s.n}
              </div>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: C.gris }}>
                {s.d}
              </p>
              <div className="mt-3 text-xs font-bold uppercase" style={{ color: C.royal, letterSpacing: "0.08em", fontFamily: "'Barlow Condensed', sans-serif" }}>
                Baseball · Softball
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Placement & recrutement */}
      <Section id="academie" kicker="L'après-Royal" titre="Placement & recrutement" fond={C.marine}>
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed" style={{ color: C.texte }}>
              Le développement ne s'arrête pas au dernier retrait. Pour nos athlètes JV et Varsity, l'académie bâtit activement le pont
              vers le niveau collégial et universitaire.
            </p>
            <ul className="mt-5 grid gap-2.5">
              {PLACEMENT.map((x) => (
                <li key={x} className="flex items-start gap-2 text-base leading-snug" style={{ color: C.texte }}>
                  <span style={{ color: C.or }}>♦</span> {x}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border p-8 text-center" style={{ background: `linear-gradient(160deg, ${C.royalSombre}, ${C.marine2})`, borderColor: C.royalSombre }}>
            <div className="flex justify-center">
              <LogoR h={110} />
            </div>
            <div className="mt-3 text-3xl" style={{ color: C.champagne, fontFamily: "'Dancing Script', cursive" }}>
              Built Royal.
            </div>
            <div className="mt-2 text-xs uppercase" style={{ color: C.poudre, letterSpacing: "0.15em", fontFamily: "'Barlow Condensed', sans-serif" }}>
              NCAA · NAIA · U Sports
            </div>
          </div>
        </div>
      </Section>

      {/* Résultats */}
      <Section id="champions" kicker="Résultats" titre="Le palmarès parle" fond={C.noir}>
        <div className="mx-auto max-w-3xl">
          {PALMARES.map((a) => (
            <div key={a.annee} className="mb-8 last:mb-0">
              <div className="flex items-center gap-4">
                <div className="text-5xl font-bold" style={{ color: C.or, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {a.annee}
                </div>
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${C.orFonce}, transparent)` }} />
              </div>
              <ul className="mt-3 grid gap-2.5">
                {a.faits.map((x) => (
                  <li
                    key={x}
                    className="flex items-start gap-3 rounded-xl border px-4 py-3 text-base leading-snug"
                    style={{ background: C.blanc, borderColor: x.startsWith("Champion") ? C.orFonce : C.ligne, color: C.texte }}
                  >
                    <span className="shrink-0" style={{ color: C.champagne }}>{x.startsWith("Champion") ? "🏆" : "⭐"}</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Admission */}
      <Section id="rejoindre" kicker="Admission" titre="Ton parcours commence ici" fond={C.marine}>
        <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed" style={{ color: C.texte }}>
          L'admission débute par un profil <strong style={{ color: C.champagne }}>Prospect</strong> dans l'espace membres. Notre
          personnel évalue chaque athlète et l'assigne à sa division — de Mineur à Varsity. Joueurs, joueuses et parents y retrouvent
          calendrier, plan annuel, messagerie d'équipe et suivi de recrutement.
        </p>
        <div className="mt-7 text-center">
          <button onClick={onEntrer} className="rounded-xl px-8 py-4 text-lg font-bold uppercase" style={{ background: C.or, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}>
            Créer mon profil Prospect
          </button>
          <div className="mt-3 text-xs" style={{ color: C.gris }}>
            Déjà membre ? Le même bouton mène à la connexion.
          </div>
        </div>
      </Section>

      {/* Pied de page */}
      <footer className="px-5 py-10 text-center" style={{ background: C.noir, borderTop: `1px solid ${C.ligne}` }}>
        <div className="flex justify-center">
          <LogoR h={46} />
        </div>
        <div className="mt-3 text-sm uppercase" style={{ color: C.gris, letterSpacing: "0.12em", fontFamily: "'Barlow Condensed', sans-serif" }}>
          #EarnTheCrown · #BuiltRoyal · #RoyalOnField
        </div>
        <div className="mt-2 text-xs" style={{ color: C.gris }}>
          Royal On Field — Académie élite Baseball & Softball · Québec · OBNL
        </div>
      </footer>
    </div>
  );
}

function Kicker({ texte, centre }) {
  return (
    <div className={centre ? "flex items-center justify-center gap-3" : "flex items-center gap-3"}>
      <div className="h-px w-8" style={{ background: C.orFonce }} />
      <div className="text-xs font-bold uppercase" style={{ color: C.champagne, letterSpacing: "0.25em", fontFamily: "'Barlow Condensed', sans-serif" }}>
        {texte}
      </div>
      <div className="h-px w-8" style={{ background: C.orFonce }} />
    </div>
  );
}

function Section({ id, titre, kicker, fond, children }) {
  return (
    <section id={id} className="px-5 py-16" style={{ background: fond }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          {kicker ? <Kicker texte={kicker} centre /> : (
            <div className="flex justify-center">
              <Couture />
            </div>
          )}
          <h2 className="mt-3 text-4xl font-bold uppercase sm:text-5xl" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}>
            {titre}
          </h2>
        </div>
        {children}
      </div>
    </section>
  );
}

/* ---------- Écran d'authentification ---------- */
function EcranAuth({ config, players, onLogin, onRegister, onRetour }) {
  const [role, setRole] = useState("joueur");
  const [mode, setMode] = useState("login");
  const [equipe, setEquipe] = useState(config.teams[0]?.id || "");
  const [nom, setNom] = useState("");
  const [nip, setNip] = useState("");
  const [fiche, setFiche] = useState({});
  const majF = (k) => (e) => setFiche({ ...fiche, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [occupe, setOccupe] = useState(false);

  const soumettre = async () => {
    setErr("");
    setOccupe(true);
    try {
      if (role === "admin") {
        if (code.trim() === config.adminPin) onLogin({ role: "admin", teamId: config.teams[0]?.id || "" });
        else setErr("NIP administrateur incorrect.");
      } else if (role === "coach") {
        const eq = config.teams.find((t) => t.id === equipe);
        if (eq && code.trim().toUpperCase() === eq.coachCode.toUpperCase())
          onLogin({ role: "coach", teamId: eq.id });
        else setErr("Code d'entraîneur incorrect pour cette équipe.");
      } else {
        const n = nom.trim();
        if (!n || nip.trim().length < 4) {
          setErr("Entre ton nom complet et un NIP de 4 chiffres.");
        } else if (mode === "inscription") {
          if (!fiche.naissance || !(fiche.parentTel || "").trim()) {
            setErr("Complète au minimum la date de naissance et le téléphone d'un parent ou tuteur.");
          } else {
            const existe = players.find(
              (p) => p.teamId === equipe && p.nom.toLowerCase() === n.toLowerCase()
            );
            if (existe) setErr("Ce nom est déjà inscrit dans cette équipe. Connecte-toi plutôt.");
            else
              await onRegister({
                id: uid(),
                nom: n,
                nip: nip.trim(),
                teamId: equipe,
                statut: 1,
                creeLe: Date.now(),
                naissance: fiche.naissance || "",
                position: fiche.position || "",
                lance: fiche.lance || "",
                frappe: fiche.frappe || "",
                parentNom: fiche.parentNom || "",
                parentTel: fiche.parentTel || "",
                parentCourriel: fiche.parentCourriel || "",
                sante: fiche.sante || "",
                consentement: !!fiche.consentement,
              });
          }
        } else {
          const p = players.find(
            (x) => x.teamId === equipe && x.nom.toLowerCase() === n.toLowerCase() && x.nip === nip.trim()
          );
          if (p) onLogin({ role: "joueur", teamId: equipe, playerId: p.id });
          else setErr("Nom ou NIP introuvable. Vérifie ton équipe, ou inscris-toi.");
        }
      }
    } finally {
      setOccupe(false);
    }
  };

  const optEquipes = config.teams.map((t) => ({ value: t.id, label: t.nom }));

  return (
    <div className="flex min-h-screen flex-col" style={{ background: C.noir }}>
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <LogoR h={104} />
        <h1
          className="mt-2 text-center text-5xl font-bold uppercase leading-none"
          style={{ color: C.blanc, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}
        >
          Royal <span style={{ color: C.or }}>On Field</span>
        </h1>
        <div
          className="mt-1 text-3xl"
          style={{ color: CHAMPAGNE, fontFamily: "'Dancing Script', cursive" }}
        >
          Earn the crown.
        </div>
        <div
          className="mt-3 text-sm uppercase"
          style={{ color: C.poudre, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.22em" }}
        >
          Baseball · Softball · Québec
        </div>

        <button onClick={onRetour} className="mt-6 text-sm" style={{ color: C.gris }}>
          ← Retour au site
        </button>

        <div className="mt-8 w-full max-w-md rounded-2xl p-5 shadow-xl" style={{ background: C.blanc }}>
          {/* Choix du rôle */}
          <div className="flex rounded-xl p-1" style={{ background: C.craie }}>
            {[
              { id: "joueur", l: "Joueur·euse" },
              { id: "coach", l: "Entraîneur" },
              { id: "admin", l: "Admin" },
            ].map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  setRole(r.id);
                  setErr("");
                }}
                className="flex-1 rounded-lg py-2 text-sm font-bold uppercase"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.06em",
                  background: role === r.id ? C.royalSombre : "transparent",
                  color: role === r.id ? C.or : C.gris,
                }}
              >
                {r.l}
              </button>
            ))}
          </div>

          {role === "joueur" && (
            <div className="mt-2 flex gap-4 px-1">
              {["login", "inscription"].map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setErr("");
                  }}
                  className="py-2 text-sm font-semibold"
                  style={{
                    color: mode === m ? C.royal : C.gris,
                    borderBottom: mode === m ? `2px solid ${C.or}` : "2px solid transparent",
                  }}
                >
                  {m === "login" ? "Connexion" : "Inscription"}
                </button>
              ))}
            </div>
          )}

          {role !== "admin" && (
            <>
              <Etiquette texte="Équipe" />
              <Selecteur value={equipe} onChange={(e) => setEquipe(e.target.value)} options={optEquipes} />
            </>
          )}

          {role === "joueur" && (
            <>
              <Etiquette texte="Nom complet" />
              <Champ value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. : Bella Di Peco" />
              <Etiquette texte="NIP (4 chiffres)" />
              <Champ
                value={nip}
                onChange={(e) => setNip(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="••••"
                inputMode="numeric"
                type="password"
              />
              {mode === "inscription" && (
                <>
                  <Etiquette texte="Date de naissance *" />
                  <Champ value={fiche.naissance || ""} onChange={majF("naissance")} type="date" />
                  <Etiquette texte="Position principale" />
                  <Selecteur
                    value={fiche.position || ""}
                    onChange={majF("position")}
                    options={[
                      { value: "", label: "— Choisir —" },
                      ...["Lanceur·euse", "Receveur·euse", "1er but", "2e but", "3e but", "Arrêt-court", "Champ extérieur", "Utilitaire"].map((p) => ({ value: p, label: p })),
                    ]}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Etiquette texte="Lance" />
                      <Selecteur
                        value={fiche.lance || ""}
                        onChange={majF("lance")}
                        options={[{ value: "", label: "—" }, { value: "Droite", label: "Droite" }, { value: "Gauche", label: "Gauche" }]}
                      />
                    </div>
                    <div>
                      <Etiquette texte="Frappe" />
                      <Selecteur
                        value={fiche.frappe || ""}
                        onChange={majF("frappe")}
                        options={[{ value: "", label: "—" }, { value: "Droite", label: "Droite" }, { value: "Gauche", label: "Gauche" }, { value: "Ambidextre", label: "Ambidextre" }]}
                      />
                    </div>
                  </div>
                  <Etiquette texte="Nom du parent / tuteur" />
                  <Champ value={fiche.parentNom || ""} onChange={majF("parentNom")} placeholder="Ex. : Nick Di Peco" />
                  <Etiquette texte="Téléphone du parent / tuteur *" />
                  <Champ value={fiche.parentTel || ""} onChange={majF("parentTel")} placeholder="Ex. : 450 555-1234" inputMode="tel" />
                  <Etiquette texte="Courriel du parent / tuteur" />
                  <Champ value={fiche.parentCourriel || ""} onChange={majF("parentCourriel")} placeholder="parent@courriel.com" inputMode="email" />
                  <Etiquette texte="Allergies / infos médicales" />
                  <Champ value={fiche.sante || ""} onChange={majF("sante")} placeholder="Ex. : allergie aux arachides (optionnel)" />
                  <label className="mt-3 flex items-start gap-2 text-sm" style={{ color: C.texte }}>
                    <input type="checkbox" checked={!!fiche.consentement} onChange={majF("consentement")} className="mt-0.5" />
                    <span>J'autorise Royal On Field à utiliser des photos et vidéos de l'athlète à des fins promotionnelles.</span>
                  </label>
                  <p className="mt-3 text-sm" style={{ color: C.gris }}>
                    Tu commences avec le statut <strong style={{ color: C.champagne }}>Prospect</strong>. Ton entraîneur fera évoluer ton
                    statut selon ton programme — chaque statut débloque du contenu.
                  </p>
                </>
              )}
            </>
          )}

          {role === "coach" && (
            <>
              <Etiquette texte="Code d'entraîneur" />
              <Champ value={code} onChange={(e) => setCode(e.target.value)} placeholder="Ex. : ROF-BB12" />
            </>
          )}

          {role === "admin" && (
            <>
              <Etiquette texte="NIP administrateur" />
              <Champ value={code} onChange={(e) => setCode(e.target.value)} placeholder="••••" type="password" />
            </>
          )}

          {err && (
            <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "#2A1413", color: C.rouge }}>
              {err}
            </div>
          )}

          <div className="mt-5">
            <button
              onClick={soumettre}
              disabled={occupe}
              className="w-full rounded-xl py-3 text-lg font-bold uppercase tracking-wider active:opacity-80 disabled:opacity-50"
              style={{
                background: C.or,
                color: C.pur,
                fontFamily: "'Barlow Condensed', sans-serif",
                letterSpacing: "0.1em",
              }}
            >
              {occupe ? "Un instant…" : role === "joueur" && mode === "inscription" ? "M'inscrire" : "Entrer"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Cartes de contenu ---------- */
const TYPES_EVENEMENT = {
  Pratique: { bg: "#E6F2EA", fg: "#1F5C38" },
  Match: { bg: "#D9E2F8", fg: "#1E3A8A" },
  Tournoi: { bg: "#F6E7C4", fg: "#8A5B00" },
  Autre: { bg: "#E5E7EB", fg: "#374151" },
};

function CarteEvenement({ item, peutEditer, onSupprimer, moi, joueurs, onRepondre }) {
  const [voirListe, setVoirListe] = useState(false);
  const presences = item.presences || {};
  const maRep = moi ? presences[moi.id] : null;
  const presents = joueurs.filter((j) => presences[j.id] === "oui");
  const absents = joueurs.filter((j) => presences[j.id] === "non");
  const sansReponse = joueurs.filter((j) => !presences[j.id]);
  const t = TYPES_EVENEMENT[item.type] || TYPES_EVENEMENT.Autre;
  const dateAffichee = (() => {
    try {
      const d = new Date(item.date + "T12:00:00");
      return d.toLocaleDateString("fr-CA", { weekday: "long", day: "numeric", month: "long" });
    } catch {
      return item.date;
    }
  })();

  return (
    <div className="rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2 py-0.5 text-xs font-bold uppercase"
              style={{ background: t.bg, color: t.fg, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}
            >
              {item.type || "Autre"}
            </span>
            <BadgeStatut statut={item.acces} petit />
          </div>
          <div
            className="mt-1 text-xl font-bold uppercase leading-tight"
            style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {item.titre}
          </div>
          <div className="mt-0.5 text-sm capitalize" style={{ color: C.texte }}>
            {dateAffichee}
            {item.heure ? ` · ${item.heure}` : ""}
          </div>
          {item.lieu && (
            <div className="text-sm" style={{ color: C.gris }}>
              📍 {item.lieu}
            </div>
          )}
        </div>
      </div>
      {item.note && (
        <p className="mt-2 text-sm" style={{ color: C.texte }}>
          {item.note}
        </p>
      )}

      {/* Réponse du joueur */}
      {moi && (
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => onRepondre(item.id, "oui")}
            className="flex-1 rounded-lg py-2.5 text-sm font-bold uppercase tracking-wider"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.08em",
              background: maRep === "oui" ? C.gazon : C.craie,
              color: maRep === "oui" ? C.blanc : C.gris,
            }}
          >
            ✓ Présent·e
          </button>
          <button
            onClick={() => onRepondre(item.id, "non")}
            className="flex-1 rounded-lg py-2.5 text-sm font-bold uppercase tracking-wider"
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              letterSpacing: "0.08em",
              background: maRep === "non" ? C.rouge : C.craie,
              color: maRep === "non" ? C.blanc : C.gris,
            }}
          >
            ✗ Absent·e
          </button>
        </div>
      )}

      {/* Vue entraîneur : décompte + liste */}
      {peutEditer && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: C.ligne }}>
          <button onClick={() => setVoirListe(!voirListe)} className="flex w-full items-center justify-between text-left">
            <div className="flex gap-3 text-sm font-semibold">
              <span style={{ color: C.gazon }}>✓ {presents.length} présent·e·s</span>
              <span style={{ color: C.rouge }}>✗ {absents.length} absent·e·s</span>
              <span style={{ color: C.gris }}>{sansReponse.length} sans réponse</span>
            </div>
            <span style={{ color: C.gris }}>{voirListe ? "▲" : "▼"}</span>
          </button>
          {voirListe && (
            <div className="mt-2 grid gap-1 text-sm">
              {presents.map((j) => (
                <div key={j.id} style={{ color: C.gazon }}>
                  ✓ {j.nom}
                </div>
              ))}
              {absents.map((j) => (
                <div key={j.id} style={{ color: C.rouge }}>
                  ✗ {j.nom}
                </div>
              ))}
              {sansReponse.map((j) => (
                <div key={j.id} style={{ color: C.gris }}>
                  — {j.nom}
                </div>
              ))}
              {joueurs.length === 0 && <div style={{ color: C.gris }}>Aucun joueur inscrit dans cette équipe.</div>}
            </div>
          )}
          <div className="mt-2 text-right">
            <Bouton danger enfant="Supprimer" onClick={() => onSupprimer(item.id)} />
          </div>
        </div>
      )}
    </div>
  );
}

function CartePlan({ item, peutEditer, onSupprimer }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div
            className="text-xl font-bold uppercase leading-tight"
            style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {item.titre}
          </div>
          <div className="mt-0.5 text-sm" style={{ color: C.gris }}>
            {item.date} {item.focus ? `· ${item.focus}` : ""}
          </div>
        </div>
        <BadgeStatut statut={item.acces} petit />
      </div>
      <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed" style={{ color: C.texte }}>
        {item.contenu}
      </p>
      {peutEditer && (
        <div className="mt-3 text-right">
          <Bouton danger enfant="Supprimer" onClick={() => onSupprimer(item.id)} />
        </div>
      )}
    </div>
  );
}

function CarteRelais({ item, peutEditer, onSupprimer }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
      <div className="flex items-start justify-between gap-2">
        <div
          className="text-xl font-bold uppercase leading-tight"
          style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {item.situation}
        </div>
        <BadgeStatut statut={item.acces} petit />
      </div>
      <div className="mt-2 grid gap-2">
        {[
          ["Relayeur", item.relayeur],
          ["Coupeur (cut-off)", item.coupeur],
          ["Couvertures", item.couvertures],
        ]
          .filter(([, v]) => v)
          .map(([l, v]) => (
            <div key={l} className="rounded-lg px-3 py-2" style={{ background: C.craie }}>
              <div
                className="text-xs font-bold uppercase"
                style={{ color: C.gazon, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
              >
                {l}
              </div>
              <div className="text-base" style={{ color: C.texte }}>
                {v}
              </div>
            </div>
          ))}
        {item.note && (
          <p className="text-sm italic" style={{ color: C.gris }}>
            {item.note}
          </p>
        )}
      </div>
      {peutEditer && (
        <div className="mt-3 text-right">
          <Bouton danger enfant="Supprimer" onClick={() => onSupprimer(item.id)} />
        </div>
      )}
    </div>
  );
}

function CarteVideo({ item, peutEditer, onSupprimer }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div
            className="text-xl font-bold uppercase leading-tight"
            style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {item.titre}
          </div>
          {item.categorie && (
            <div className="mt-0.5 text-sm" style={{ color: C.gris }}>
              {item.categorie}
            </div>
          )}
        </div>
        <BadgeStatut statut={item.acces} petit />
      </div>
      {item.note && (
        <p className="mt-2 text-base" style={{ color: C.texte }}>
          {item.note}
        </p>
      )}
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="mt-3 inline-block rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider"
        style={{
          background: C.royal,
          color: C.blanc,
          fontFamily: "'Barlow Condensed', sans-serif",
          letterSpacing: "0.08em",
        }}
      >
        ▶ Regarder la vidéo
      </a>
      {peutEditer && (
        <div className="mt-3 text-right">
          <Bouton danger enfant="Supprimer" onClick={() => onSupprimer(item.id)} />
        </div>
      )}
    </div>
  );
}

function CarteSignal({ item, peutEditer, onSupprimer }) {
  const [revele, setRevele] = useState(false);
  return (
    <button
      onClick={() => setRevele(!revele)}
      className="w-full rounded-xl p-4 text-left transition-transform active:scale-[0.99]"
      style={{ background: revele ? C.marine2 : C.royalSombre, border: `1px solid ${C.marine2}` }}
    >
      <div className="flex items-center justify-between gap-2">
        <div
          className="text-xl font-bold uppercase"
          style={{ color: C.or, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}
        >
          {item.nom}
        </div>
        <Couture />
      </div>
      {revele ? (
        <div className="mt-2">
          <div className="whitespace-pre-wrap text-base leading-relaxed" style={{ color: C.blanc }}>
            {item.sequence}
          </div>
          {item.note && (
            <p className="mt-2 text-sm italic" style={{ color: C.gris }}>
              {item.note}
            </p>
          )}
          <div className="mt-2 text-xs uppercase" style={{ color: C.poudre, letterSpacing: "0.1em" }}>
            Touche pour masquer
          </div>
        </div>
      ) : (
        <div className="mt-2 text-sm uppercase" style={{ color: C.poudre, letterSpacing: "0.1em" }}>
          🔒 Touche pour révéler
        </div>
      )}
      {peutEditer && revele && (
        <div className="mt-3 text-right">
          <Bouton
            danger
            enfant="Supprimer"
            onClick={(e) => {
              e.stopPropagation();
              onSupprimer(item.id);
            }}
          />
        </div>
      )}
    </button>
  );
}


function CarteGC({ item, peutEditer, onSupprimer }) {
  const ref = useRef(null);
  const [etat, setEtat] = useState("chargement");
  const domId = "gc-widget-" + item.id;

  useEffect(() => {
    if (!item.widgetId) {
      setEtat("sansId");
      return;
    }
    let annule = false;
    const init = () => {
      if (annule) return;
      try {
        const api = window.GC?.team?.schedule || window.GC?.scoreboard;
        if (!api?.init) {
          setEtat("erreur");
          return;
        }
        api.init({
          target: "#" + domId,
          widgetId: item.widgetId,
          maxVerticalGamesVisible: 4,
        });
        setEtat("ok");
      } catch {
        setEtat("erreur");
      }
    };
    if (window.GC?.team?.schedule || window.GC?.scoreboard) {
      init();
      return;
    }
    let script = document.querySelector('script[data-gc-sdk="1"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://widgets.gc.com/static/js/sdk.v1.js";
      script.async = true;
      script.dataset.gcSdk = "1";
      document.body.appendChild(script);
    }
    const onLoad = () => ((window.GC?.team?.schedule || window.GC?.scoreboard) ? init() : setEtat("erreur"));
    script.addEventListener("load", onLoad);
    script.addEventListener("error", () => !annule && setEtat("erreur"));
    const secours = setTimeout(() => !annule && etat === "chargement" && setEtat("erreur"), 8000);
    return () => {
      annule = true;
      clearTimeout(secours);
      script.removeEventListener("load", onLoad);
    };
  }, [item.widgetId, domId]);

  return (
    <div className="rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className="rounded-md px-1.5 py-0.5 text-xs font-bold"
            style={{ background: C.royalSombre, color: C.or, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}
          >
            GC
          </span>
          <div
            className="mt-1 text-xl font-bold uppercase leading-tight"
            style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}
          >
            {item.titre}
          </div>
        </div>
        <BadgeStatut statut={item.acces} petit />
      </div>

      {item.note && (
        <p className="mt-2 text-sm" style={{ color: C.texte }}>
          {item.note}
        </p>
      )}

      <div className="mt-3 overflow-hidden rounded-lg" style={{ background: C.craie, minHeight: etat === "ok" ? 0 : 80 }}>
        <div id={domId} ref={ref} />
        {etat === "chargement" && (
          <div className="px-4 py-6 text-center text-sm" style={{ color: C.gris }}>
            Chargement du tableau GameChanger…
          </div>
        )}
        {etat === "sansId" && (
          <div className="px-4 py-5 text-sm" style={{ color: C.gris }}>
            {item.url
              ? "Lien d'équipe — touche le bouton ci-dessous pour ouvrir GameChanger."
              : "Aucun widget ni lien enregistré."}
          </div>
        )}
        {etat === "erreur" && (
          <div className="px-4 py-5 text-sm" style={{ color: C.gris }}>
            Le tableau n'a pas pu se charger. Vérifie l'identifiant du widget.
          </div>
        )}
      </div>

      {item.url && (
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider"
          style={{ background: C.or, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
        >
          Ouvrir dans GameChanger ↗
        </a>
      )}

      {peutEditer && (
        <div className="mt-3 text-right">
          <Bouton danger enfant="Supprimer" onClick={() => onSupprimer(item.id)} />
        </div>
      )}
    </div>
  );
}

/* ---------- Import Excel / CSV ---------- */
const MODELES_IMPORT = {
  agenda: {
    colonnes: ["titre", "type", "date", "heure", "lieu", "note"],
    exemple: "Pratique frappe | Pratique | 2026-09-15 | 18h30-20h | Terrain Lapointe | Apporter casque",
    gabarit: [
      { titre: "Pratique frappe & lancer", type: "Pratique", date: "2026-09-15", heure: "18h30 - 20h00", lieu: "Terrain Lapointe, Repentigny", note: "Apporter casque et gants de frappe" },
      { titre: "Match vs Nord-Est 14U", type: "Match", date: "2026-09-19", heure: "19h00", lieu: "Parc Goyette, L'Épiphanie", note: "Arrivée 45 min avant" },
      { titre: "Tournoi FPN — fin de semaine", type: "Tournoi", date: "2026-09-26", heure: "Toute la journée", lieu: "Windsor, CT", note: "Départ vendredi 16h" },
    ],
    mapper: (r) => ({
      titre: r.titre || r.Titre || "",
      type: r.type || r.Type || "Pratique",
      date: normDate(r.date || r.Date),
      heure: r.heure || r.Heure || "",
      lieu: r.lieu || r.Lieu || "",
      note: r.note || r.Note || "",
    }),
    valide: (o) => o.titre && o.date,
  },
  nouvelles: {
    colonnes: ["titre", "date", "texte", "photo", "video"],
    exemple: "Championnes FPN ! | 6 juillet 2026 | Quelle fin de semaine… | https://… | https://…",
    gabarit: [
      { titre: "Championnes du tournoi FPN ! 👑", date: "6 juillet 2026", texte: "Quelle fin de semaine ! Nos joueuses repartent avec la bague après 4 victoires consécutives. Bravo à toute l'équipe !", photo: "https://exemple.com/photo-equipe.jpg", video: "" },
      { titre: "Match parfait de notre lanceuse", date: "31 mai 2026", texte: "6 manches, 0 coup sûr, 11 retraits au bâton. Une performance dominante !", photo: "", video: "https://youtube.com/watch?v=exemple" },
    ],
    mapper: (r) => ({
      titre: r.titre || r.Titre || "",
      date: r.date || r.Date || "",
      texte: r.texte || r.Texte || "",
      photo: r.photo || r.Photo || "",
      video: r.video || r.Video || r["vidéo"] || "",
    }),
    valide: (o) => o.titre && (o.texte || o.photo || o.video),
  },
  saison: {
    colonnes: ["phase", "periode", "frequence", "focus", "objectifs"],
    exemple: "Phase 1 — Préparation | Novembre-Décembre | 3x/sem 90 min | Force générale | • Base aérobie…",
    gabarit: [
      { phase: "Phase 1 — Préparation générale", periode: "Novembre - Décembre", frequence: "3x / semaine — 90 min", focus: "Force générale et mobilité", objectifs: "• Développer la base aérobie\n• Mobilité épaules et hanches\n• Technique de lancer — volume progressif" },
      { phase: "Phase 2 — Préparation spécifique", periode: "Janvier - Février", frequence: "4x / semaine — 90 min", focus: "Puissance et mécanique de frappe", objectifs: "• Travail en cages (HitTrax)\n• Puissance des jambes\n• Lecture de lancers" },
      { phase: "Phase 3 — Pré-compétition", periode: "Mars - Avril", frequence: "4x / semaine + matchs hors-concours", focus: "Situations de match", objectifs: "• Systèmes défensifs et relais\n• Course sur les buts\n• Matchs préparatoires" },
      { phase: "Phase 4 — Compétition", periode: "Mai - Août", frequence: "Matchs + 2 pratiques / semaine", focus: "Performance et récupération", objectifs: "• Maintien de la forme\n• Ajustements individuels\n• Gestion de la charge des lanceuses" },
    ],
    mapper: (r) => ({
      phase: r.phase || r.Phase || "",
      periode: r.periode || r["période"] || r.Periode || r["Période"] || "",
      frequence: r.frequence || r["fréquence"] || r.Frequence || "",
      focus: r.focus || r.Focus || "",
      objectifs: r.objectifs || r.Objectifs || "",
    }),
    valide: (o) => o.phase && o.periode,
  },
  relais: {
    colonnes: ["situation", "relayeur", "coupeur", "couvertures", "note"],
    exemple: "Simple au CD, coureur 1er | AC s'aligne CD→3e | 1B coupe au marbre | 2B couvre 2e | —",
    gabarit: [
      { situation: "Simple au champ droit, coureur au 1er", relayeur: "Arrêt-court s'aligne CD → 3e but", coupeur: "1er but coupe vers le marbre", couvertures: "2e but couvre le 2e, lanceur derrière le 3e", note: "Écouter l'appel du receveur" },
      { situation: "Double au champ centre, coureur au 1er", relayeur: "2e but s'aligne CC → marbre", coupeur: "1er but en coupe au monticule", couvertures: "Arrêt-court couvre le 2e, 3e but reste au 3e", note: "" },
      { situation: "Simple au champ gauche, coureur au 2e", relayeur: "Arrêt-court s'aligne CG → marbre", coupeur: "1er but coupe au marbre", couvertures: "2e but couvre le 2e, lanceur derrière le marbre", note: "Jeu au marbre si le coureur part" },
    ],
    mapper: (r) => ({
      situation: r.situation || r.Situation || "",
      relayeur: r.relayeur || r.Relayeur || "",
      coupeur: r.coupeur || r.Coupeur || r["cut-off"] || "",
      couvertures: r.couvertures || r.Couvertures || "",
      note: r.note || r.Note || "",
    }),
    valide: (o) => o.situation,
  },
};

function normDate(v) {
  if (!v) return "";
  if (typeof v === "number") {
    // Numéro de série Excel → AAAA-MM-JJ
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return d.toISOString().slice(0, 10);
  }
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}`;
  const d = new Date(s);
  return isNaN(d) ? s : d.toISOString().slice(0, 10);
}

function ImportExcel({ section, accesDefaut, onImporter, onFermer }) {
  const [etat, setEtat] = useState("attente");
  const [apercu, setApercu] = useState([]);
  const [err, setErr] = useState("");
  const [acces, setAcces] = useState(accesDefaut);
  const [gabaritEtat, setGabaritEtat] = useState("");
  const modele = MODELES_IMPORT[section];

  const telechargerGabarit = async () => {
    setGabaritEtat("Préparation…");
    try {
      const XLSX = await import("xlsx");
      const ws = XLSX.utils.json_to_sheet(modele.gabarit, { header: modele.colonnes });
      // Largeurs de colonnes lisibles
      ws["!cols"] = modele.colonnes.map((c) => ({ wch: c === "objectifs" || c === "texte" ? 45 : c === "note" || c === "couvertures" ? 32 : 24 }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, section.slice(0, 28));
      XLSX.writeFile(wb, `ROF-gabarit-${section}.xlsx`);
      setGabaritEtat("✓ Gabarit téléchargé");
    } catch {
      setGabaritEtat("Téléchargement impossible — voir les colonnes ci-dessus");
    }
  };

  const lire = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr("");
    setEtat("lecture");
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const brut = XLSX.utils.sheet_to_json(ws, { defval: "" });
      const lignes = brut
        .map((r) => {
          const norm = {};
          Object.keys(r).forEach((k) => (norm[String(k).trim().toLowerCase()] = r[k]));
          return modele.mapper({ ...r, ...norm });
        })
        .filter(modele.valide);
      if (lignes.length === 0) {
        setErr(`Aucune ligne valide trouvée. Vérifie que la première rangée contient les en-têtes : ${modele.colonnes.join(", ")}.`);
        setEtat("attente");
      } else {
        setApercu(lignes);
        setEtat("apercu");
      }
    } catch (ex) {
      setErr("Impossible de lire le fichier. Formats acceptés : .xlsx, .xls, .csv");
      setEtat("attente");
    }
  };

  const confirmer = async () => {
    setEtat("import");
    await onImporter(apercu.map((o) => ({ ...o, id: uid(), acces: Number(acces) })));
    onFermer();
  };

  return (
    <div className="rounded-xl border-2 border-dashed p-4" style={{ borderColor: C.royal, background: C.carteHaut }}>
      <div className="text-lg font-bold uppercase" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
        📊 Importer depuis Excel
      </div>

      <div className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ background: C.craie, color: C.texte }}>
        <div className="font-bold" style={{ color: C.poudre }}>Colonnes attendues (1re rangée) :</div>
        <div className="mt-1 font-mono text-xs">{modele.colonnes.join(" · ")}</div>
        <div className="mt-2 text-xs" style={{ color: C.gris }}>Exemple : {modele.exemple}</div>
      </div>

      <div className="mt-3 rounded-lg border p-3" style={{ borderColor: C.or, background: C.marine }}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-sm font-bold" style={{ color: C.or }}>
              ⬇ Gabarit Excel prêt à remplir
            </div>
            <div className="mt-0.5 text-xs" style={{ color: C.gris }}>
              Bonnes colonnes + {modele.gabarit.length} exemples à remplacer par tes données.
            </div>
          </div>
          <Bouton plein enfant="Télécharger" onClick={telechargerGabarit} />
        </div>
        {gabaritEtat && (
          <div className="mt-2 text-xs" style={{ color: gabaritEtat.startsWith("✓") ? C.gazon : C.gris }}>
            {gabaritEtat}
          </div>
        )}
      </div>

      {etat !== "apercu" && (
        <>
          <Etiquette texte="Fichier (.xlsx, .xls, .csv)" />
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={lire}
            className="w-full rounded-lg border px-3 py-2.5 text-sm"
            style={{ borderColor: C.ligne, color: C.texte, background: C.blanc }}
          />
        </>
      )}

      {etat === "lecture" && (
        <div className="mt-3 text-sm" style={{ color: C.gris }}>Lecture du fichier…</div>
      )}

      {err && (
        <div className="mt-3 rounded-lg px-3 py-2 text-sm" style={{ background: "#2A1413", color: C.rouge }}>
          {err}
        </div>
      )}

      {etat === "apercu" && (
        <>
          <div className="mt-3 rounded-lg px-3 py-2 text-sm font-bold" style={{ background: "#12291D", color: C.gazon }}>
            ✓ {apercu.length} ligne{apercu.length > 1 ? "s" : ""} prête{apercu.length > 1 ? "s" : ""} à importer
          </div>
          <div className="mt-2 max-h-52 overflow-auto rounded-lg border" style={{ borderColor: C.ligne }}>
            {apercu.slice(0, 20).map((o, i) => (
              <div key={i} className="border-b px-3 py-2 text-sm last:border-0" style={{ borderColor: C.ligne, color: C.texte }}>
                <span className="font-semibold">{o.titre || o.phase || o.situation}</span>
                <span className="ml-2 text-xs" style={{ color: C.gris }}>
                  {o.date || o.periode || o.relayeur || ""}
                </span>
              </div>
            ))}
            {apercu.length > 20 && (
              <div className="px-3 py-2 text-xs" style={{ color: C.gris }}>… et {apercu.length - 20} de plus</div>
            )}
          </div>
          <Etiquette texte="Accès pour tout l'import" />
          <SelectAcces value={acces} onChange={setAcces} />
        </>
      )}

      <div className="mt-4 flex justify-end gap-2">
        <Bouton enfant="Annuler" onClick={onFermer} />
        {etat === "apercu" && (
          <Bouton plein enfant={etat === "import" ? "Import…" : `Importer ${apercu.length}`} onClick={confirmer} />
        )}
      </div>
    </div>
  );
}

function CarteNouvelle({ item, peutEditer, onSupprimer }) {
  const [imgOk, setImgOk] = useState(true);
  return (
    <div className="overflow-hidden rounded-xl border" style={{ background: C.blanc, borderColor: C.ligne }}>
      {item.photo && imgOk && (
        <img
          src={item.photo}
          alt={item.titre}
          className="max-h-80 w-full object-cover"
          onError={() => setImgOk(false)}
        />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            {item.date && (
              <div className="text-xs font-bold uppercase" style={{ color: C.champagne, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
                {item.date}
              </div>
            )}
            <div className="text-2xl font-bold uppercase leading-tight" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}>
              {item.titre}
            </div>
          </div>
          <BadgeStatut statut={item.acces} petit />
        </div>
        {item.texte && (
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed" style={{ color: C.texte }}>
            {item.texte}
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          {item.video && (
            <a
              href={item.video}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider"
              style={{ background: C.royal, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
            >
              ▶ Voir la vidéo
            </a>
          )}
          {item.photo && !imgOk && (
            <a
              href={item.photo}
              target="_blank"
              rel="noreferrer"
              className="inline-block rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider"
              style={{ background: C.craie, color: C.royal, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
            >
              📷 Voir la photo ↗
            </a>
          )}
        </div>
        {peutEditer && (
          <div className="mt-3 text-right">
            <Bouton danger enfant="Supprimer" onClick={() => onSupprimer(item.id)} />
          </div>
        )}
      </div>
    </div>
  );
}

function CartePhase({ item, index, peutEditer, onSupprimer }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold"
          style={{ background: C.or, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif" }}
        >
          {index + 1}
        </div>
        <div className="w-px flex-1" style={{ background: C.orFonce }} />
      </div>
      <div className="mb-3 flex-1 rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase" style={{ color: C.champagne, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.1em" }}>
              {item.periode}
            </div>
            <div className="text-xl font-bold uppercase leading-tight" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}>
              {item.phase}
            </div>
            {item.frequence && (
              <div className="mt-0.5 text-sm" style={{ color: C.royal }}>
                ⏱ {item.frequence}
              </div>
            )}
          </div>
          <BadgeStatut statut={item.acces} petit />
        </div>
        {item.focus && (
          <div className="mt-2 rounded-lg px-3 py-2 text-sm" style={{ background: C.craie, color: C.texte }}>
            <span className="font-bold uppercase" style={{ color: C.gazon, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>
              Focus :{" "}
            </span>
            {item.focus}
          </div>
        )}
        {item.objectifs && (
          <p className="mt-2 whitespace-pre-wrap text-base leading-relaxed" style={{ color: C.texte }}>
            {item.objectifs}
          </p>
        )}
        {peutEditer && (
          <div className="mt-3 text-right">
            <Bouton danger enfant="Supprimer" onClick={() => onSupprimer(item.id)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Formulaires d'ajout ---------- */
function FormAjout({ section, onAjouter, onFermer }) {
  const [f, setF] = useState({ acces: SECTIONS.find((s) => s.id === section).accesDefaut, type: "Pratique" });
  const maj = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pret =
    (section === "agenda" && f.titre && f.date) ||
    (section === "nouvelles" && f.titre && (f.texte || f.photo || f.video)) ||
    (section === "saison" && f.phase && f.periode) ||
    (section === "plans" && f.titre && f.contenu) ||
    (section === "relais" && f.situation) ||
    (section === "videos" && f.titre && f.url) ||
    (section === "gamechanger" && f.titre && (f.widgetId || f.url)) ||
    (section === "signaux" && f.nom && f.sequence);

  return (
    <div className="rounded-xl border-2 border-dashed p-4" style={{ borderColor: C.or, background: C.carteHaut }}>
      <div
        className="text-lg font-bold uppercase"
        style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}
      >
        Nouveau contenu
      </div>

      {section === "agenda" && (
        <>
          <Etiquette texte="Titre" />
          <Champ value={f.titre || ""} onChange={maj("titre")} placeholder="Ex. : Pratique frappe — cages EDB" />
          <Etiquette texte="Type" />
          <Selecteur
            value={f.type}
            onChange={maj("type")}
            options={["Pratique", "Match", "Tournoi", "Autre"].map((t) => ({ value: t, label: t }))}
          />
          <Etiquette texte="Date" />
          <Champ value={f.date || ""} onChange={maj("date")} type="date" />
          <Etiquette texte="Heure" />
          <Champ value={f.heure || ""} onChange={maj("heure")} placeholder="Ex. : 18 h 30 – 20 h" />
          <Etiquette texte="Lieu" />
          <Champ value={f.lieu || ""} onChange={maj("lieu")} placeholder="Ex. : Terrain Lapointe, Repentigny" />
          <Etiquette texte="Note" />
          <Champ value={f.note || ""} onChange={maj("note")} placeholder="Ex. : Apporter casque et gants de frappe" />
        </>
      )}

      {section === "nouvelles" && (
        <>
          <Etiquette texte="Titre" />
          <Champ value={f.titre || ""} onChange={maj("titre")} placeholder="Ex. : Championnes FPN Firecracker ! 👑" />
          <Etiquette texte="Date" />
          <Champ value={f.date || ""} onChange={maj("date")} placeholder="Ex. : 6 juillet 2026" />
          <Etiquette texte="Texte de la nouvelle" />
          <Zone value={f.texte || ""} onChange={maj("texte")} placeholder="Raconte le moment : le pointage, les faits saillants, les félicitations…" />
          <Etiquette texte="Lien de la photo" />
          <Champ value={f.photo || ""} onChange={maj("photo")} placeholder="https://… (lien direct vers l'image)" inputMode="url" />
          <Etiquette texte="Lien vidéo (YouTube, Drive…)" />
          <Champ value={f.video || ""} onChange={maj("video")} placeholder="https://… (optionnel)" inputMode="url" />
        </>
      )}

      {section === "saison" && (
        <>
          <Etiquette texte="Nom de la phase" />
          <Champ value={f.phase || ""} onChange={maj("phase")} placeholder="Ex. : Phase 1 — Préparation générale" />
          <Etiquette texte="Période" />
          <Champ value={f.periode || ""} onChange={maj("periode")} placeholder="Ex. : Novembre – Décembre" />
          <Etiquette texte="Fréquence" />
          <Champ value={f.frequence || ""} onChange={maj("frequence")} placeholder="Ex. : 3x / semaine — 90 min" />
          <Etiquette texte="Focus principal" />
          <Champ value={f.focus || ""} onChange={maj("focus")} placeholder="Ex. : Force générale et mobilité" />
          <Etiquette texte="Objectifs & contenu" />
          <Zone value={f.objectifs || ""} onChange={maj("objectifs")} placeholder={"• Développer la base aérobie\n• Technique de lancer — volume progressif\n• Mobilité épaules/hanches"} />
        </>
      )}

      {section === "plans" && (
        <>
          <Etiquette texte="Titre" />
          <Champ value={f.titre || ""} onChange={maj("titre")} placeholder="Ex. : Semaine 3 — Frappe et vitesse" />
          <Etiquette texte="Date / période" />
          <Champ value={f.date || ""} onChange={maj("date")} placeholder="Ex. : 15–21 juin" />
          <Etiquette texte="Focus" />
          <Champ value={f.focus || ""} onChange={maj("focus")} placeholder="Ex. : Mécanique de l'élan" />
          <Etiquette texte="Contenu du plan" />
          <Zone value={f.contenu || ""} onChange={maj("contenu")} placeholder={"Échauffement : …\nStation 1 : …\nStation 2 : …"} />
        </>
      )}

      {section === "relais" && (
        <>
          <Etiquette texte="Situation" />
          <Champ value={f.situation || ""} onChange={maj("situation")} placeholder="Ex. : Simple au CD, coureur au 1er" />
          <Etiquette texte="Relayeur" />
          <Champ value={f.relayeur || ""} onChange={maj("relayeur")} placeholder="Ex. : Arrêt-court s'aligne CD → 3e but" />
          <Etiquette texte="Coupeur (cut-off)" />
          <Champ value={f.coupeur || ""} onChange={maj("coupeur")} placeholder="Ex. : 1er but coupe vers le marbre" />
          <Etiquette texte="Couvertures" />
          <Champ value={f.couvertures || ""} onChange={maj("couvertures")} placeholder="Ex. : 2e but couvre le 2e, lanceur derrière 3e" />
          <Etiquette texte="Note" />
          <Champ value={f.note || ""} onChange={maj("note")} placeholder="Rappel ou consigne (optionnel)" />
        </>
      )}

      {section === "videos" && (
        <>
          <Etiquette texte="Titre" />
          <Champ value={f.titre || ""} onChange={maj("titre")} placeholder="Ex. : Lecture de balle au champ extérieur" />
          <Etiquette texte="Lien (YouTube, Drive, HitTrax…)" />
          <Champ value={f.url || ""} onChange={maj("url")} placeholder="https://…" />
          <Etiquette texte="Catégorie" />
          <Champ value={f.categorie || ""} onChange={maj("categorie")} placeholder="Ex. : Défensive / Frappe / Lancer" />
          <Etiquette texte="Note pour les joueurs" />
          <Champ value={f.note || ""} onChange={maj("note")} placeholder="Quoi observer (optionnel)" />
        </>
      )}

      {section === "gamechanger" && (
        <>
          <Etiquette texte="Titre" />
          <Champ value={f.titre || ""} onChange={maj("titre")} placeholder="Ex. : Royal 14U — saison 2026" />
          <Etiquette texte="Code widget OU lien d'équipe GameChanger" />
          <Zone
            value={f.gcBrut || ""}
            onChange={(e) => {
              const v = e.target.value;
              const mw = v.match(/widgetId\s*:\s*["']([0-9a-fA-F-]{20,})["']/) || v.match(/^\s*([0-9a-fA-F-]{30,})\s*$/);
              const mu = v.match(/https?:\/\/[^\s"'<>]*gc\.com\/[^\s"'<>]+/);
              setF({ ...f, gcBrut: v, widgetId: mw ? mw[1] : "", url: mu ? mu[0] : "" });
            }}
            placeholder={"Colle ici :\n• le code widget fourni par GameChanger (Tools → Create Widget)\nOU\n• le lien de partage de ton équipe (https://web.gc.com/teams/…)"}
          />
          {f.widgetId ? (
            <div className="mt-1 rounded-lg px-3 py-2 text-xs" style={{ background: "#12291D", color: C.gazon }}>
              ✓ Widget détecté — le calendrier s'affichera directement dans l'app.
            </div>
          ) : f.url ? (
            <div className="mt-1 rounded-lg px-3 py-2 text-xs" style={{ background: "#12291D", color: C.gazon }}>
              ✓ Lien d'équipe détecté — un bouton mènera vers GameChanger. Pour un affichage intégré, colle plutôt le code widget (web.gc.com → Tools → Create Widget).
            </div>
          ) : (
            <div className="mt-1 rounded-lg px-3 py-2 text-xs" style={{ background: C.craie, color: C.gris }}>
              Dans GameChanger : <strong style={{ color: C.poudre }}>web.gc.com → onglet Tools → Create Widget</strong> pour l'affichage intégré, ou copie simplement le lien de partage de l'équipe.
            </div>
          )}
          <Etiquette texte="Note" />
          <Champ value={f.note || ""} onChange={maj("note")} placeholder="Ex. : Calendrier et scores en direct (optionnel)" />
        </>
      )}

      {section === "signaux" && (
        <>
          <Etiquette texte="Nom du signal" />
          <Champ value={f.nom || ""} onChange={maj("nom")} placeholder="Ex. : Amorti-surprise" />
          <Etiquette texte="Séquence / geste" />
          <Zone value={f.sequence || ""} onChange={maj("sequence")} placeholder="Ex. : Main au chapeau → bras gauche → tape 2x la cuisse" />
          <Etiquette texte="Note" />
          <Champ value={f.note || ""} onChange={maj("note")} placeholder="Ex. : Annulé si je touche la ceinture après" />
        </>
      )}

      <Etiquette texte="Accès" />
      <SelectAcces value={f.acces} onChange={(v) => setF({ ...f, acces: v })} />

      <div className="mt-4 flex justify-end gap-2">
        <Bouton enfant="Annuler" onClick={onFermer} />
        <Bouton
          plein
          enfant="Publier"
          disabled={!pret}
          onClick={() =>
            onAjouter({
              ...f,
              gcBrut: undefined,
              id: uid(),
              acces: Number(f.acces),
            })
          }
        />
      </div>
    </div>
  );
}

/* ---------- Application principale ---------- */
export default function ROFConnect() {
  const [phase, setPhase] = useState("chargement");
  const [config, setConfig] = useState(null);
  const [players, setPlayers] = useState([]);
  const [session, setSession] = useState(null);
  const [contenu, setContenu] = useState(contenuVide());
  const [onglet, setOnglet] = useState("agenda");
  const [formOuvert, setFormOuvert] = useState(false);
  const [importOuvert, setImportOuvert] = useState(false);
  const [equipeAdmin, setEquipeAdmin] = useState("");
  const [msg, setMsg] = useState("");
  const [exportCsv, setExportCsv] = useState("");
  const [ficheOuverte, setFicheOuverte] = useState("");
  const [messages, setMessages] = useState(null);

  const chargerMessages = useCallback(async (tid) => {
    const m = await sGet("rof-messages-" + tid);
    setMessages(m || { equipe: [], prives: {} });
  }, []);

  const chargerContenu = useCallback(async (teamId) => {
    const c = await sGet("rof-content-" + teamId);
    setContenu(c || contenuVide());
  }, []);

  /* Initialisation */
  useEffect(() => {
    (async () => {
      let cfg = await sGet("rof-config");
      if (!cfg) {
        cfg = { adminPin: "2026", teams: EQUIPES_DEFAUT };
        await sSet("rof-config", cfg);
      }
      const pl = (await sGet("rof-players")) || [];
      setConfig(cfg);
      setPlayers(pl);
      const ses = await sGet("rof-session", false);
      if (ses && (ses.role !== "joueur" || pl.find((p) => p.id === ses.playerId))) {
        setSession(ses);
        setEquipeAdmin(ses.teamId);
        await chargerContenu(ses.teamId);
        setPhase("app");
      } else {
        setPhase("site");
      }
    })();
  }, [chargerContenu]);

  const connecter = async (ses) => {
    setSession(ses);
    setEquipeAdmin(ses.teamId);
    await sSet("rof-session", ses, false);
    await chargerContenu(ses.teamId);
    setOnglet("agenda");
    setPhase("app");
  };

  const inscrire = async (joueur) => {
    const pl = [...((await sGet("rof-players")) || []), joueur];
    await sSet("rof-players", pl);
    setPlayers(pl);
    await connecter({ role: "joueur", teamId: joueur.teamId, playerId: joueur.id });
  };

  const deconnecter = async () => {
    await sDel("rof-session", false);
    setSession(null);
    setPhase("site");
  };

  if (phase === "chargement") {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: C.noir }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700&family=Inter:wght@400;600&family=Playfair+Display:wght@800&family=Dancing+Script:wght@600&display=swap');`}</style>
        <div className="text-center">
          <Couture />
          <div className="mt-2 text-lg uppercase tracking-widest" style={{ color: C.or, fontFamily: "'Barlow Condensed', sans-serif" }}>
            Chargement…
          </div>
        </div>
      </div>
    );
  }

  if (phase === "site") {
    return <SiteWeb onEntrer={() => setPhase("auth")} />;
  }

  if (phase === "auth") {
    return (
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700&family=Inter:wght@400;600&family=Playfair+Display:wght@800&family=Dancing+Script:wght@600&display=swap');`}</style>
        <EcranAuth config={config} players={players} onLogin={connecter} onRegister={inscrire} onRetour={() => setPhase("site")} />
      </div>
    );
  }

  /* ----- Session active ----- */
  const estCoach = session.role === "coach" || session.role === "admin";
  const estAdmin = session.role === "admin";
  const teamId = estAdmin ? equipeAdmin : session.teamId;
  const equipe = config.teams.find((t) => t.id === teamId);
  const moi = session.role === "joueur" ? players.find((p) => p.id === session.playerId) : null;
  const monNiveau = moi ? moi.statut : 5;

  const sauverContenu = async (nouveau) => {
    setContenu(nouveau);
    await sSet("rof-content-" + teamId, nouveau);
  };
  const ajouterItem = async (item) => {
    const nv = { ...contenu, [onglet]: [item, ...(contenu[onglet] || [])] };
    setFormOuvert(false);
    await sauverContenu(nv);
  };
  const importerLot = async (items) => {
    const nv = { ...contenu, [onglet]: [...items, ...(contenu[onglet] || [])] };
    setImportOuvert(false);
    await sauverContenu(nv);
    setMsg(`✓ ${items.length} élément${items.length > 1 ? "s" : ""} importé${items.length > 1 ? "s" : ""} depuis Excel`);
  };
  const supprimerItem = async (id) => {
    const nv = { ...contenu, [onglet]: (contenu[onglet] || []).filter((x) => x.id !== id) };
    await sauverContenu(nv);
  };

  const changerStatut = async (playerId, statut) => {
    const pl = players.map((p) => (p.id === playerId ? { ...p, statut } : p));
    setPlayers(pl);
    await sSet("rof-players", pl);
  };

  const sauverProfil = async (maj) => {
    const pl = players.map((p) => (p.id === session.playerId ? { ...p, ...maj } : p));
    setPlayers(pl);
    await sSet("rof-players", pl);
    setMsg("Profil mis à jour ✓");
  };

  const envoyerMessage = async (cleCanal, texte) => {
    const cle = "rof-messages-" + teamId;
    const frais = (await sGet(cle)) || { equipe: [], prives: {} };
    const m = {
      id: uid(),
      auteur: moi ? moi.nom : estAdmin ? "Direction ROF" : "Coach",
      role: session.role,
      texte,
      ts: Date.now(),
    };
    if (cleCanal === "equipe") {
      frais.equipe = [...(frais.equipe || []), m].slice(-200);
    } else {
      const pid = cleCanal.split(":")[1];
      frais.prives = { ...(frais.prives || {}), [pid]: [...(frais.prives?.[pid] || []), m].slice(-200) };
    }
    await sSet(cle, frais);
    setMessages(frais);
  };

  const repondrePresence = async (eventId, rep) => {
    if (!moi) return;
    const nv = {
      ...contenu,
      agenda: (contenu.agenda || []).map((e) =>
        e.id === eventId ? { ...e, presences: { ...(e.presences || {}), [moi.id]: rep } } : e
      ),
    };
    await sauverContenu(nv);
  };
  const retirerJoueur = async (playerId) => {
    const pl = players.filter((p) => p.id !== playerId);
    setPlayers(pl);
    await sSet("rof-players", pl);
  };

  const ajouterEquipe = async (nom, sport) => {
    if (!nom.trim()) return;
    const id = uid();
    const codeAuto = "ROF-" + nom.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 6);
    const cfg = { ...config, teams: [...config.teams, { id, nom: nom.trim(), sport, coachCode: codeAuto }] };
    setConfig(cfg);
    await sSet("rof-config", cfg);
    setMsg(`Équipe ajoutée. Code entraîneur : ${codeAuto}`);
  };
  const retirerEquipe = async (id) => {
    const cfg = { ...config, teams: config.teams.filter((t) => t.id !== id) };
    setConfig(cfg);
    await sSet("rof-config", cfg);
    await sDel("rof-content-" + id);
  };
  const changerPinAdmin = async (pin) => {
    if (pin.trim().length < 4) return;
    const cfg = { ...config, adminPin: pin.trim() };
    setConfig(cfg);
    await sSet("rof-config", cfg);
    setMsg("NIP administrateur mis à jour.");
  };

  const ongletsBase = SECTIONS.map((s) => ({ id: s.id, nom: s.nom }));
  const onglets = [
    ...ongletsBase,
    { id: "messages", nom: "Messages" },
    ...(session.role === "joueur" ? [{ id: "profil", nom: "Profil" }] : []),
    ...(estCoach ? [{ id: "joueurs", nom: "Joueurs" }] : []),
    ...(estAdmin ? [{ id: "equipes", nom: "Équipes" }, { id: "direction", nom: "Direction" }] : []),
  ];

  const sectionActive = SECTIONS.find((s) => s.id === onglet);
  const itemsBruts = contenu[onglet] || [];
  const itemsFiltres = estCoach ? itemsBruts : itemsBruts.filter((i) => (i.acces || 1) <= monNiveau);
  const items = onglet === "agenda" ? [...itemsFiltres].sort((a, b) => (a.date || "").localeCompare(b.date || "")) : itemsFiltres;
  const masques = estCoach ? 0 : itemsBruts.length - items.length;

  const equipePlayers = players.filter((p) => p.teamId === teamId);

  const joueursEquipe = players
    .filter((p) => (estAdmin ? true : p.teamId === teamId))
    .sort((a, b) => a.statut - b.statut || a.nom.localeCompare(b.nom));

  const exporterJoueurs = () => {
    const lignes = [
      ["Nom", "Équipe", "Sport", "Statut", "Naissance", "Position", "Lance", "Frappe", "Parent/Tuteur", "Téléphone", "Courriel", "Médical", "Consentement photo", "Inscrit le"].join(";"),
      ...joueursEquipe.map((p) => {
        const eq = config.teams.find((t) => t.id === p.teamId);
        const st = STATUTS.find((s) => s.id === p.statut);
        const d = p.creeLe ? new Date(p.creeLe).toLocaleDateString("fr-CA") : "";
        return [
          p.nom,
          eq?.nom || "Équipe retirée",
          eq?.sport || "",
          st?.nom || "",
          p.naissance || "",
          p.position || "",
          p.lance || "",
          p.frappe || "",
          p.parentNom || "",
          p.parentTel || "",
          p.parentCourriel || "",
          (p.sante || "").replace(/;/g, ","),
          p.consentement === undefined ? "" : p.consentement ? "Oui" : "Non",
          d,
        ].join(";");
      }),
    ];
    const csv = lignes.join("\n");
    setExportCsv(csv);
    try {
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `rof-joueurs-${estAdmin ? "tous" : equipe?.nom || "equipe"}.csv`.replace(/\s+/g, "-").toLowerCase();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {}
  };

  const copierExport = async () => {
    try {
      await navigator.clipboard.writeText(exportCsv);
      setMsg("Liste copiée ! Colle-la dans Excel, Numbers ou Google Sheets.");
    } catch {
      setMsg("Sélectionne le texte ci-dessous et copie-le manuellement.");
    }
  };

  return (
    <div className="min-h-screen" style={{ background: C.craie, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;700&family=Inter:wght@400;600&family=Playfair+Display:wght@800&family=Dancing+Script:wght@600&display=swap');`}</style>

      {/* En-tête */}
      <header className="sticky top-0 z-10 px-4 pb-0 pt-4" style={{ background: C.marine }}>
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <LogoR h={42} />
              <div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="text-2xl font-bold uppercase leading-none"
                    style={{ color: C.blanc, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.04em" }}
                  >
                    Royal <span style={{ color: C.or }}>On Field</span>
                  </div>
                </div>
              {estAdmin ? (
                <select
                  value={teamId}
                  onChange={async (e) => {
                    setEquipeAdmin(e.target.value);
                    await chargerContenu(e.target.value);
                  }}
                  className="mt-1 rounded-md px-2 py-1 text-sm"
                  style={{ background: C.marine2, color: C.pur, border: "none" }}
                >
                  {config.teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nom}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="mt-0.5 text-sm" style={{ color: C.gris }}>
                  {equipe?.nom}
                </div>
              )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              {moi ? (
                <>
                  <div className="text-sm font-semibold" style={{ color: C.blanc }}>
                    {moi.nom}
                  </div>
                  <BadgeStatut statut={moi.statut} petit />
                </>
              ) : (
                <div
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase"
                  style={{ background: C.or, color: C.pur, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
                >
                  {estAdmin ? "Admin" : "Entraîneur"}
                </div>
              )}
              <button onClick={deconnecter} className="text-xs underline" style={{ color: C.gris }}>
                Se déconnecter
              </button>
            </div>
          </div>

          {/* Onglets */}
          <nav className="mt-3 flex gap-1 overflow-x-auto pb-0">
            {onglets.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setOnglet(o.id);
                  setFormOuvert(false);
                  setMsg("");
                  if (o.id === "messages") chargerMessages(teamId);
                }}
                className="whitespace-nowrap rounded-t-lg px-4 py-2.5 text-base font-bold uppercase"
                style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  letterSpacing: "0.07em",
                  background: onglet === o.id ? C.noir : "transparent",
                  color: onglet === o.id ? C.poudre : C.gris,
                }}
              >
                {o.nom}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-5 pb-16">
        {msg && (
          <div className="mb-4 rounded-lg px-3 py-2 text-sm" style={{ background: "#13261C", color: C.gazon }}>
            {msg}
          </div>
        )}

        {/* Sections de contenu */}
        {sectionActive && (
          <>
            <div className="mb-4 flex items-center justify-between gap-2">
              <h2
                className="text-3xl font-bold uppercase leading-none"
                style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.03em" }}
              >
                {sectionActive.titre}
              </h2>
              {estCoach && !formOuvert && !importOuvert && (
                <div className="flex shrink-0 gap-2">
                  {MODELES_IMPORT[onglet] && <Bouton enfant="📊 Excel" onClick={() => setImportOuvert(true)} />}
                  <Bouton plein enfant="+ Ajouter" onClick={() => setFormOuvert(true)} />
                </div>
              )}
            </div>

            {formOuvert && (
              <div className="mb-4">
                <FormAjout section={onglet} onAjouter={ajouterItem} onFermer={() => setFormOuvert(false)} />
              </div>
            )}

            {importOuvert && MODELES_IMPORT[onglet] && (
              <div className="mb-4">
                <ImportExcel
                  section={onglet}
                  accesDefaut={sectionActive.accesDefaut}
                  onImporter={importerLot}
                  onFermer={() => setImportOuvert(false)}
                />
              </div>
            )}

            <div className="grid gap-3">
              {items.map((item, idx) =>
                onglet === "nouvelles" ? (
                  <CarteNouvelle key={item.id} item={item} peutEditer={estCoach} onSupprimer={supprimerItem} />
                ) : onglet === "saison" ? (
                  <CartePhase key={item.id} item={item} index={idx} peutEditer={estCoach} onSupprimer={supprimerItem} />
                ) : onglet === "agenda" ? (
                  <CarteEvenement
                    key={item.id}
                    item={item}
                    peutEditer={estCoach}
                    onSupprimer={supprimerItem}
                    moi={moi}
                    joueurs={equipePlayers}
                    onRepondre={repondrePresence}
                  />
                ) : onglet === "plans" ? (
                  <CartePlan key={item.id} item={item} peutEditer={estCoach} onSupprimer={supprimerItem} />
                ) : onglet === "relais" ? (
                  <CarteRelais key={item.id} item={item} peutEditer={estCoach} onSupprimer={supprimerItem} />
                ) : onglet === "videos" ? (
                  <CarteVideo key={item.id} item={item} peutEditer={estCoach} onSupprimer={supprimerItem} />
                ) : onglet === "gamechanger" ? (
                  <CarteGC key={item.id} item={item} peutEditer={estCoach} onSupprimer={supprimerItem} />
                ) : (
                  <CarteSignal key={item.id} item={item} peutEditer={estCoach} onSupprimer={supprimerItem} />
                )
              )}
            </div>

            {items.length === 0 && (
              <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: C.ligne, color: C.gris }}>
                {estCoach
                  ? "Aucun contenu pour l'instant. Touche « + Ajouter » pour publier le premier élément."
                  : itemsBruts.length > 0
                  ? "Du contenu existe pour cette section, mais ton statut actuel n'y donne pas encore accès."
                  : "Rien ici pour l'instant — ton entraîneur publiera bientôt du contenu."}
              </div>
            )}
            {masques > 0 && items.length > 0 && (
              <p className="mt-3 text-center text-sm" style={{ color: C.gris }}>
                {masques} élément{masques > 1 ? "s" : ""} réservé{masques > 1 ? "s" : ""} aux statuts supérieurs.
              </p>
            )}
          </>
        )}

        {/* Gestion des joueurs */}
        {onglet === "joueurs" && (
          <>
            <div className="mb-1 flex items-center justify-between gap-2">
              <h2
                className="text-3xl font-bold uppercase"
                style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}
              >
                Joueurs & statuts
              </h2>
              {joueursEquipe.length > 0 && <Bouton enfant="⬇ Exporter" onClick={exporterJoueurs} />}
            </div>
            <p className="mb-4 text-sm" style={{ color: C.gris }}>
              Change le statut pour faire évoluer l'accès au contenu : {STATUTS.map((s) => s.nom).join(" → ")}.
              {estAdmin ? " L'export inclut toutes les équipes." : ""}
            </p>
            {exportCsv && (
              <div className="mb-4 rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-semibold" style={{ color: C.texte }}>
                    Export CSV ({joueursEquipe.length} joueur·euse·s) — le fichier devrait s'être téléchargé. Sinon, copie le texte :
                  </div>
                </div>
                <textarea
                  readOnly
                  value={exportCsv}
                  onClick={(e) => e.target.select()}
                  className="mt-2 w-full rounded-lg border p-2 text-xs"
                  style={{ borderColor: C.ligne, color: C.texte, minHeight: 110, fontFamily: "monospace" }}
                />
                <div className="mt-2 flex justify-end gap-2">
                  <Bouton enfant="Fermer" onClick={() => setExportCsv("")} />
                  <Bouton plein enfant="Copier" onClick={copierExport} />
                </div>
              </div>
            )}
            <div className="grid gap-2">
              {joueursEquipe.map((p) => (
                <div key={p.id} className="rounded-xl border p-3" style={{ background: C.blanc, borderColor: ficheOuverte === p.id ? C.or : C.ligne }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <button onClick={() => setFicheOuverte(ficheOuverte === p.id ? "" : p.id)} className="text-left">
                      <div className="font-semibold" style={{ color: C.texte }}>
                        {p.nom} <span className="text-xs" style={{ color: C.champagne }}>{ficheOuverte === p.id ? "▲" : "▼ fiche"}</span>
                      </div>
                      <div className="text-xs" style={{ color: C.gris }}>
                        {config.teams.find((t) => t.id === p.teamId)?.nom || "Équipe retirée"}
                        {p.position ? ` · ${p.position}` : ""}
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <select
                        value={p.statut}
                        onChange={(e) => changerStatut(p.id, Number(e.target.value))}
                        className="rounded-lg border px-2 py-1.5 text-sm"
                        style={{ borderColor: C.ligne, color: C.texte, background: C.craie }}
                      >
                        {STATUTS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.nom}
                          </option>
                        ))}
                      </select>
                      <button onClick={() => retirerJoueur(p.id)} className="text-sm" style={{ color: C.rouge }}>
                        Retirer
                      </button>
                    </div>
                  </div>
                  {ficheOuverte === p.id && (
                    <div className="mt-3 grid gap-1.5 border-t pt-3 text-sm sm:grid-cols-2" style={{ borderColor: C.ligne }}>
                      {[
                        ["Naissance", p.naissance],
                        ["Position", p.position],
                        ["Lance / Frappe", [p.lance, p.frappe].filter(Boolean).join(" / ")],
                        ["Parent / tuteur", p.parentNom],
                        ["Téléphone", p.parentTel],
                        ["Courriel", p.parentCourriel],
                        ["Médical", p.sante],
                        ["FieldLevel", p.fieldlevel],
                        ["Consentement photos", p.consentement === undefined ? "" : p.consentement ? "Oui ✓" : "Non ✗"],
                        ["Inscription", p.creeLe ? new Date(p.creeLe).toLocaleDateString("fr-CA") : ""],
                      ]
                        .filter(([, v]) => v)
                        .map(([l, v]) => (
                          <div key={l}>
                            <span className="font-bold uppercase" style={{ color: C.champagne, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>
                              {l} :{" "}
                            </span>
                            <span style={{ color: C.texte }}>{v}</span>
                          </div>
                        ))}
                      {!p.naissance && !p.parentTel && (
                        <div style={{ color: C.gris }}>Fiche incomplète — inscription datant d'avant le nouveau formulaire.</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {joueursEquipe.length === 0 && (
                <div className="rounded-xl border border-dashed p-8 text-center" style={{ borderColor: C.ligne, color: C.gris }}>
                  Aucune inscription pour l'instant. Partage le lien de l'app à tes joueurs et joueuses — ils
                  s'inscrivent eux-mêmes et apparaîtront ici comme Prospects.
                </div>
              )}
            </div>
          </>
        )}

        {/* Gestion des équipes (admin) */}
        {onglet === "equipes" && <GestionEquipes config={config} onAjouter={ajouterEquipe} onRetirer={retirerEquipe} onPin={changerPinAdmin} />}

        {/* Messagerie */}
        {onglet === "messages" && (
          <>
            <h2 className="mb-4 text-3xl font-bold uppercase" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}>
              Messages — {equipe?.nom}
            </h2>
            {messages === null ? (
              <div className="py-10 text-center text-sm" style={{ color: C.gris }}>Chargement des messages…</div>
            ) : (
              <Messagerie
                session={session}
                moi={moi}
                joueurs={equipePlayers}
                messages={messages}
                onEnvoyer={envoyerMessage}
                onRafraichir={() => chargerMessages(teamId)}
              />
            )}
          </>
        )}

        {/* Profil du joueur connecté */}
        {onglet === "profil" && moi && <ProfilJoueur moi={moi} equipe={equipe} onSauver={sauverProfil} />}

        {/* Tableau de bord de l'organisation (admin) */}
        {onglet === "direction" && estAdmin && <TableauDirection config={config} players={players} />}
      </main>
    </div>
  );
}

/* ---------- Messagerie ---------- */
function Messagerie({ session, moi, joueurs, messages, onEnvoyer, onRafraichir }) {
  const estStaff = session.role === "coach" || session.role === "admin";
  const [canal, setCanal] = useState(estStaff ? "equipe" : "equipe");
  const [cible, setCible] = useState(joueurs[0]?.id || "");
  const [texte, setTexte] = useState("");
  const [envoi, setEnvoi] = useState(false);

  const cleCanal = canal === "equipe" ? "equipe" : "prive:" + (estStaff ? cible : moi.id);
  const fil =
    canal === "equipe"
      ? messages?.equipe || []
      : messages?.prives?.[estStaff ? cible : moi.id] || [];

  const envoyer = async () => {
    const t = texte.trim();
    if (!t) return;
    setEnvoi(true);
    await onEnvoyer(cleCanal, t);
    setTexte("");
    setEnvoi(false);
  };

  const monNom = moi ? moi.nom : session.role === "admin" ? "Direction ROF" : "Coach";
  const heure = (ts) =>
    new Date(ts).toLocaleDateString("fr-CA", { day: "numeric", month: "short" }) +
    " · " +
    new Date(ts).toLocaleTimeString("fr-CA", { hour: "2-digit", minute: "2-digit" });

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCanal("equipe")}
          className="rounded-full px-4 py-2 text-sm font-bold uppercase"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.06em",
            background: canal === "equipe" ? C.or : C.craie,
            color: canal === "equipe" ? C.noir : C.gris,
          }}
        >
          👥 Équipe
        </button>
        <button
          onClick={() => setCanal("prive")}
          className="rounded-full px-4 py-2 text-sm font-bold uppercase"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            letterSpacing: "0.06em",
            background: canal === "prive" ? C.or : C.craie,
            color: canal === "prive" ? C.noir : C.gris,
          }}
        >
          🔒 {estStaff ? "Privé (par joueuse·eur)" : "Mon coach"}
        </button>
        {canal === "prive" && estStaff && (
          <select
            value={cible}
            onChange={(e) => setCible(e.target.value)}
            className="rounded-lg border px-2 py-2 text-sm"
            style={{ borderColor: C.ligne, color: C.texte, background: C.craie }}
          >
            {joueurs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nom}
              </option>
            ))}
            {joueurs.length === 0 && <option value="">Aucun joueur inscrit</option>}
          </select>
        )}
        <button onClick={onRafraichir} className="ml-auto rounded-full px-3 py-2 text-sm" style={{ background: C.craie, color: C.champagne }}>
          ↻ Actualiser
        </button>
      </div>

      {canal === "prive" && !estStaff && (
        <p className="mb-3 text-xs" style={{ color: C.gris }}>
          Conversation privée entre toi (et tes parents) et le personnel d'entraîneurs de l'équipe.
        </p>
      )}
      {canal === "equipe" && (
        <p className="mb-3 text-xs" style={{ color: C.gris }}>
          Canal visible par toute l'équipe — joueurs, joueuses, parents et coachs.
        </p>
      )}

      <div className="grid gap-2 rounded-xl border p-3" style={{ background: C.marine, borderColor: C.ligne, minHeight: 260 }}>
        {fil.length === 0 && (
          <div className="py-10 text-center text-sm" style={{ color: C.gris }}>
            Aucun message pour l'instant. Lance la conversation ! 🥎
          </div>
        )}
        {fil.map((m) => {
          const mien = m.auteur === monNom && m.role === session.role;
          return (
            <div key={m.id} className={`flex ${mien ? "justify-end" : "justify-start"}`}>
              <div
                className="max-w-[85%] rounded-2xl px-3.5 py-2"
                style={{
                  background: mien ? C.or : m.role === "joueur" ? C.marine2 : C.royalSombre,
                  color: mien ? "#0B1220" : C.texte,
                }}
              >
                {!mien && (
                  <div className="text-xs font-bold uppercase" style={{ color: C.poudre, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}>
                    {m.auteur} {m.role !== "joueur" ? "· Staff" : ""}
                  </div>
                )}
                <div className="whitespace-pre-wrap text-base leading-snug">{m.texte}</div>
                <div className="mt-0.5 text-right text-[10px]" style={{ color: mien ? "#6B571B" : C.gris }}>
                  {heure(m.ts)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <Zone value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Écris ton message…" style={{ minHeight: 52 }} />
        <button
          onClick={envoyer}
          disabled={envoi || !texte.trim() || (canal === "prive" && estStaff && !cible)}
          className="rounded-xl px-5 py-3 text-base font-bold uppercase disabled:opacity-40"
          style={{ background: C.or, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.06em" }}
        >
          Envoyer
        </button>
      </div>
      <p className="mt-2 text-xs" style={{ color: C.gris }}>
        Astuce : touche « ↻ Actualiser » pour voir les nouveaux messages. Parents : connectez-vous avec le compte de votre athlète.
      </p>
    </>
  );
}

function ProfilJoueur({ moi, equipe, onSauver }) {
  const [f, setF] = useState({
    position: moi.position || "",
    lance: moi.lance || "",
    frappe: moi.frappe || "",
    parentNom: moi.parentNom || "",
    parentTel: moi.parentTel || "",
    parentCourriel: moi.parentCourriel || "",
    sante: moi.sante || "",
    naissance: moi.naissance || "",
    fieldlevel: moi.fieldlevel || "",
    consentement: !!moi.consentement,
  });
  const maj = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
  return (
    <>
      <div className="rounded-2xl border p-5 text-center" style={{ background: `linear-gradient(160deg, ${C.royalSombre}, ${C.marine2})`, borderColor: C.royalSombre }}>
        <div className="flex justify-center">
          <LogoR h={64} />
        </div>
        <div className="mt-2 text-2xl font-bold uppercase" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}>
          {moi.nom}
        </div>
        <div className="mt-1 text-sm" style={{ color: C.gris }}>
          {equipe?.nom}
        </div>
        <div className="mt-2 flex justify-center">
          <BadgeStatut statut={moi.statut} />
        </div>
        <div className="mt-2 text-xs" style={{ color: C.gris }}>
          {STATUTS.find((s) => s.id === moi.statut)?.desc} — parcours : {STATUTS.map((s) => s.nom).join(" → ")}
        </div>
      </div>

      <div className="mt-4 rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
        <Etiquette texte="Date de naissance" />
        <Champ value={f.naissance} onChange={maj("naissance")} type="date" />
        <Etiquette texte="Position principale" />
        <Selecteur
          value={f.position}
          onChange={maj("position")}
          options={[
            { value: "", label: "— Choisir —" },
            ...["Lanceur·euse", "Receveur·euse", "1er but", "2e but", "3e but", "Arrêt-court", "Champ extérieur", "Utilitaire"].map((p) => ({ value: p, label: p })),
          ]}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Etiquette texte="Lance" />
            <Selecteur value={f.lance} onChange={maj("lance")} options={[{ value: "", label: "—" }, { value: "Droite", label: "Droite" }, { value: "Gauche", label: "Gauche" }]} />
          </div>
          <div>
            <Etiquette texte="Frappe" />
            <Selecteur value={f.frappe} onChange={maj("frappe")} options={[{ value: "", label: "—" }, { value: "Droite", label: "Droite" }, { value: "Gauche", label: "Gauche" }, { value: "Ambidextre", label: "Ambidextre" }]} />
          </div>
        </div>
        <Etiquette texte="Nom du parent / tuteur" />
        <Champ value={f.parentNom} onChange={maj("parentNom")} />
        <Etiquette texte="Téléphone du parent / tuteur" />
        <Champ value={f.parentTel} onChange={maj("parentTel")} inputMode="tel" />
        <Etiquette texte="Courriel du parent / tuteur" />
        <Champ value={f.parentCourriel} onChange={maj("parentCourriel")} inputMode="email" />
        <Etiquette texte="Allergies / infos médicales" />
        <Champ value={f.sante} onChange={maj("sante")} />
        <Etiquette texte="Profil FieldLevel (recrutement)" />
        <Champ value={f.fieldlevel} onChange={maj("fieldlevel")} placeholder="https://www.fieldlevel.com/athlete/…" inputMode="url" />
        {f.fieldlevel && (
          <a
            href={f.fieldlevel}
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-block rounded-lg px-4 py-2 text-sm font-bold uppercase tracking-wider"
            style={{ background: C.royal, color: C.noir, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.08em" }}
          >
            🎯 Voir mon profil FieldLevel ↗
          </a>
        )}
        <p className="mt-1 text-xs" style={{ color: C.gris }}>
          FieldLevel est le réseau de recrutement utilisé par l'académie pour te connecter aux programmes NCAA et U Sports.
        </p>
        <label className="mt-3 flex items-start gap-2 text-sm" style={{ color: C.texte }}>
          <input type="checkbox" checked={f.consentement} onChange={maj("consentement")} className="mt-0.5" />
          <span>J'autorise Royal On Field à utiliser des photos et vidéos à des fins promotionnelles.</span>
        </label>
        <div className="mt-4 text-right">
          <Bouton plein enfant="Sauvegarder mon profil" onClick={() => onSauver(f)} />
        </div>
      </div>
    </>
  );
}

function TableauDirection({ config, players }) {
  const total = players.length;
  const parEquipe = config.teams.map((t) => ({ ...t, n: players.filter((p) => p.teamId === t.id).length }));
  const parStatut = STATUTS.map((s) => ({ ...s, n: players.filter((p) => p.statut === s.id).length }));
  const recents = [...players].sort((a, b) => (b.creeLe || 0) - (a.creeLe || 0)).slice(0, 5);
  const sansFiche = players.filter((p) => !p.naissance || !p.parentTel).length;
  const consentements = players.filter((p) => p.consentement).length;

  const Tuile = ({ n, l, c }) => (
    <div className="rounded-2xl border p-4 text-center" style={{ background: C.blanc, borderColor: C.ligne }}>
      <div className="text-4xl font-bold" style={{ color: c || C.or, fontFamily: "'Barlow Condensed', sans-serif" }}>
        {n}
      </div>
      <div className="mt-1 text-xs uppercase" style={{ color: C.gris, letterSpacing: "0.08em" }}>
        {l}
      </div>
    </div>
  );

  return (
    <>
      <h2 className="mb-4 text-3xl font-bold uppercase" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}>
        Direction — vue d'organisation
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tuile n={total} l="Inscriptions totales" />
        <Tuile n={config.teams.length} l="Équipes actives" />
        <Tuile n={consentements} l="Consentements photo" c={C.gazon} />
        <Tuile n={sansFiche} l="Fiches incomplètes" c={sansFiche > 0 ? C.rouge : C.gazon} />
      </div>

      <h3 className="mb-2 mt-6 text-xl font-bold uppercase" style={{ color: C.champagne, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
        Effectifs par équipe
      </h3>
      <div className="grid gap-2">
        {parEquipe.map((t) => (
          <div key={t.id} className="flex items-center justify-between rounded-xl border px-4 py-3" style={{ background: C.blanc, borderColor: C.ligne }}>
            <div>
              <span className="font-semibold" style={{ color: C.texte }}>{t.nom}</span>
              <span className="ml-2 text-xs" style={{ color: C.gris }}>{t.sport} · code {t.coachCode}</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: t.n > 0 ? C.or : C.gris, fontFamily: "'Barlow Condensed', sans-serif" }}>{t.n}</span>
          </div>
        ))}
      </div>

      <h3 className="mb-2 mt-6 text-xl font-bold uppercase" style={{ color: C.champagne, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
        Pipeline de développement
      </h3>
      <div className="rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
        {parStatut.map((s) => (
          <div key={s.id} className="mb-2 flex items-center gap-3 last:mb-0">
            <div className="w-32 shrink-0">
              <BadgeStatut statut={s.id} petit />
            </div>
            <div className="h-3 flex-1 overflow-hidden rounded-full" style={{ background: C.craie }}>
              <div className="h-full rounded-full" style={{ width: total ? `${(s.n / total) * 100}%` : 0, background: s.id >= 7 ? C.or : C.royal }} />
            </div>
            <div className="w-8 text-right font-bold" style={{ color: C.texte }}>{s.n}</div>
          </div>
        ))}
      </div>

      <h3 className="mb-2 mt-6 text-xl font-bold uppercase" style={{ color: C.champagne, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: "0.05em" }}>
        Dernières inscriptions
      </h3>
      <div className="grid gap-2">
        {recents.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border px-4 py-2.5" style={{ background: C.blanc, borderColor: C.ligne }}>
            <div>
              <span className="font-semibold" style={{ color: C.texte }}>{p.nom}</span>
              <span className="ml-2 text-xs" style={{ color: C.gris }}>{config.teams.find((t) => t.id === p.teamId)?.nom}</span>
            </div>
            <span className="text-xs" style={{ color: C.gris }}>{p.creeLe ? new Date(p.creeLe).toLocaleDateString("fr-CA") : ""}</span>
          </div>
        ))}
        {recents.length === 0 && <div className="text-sm" style={{ color: C.gris }}>Aucune inscription pour l'instant.</div>}
      </div>
    </>
  );
}

function GestionEquipes({ config, onAjouter, onRetirer, onPin }) {
  const [nom, setNom] = useState("");
  const [sport, setSport] = useState("Baseball");
  const [pin, setPin] = useState("");
  return (
    <>
      <h2 className="mb-4 text-3xl font-bold uppercase" style={{ color: C.pur, fontFamily: "'Barlow Condensed', sans-serif" }}>
        Équipes & codes
      </h2>
      <div className="grid gap-2">
        {config.teams.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl border p-3"
            style={{ background: C.blanc, borderColor: C.ligne }}
          >
            <div>
              <div className="font-semibold" style={{ color: C.texte }}>
                {t.nom} <span className="text-xs" style={{ color: C.gris }}>({t.sport})</span>
              </div>
              <div className="text-sm" style={{ color: C.gris }}>
                Code entraîneur : <strong style={{ color: C.royal }}>{t.coachCode}</strong>
              </div>
            </div>
            <button onClick={() => onRetirer(t.id)} className="text-sm" style={{ color: C.rouge }}>
              Retirer
            </button>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
        <Etiquette texte="Nouvelle équipe" />
        <Champ value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex. : Softball 16U" />
        <Etiquette texte="Sport" />
        <Selecteur
          value={sport}
          onChange={(e) => setSport(e.target.value)}
          options={[
            { value: "Baseball", label: "Baseball" },
            { value: "Softball", label: "Softball" },
          ]}
        />
        <div className="mt-3 text-right">
          <Bouton
            plein
            enfant="Créer l'équipe"
            onClick={() => {
              onAjouter(nom, sport);
              setNom("");
            }}
          />
        </div>
      </div>

      <div className="mt-5 rounded-xl border p-4" style={{ background: C.blanc, borderColor: C.ligne }}>
        <Etiquette texte="Changer le NIP administrateur" />
        <Champ value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Nouveau NIP (min. 4 caractères)" type="password" />
        <div className="mt-3 text-right">
          <Bouton
            plein
            enfant="Mettre à jour"
            onClick={() => {
              onPin(pin);
              setPin("");
            }}
          />
        </div>
      </div>
    </>
  );
}
