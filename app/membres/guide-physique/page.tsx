import type { Metadata } from "next";
import Link from "next/link";
import { bouton } from "@/components/ui/boutons";

export const metadata: Metadata = { title: "Comment progresser avec tes poids — Phase 2" };
export const dynamic = "force-dynamic";

// Contenu fourni par la Direction (consignes de progression, phase 2 — décembre), écrit simplement pour les joueuses. Programme : Gym L'Armure.

const CHOIX = [
  { si: "J'aurais pu faire encore 3 répétitions ou plus", alors: "Monte un peu", aide: "Demande l'accord de ton entraîneur.", signe: "↑", bord: "border-rof-gazon", fond: "bg-rof-gazon" },
  { si: "C'était dur à la fin, mais ma technique est restée bonne", alors: "Garde ton poids", aide: "Tu es exactement au bon endroit.", signe: "=", bord: "border-rof-or", fond: "bg-rof-or" },
  { si: "Je n'ai pas fini mes répétitions, ou ma technique a lâché", alors: "Baisse ton poids", aide: "Une bonne technique d'abord.", signe: "↓", bord: "border-rof-rouge", fond: "bg-rof-rouge" },
];

const SEMAINES = [
  { n: 1, dates: "1er au 5 déc.", debut: "2026-11-30", fin: "2026-12-06", quoi: "Trouve ton poids de départ" },
  { n: 2, dates: "8 au 12 déc.", debut: "2026-12-07", fin: "2026-12-13", quoi: "Vérifie et ajuste ton poids" },
  { n: 3, dates: "15 au 19 déc.", debut: "2026-12-14", fin: "2026-12-20", quoi: "Monte, si tu es prête" },
  { n: 4, dates: "22 au 26 déc.", debut: "2026-12-21", fin: "2026-12-27", quoi: "Maîtrise ton nouveau poids" },
  { n: 5, dates: "29 déc. au 2 janv.", debut: "2026-12-28", fin: "2027-01-03", quoi: "Monte, si tu es prête" },
  { n: 6, dates: "5 au 9 janv.", debut: "2027-01-04", fin: "2027-01-10", quoi: "Confirme tes progrès, sans forcer jusqu'à l'échec" },
];

const FAMILLES = [
  { nom: "Force", regle: "Monte le poids petit à petit.", texte: "Toujours avec une bonne technique." },
  { nom: "Explosivité", regle: "La vitesse avant le poids.", texte: "Si le poids te ralentit, prends plus léger." },
  { nom: "Stabilité", regle: "Le contrôle avant le poids.", texte: "Bonne posture, bon équilibre, mouvement contrôlé." },
];

const JOURS: { n: number; nom: string; quand: string; exercices: [string, string, string][] }[] = [
  {
    n: 1, nom: "Corps complet", quand: "Mardi",
    exercices: [
      ["Goblet squat sur banc", "3 × 12", "Poids : +2,5 à 5 %"],
      ["Sauts de boîte", "3 × 6", "Saute bien et fort"],
      ["Dead bug avec dumbbells", "3 × 20", "Reste stable avant d'alourdir"],
      ["Développé couché", "3 × 12", "Poids : +2,5 à 5 %"],
      ["Ramer penchée (bent over row)", "3 × 12", "Poids : +2,5 à 5 %"],
      ["Planche de l'ours avec haltère", "3 × 20", "Reste stable avant d'alourdir"],
    ],
  },
  {
    n: 2, nom: "Haut du corps", quand: "Jeudi",
    exercices: [
      ["Lancer latéral de ballon", "2 × 6 par côté", "Lance plus vite"],
      ["Lancer de ballon au sol", "3 × 6", "Lance plus fort"],
      ["Développé d'épaules assis", "3 × 12", "Poids : +2 à 5 %"],
      ["Chin-up avec élastique", "3 × 5", "Moins d'aide, petit à petit"],
      ["Russian twist", "3 × 20", "Contrôle avant d'alourdir"],
      ["Lat pulldown", "3 × 12", "Poids : +2,5 à 5 %"],
      ["Biceps curl", "3 × 12", "Le plus petit saut de poids"],
      ["Clamshell", "3 × 12", "Élastique plus fort"],
    ],
  },
  {
    n: 3, nom: "Bas du corps", quand: "Samedi",
    exercices: [
      ["Élévation de hanche avec kettlebell", "3 × 12", "Poids : +2,5 à 5 %"],
      ["Fente bulgare", "3 × 10", "Poids : +2,5 à 5 %"],
      ["Jack knife", "3 × 20", "Contrôle le mouvement"],
      ["Extension des genoux", "3 × 12", "Poids : +2,5 à 5 %"],
      ["Leg curl", "3 × 12", "Poids : +2,5 à 5 %"],
      ["Extension des bras avec élastique", "3 × 12", "Élastique plus fort"],
      ["Poussée du traîneau", "4 × 30 s", "Poids et vitesse, bien maîtrisés"],
    ],
  },
];

const EXEMPLE = ["40", "40", "42,5", "42,5", "45", "45"];

const titre = "font-condensed text-2xl font-bold uppercase leading-tight text-rof-texte";
const carte = "rounded-2xl border border-rof-ligne bg-rof-blanc p-4";

export default function GuidePhysiquePage() {
  const jour = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Toronto" }).format(new Date());
  const enCours = SEMAINES.find((s) => jour >= s.debut && jour <= s.fin)?.n;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-5 py-6">
      <header>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Phase 2 · Décembre</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase leading-tight text-rof-texte">Comment progresser avec tes poids</h1>
        <p className="mt-2 text-base text-rof-texte">3 entraînements par semaine, pendant 6 semaines. Les répétitions ne changent pas : c&apos;est ton poids qui peut monter.</p>
        <ul className="mt-4 grid grid-cols-3 gap-2">
          {JOURS.map((j) => (
            <li key={j.n} className={`${carte} text-center`}>
              <p className="font-condensed text-sm font-bold uppercase text-rof-or">{j.quand}</p>
              <p className="font-condensed text-2xl font-bold text-rof-texte">Jour {j.n}</p>
              <p className="text-xs text-rof-gris">{j.nom}</p>
            </li>
          ))}
        </ul>
      </header>

      <section aria-labelledby="g-choix" className="flex flex-col gap-3">
        <h2 id="g-choix" className={titre}>Après ta dernière série, pose-toi la question</h2>
        <p className="text-sm text-rof-gris">Un bon poids : les premières répétitions sont assez faciles, les dernières sont difficiles, et ta technique reste bonne.</p>
        {CHOIX.map((c) => (
          <article key={c.alors} className={`overflow-hidden rounded-2xl border-2 bg-rof-blanc ${c.bord}`}>
            <p className="px-4 pt-3 text-base text-rof-texte">« {c.si} »</p>
            <div className={`mt-3 flex items-center gap-3 px-4 py-3 text-black ${c.fond} ${c.fond === "bg-rof-rouge" ? "!text-white" : ""}`}>
              <span aria-hidden className="font-condensed text-4xl font-bold leading-none">{c.signe}</span>
              <div>
                <p className="font-condensed text-2xl font-bold uppercase leading-none">{c.alors}</p>
                <p className="mt-1 text-xs">{c.aide}</p>
              </div>
            </div>
          </article>
        ))}
        <p className="text-sm text-rof-texte">Monte par petits sauts. Si le prochain haltère est beaucoup trop lourd, garde le tien. Tu n&apos;es pas obligée de monter chaque semaine, ni sur tous les exercices.</p>
      </section>

      <section aria-labelledby="g-noter" className="rounded-2xl border-2 border-rof-or bg-rof-or/10 p-4">
        <h2 id="g-noter" className={titre}>Écris ton poids à chaque entraînement</h2>
        <p className="mt-2 text-sm text-rof-texte">Note-le dans ton téléphone ou ton cahier : l&apos;exercice, le poids, et comment c&apos;était. La semaine suivante, tu sais par où commencer.</p>
      </section>

      <section aria-labelledby="g-exemple" className="flex flex-col gap-3">
        <h2 id="g-exemple" className={titre}>Exemple : goblet squat</h2>
        <ol className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {EXEMPLE.map((lb, i) => (
            <li key={i} className={`${carte} text-center`}>
              <p className="font-condensed text-xs font-bold uppercase text-rof-gris">Sem. {i + 1}</p>
              <p className="font-condensed text-2xl font-bold text-rof-texte">{lb}</p>
              <p className="text-xs text-rof-gris">lb</p>
            </li>
          ))}
        </ol>
        <p className="font-condensed text-lg font-bold uppercase text-rof-gazon">De 40 à 45 lb en 6 semaines, seulement quand c&apos;est réussi</p>
      </section>

      <section aria-labelledby="g-semaines" className="flex flex-col gap-3">
        <h2 id="g-semaines" className={titre}>Tes 6 semaines</h2>
        <ol className="flex flex-col gap-2">
          {SEMAINES.map((s) => (
            <li key={s.n} aria-current={s.n === enCours ? "step" : undefined} className={`flex items-center gap-3 rounded-xl border p-3 ${s.n === enCours ? "border-rof-or bg-rof-or/10" : "border-rof-ligne bg-rof-blanc"}`}>
              <span className="w-9 shrink-0 text-center font-condensed text-3xl font-bold text-rof-or">{s.n}</span>
              <div>
                <p className="text-base font-semibold text-rof-texte">{s.quoi}</p>
                <p className="text-xs text-rof-gris">{s.dates}{s.n === enCours ? " · cette semaine" : ""}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="g-familles" className="flex flex-col gap-3">
        <h2 id="g-familles" className={titre}>3 sortes d&apos;exercices</h2>
        {FAMILLES.map((f) => (
          <article key={f.nom} className={carte}>
            <h3 className="font-condensed text-lg font-bold uppercase text-rof-poudre">{f.nom}</h3>
            <p className="text-base font-semibold text-rof-texte">{f.regle}</p>
            <p className="text-sm text-rof-gris">{f.texte}</p>
          </article>
        ))}
      </section>

      <section aria-labelledby="g-exercices" className="flex flex-col gap-3">
        <h2 id="g-exercices" className={titre}>Quoi améliorer, exercice par exercice</h2>
        {JOURS.map((j) => (
          <details key={j.n} className={carte}>
            <summary className="min-h-10 cursor-pointer font-condensed text-lg font-bold uppercase text-rof-texte">
              Jour {j.n} · {j.nom} <span className="text-sm font-semibold normal-case text-rof-gris">· {j.quand.toLowerCase()}</span>
            </summary>
            <ul className="mt-2 flex flex-col">
              {j.exercices.map(([nom, series, progression]) => (
                <li key={nom} className="flex items-start justify-between gap-3 border-t border-rof-ligne py-2">
                  <div>
                    <p className="text-sm font-semibold text-rof-texte">{nom}</p>
                    <p className="text-xs text-rof-gris">{series}</p>
                  </div>
                  <p className="max-w-[48%] shrink-0 text-right text-sm font-semibold text-rof-or">{progression}</p>
                </li>
              ))}
            </ul>
          </details>
        ))}
        <p className="text-xs text-rof-gris">Les pourcentages sont des repères suggérés.</p>
      </section>

      <section aria-labelledby="g-mot" className={carte}>
        <h2 id="g-mot" className={titre}>Nous voulons progresser</h2>
        <ul className="mt-2 flex list-disc flex-col gap-1 pl-5 text-sm text-rof-texte">
          <li>Chaque entraînement a un objectif.</li>
          <li>Sois disciplinée, constante et responsable de ta progression.</li>
          <li>Fatiguée par le softball ou le lancer? Ne force pas tes charges.</li>
        </ul>
        <p className="mt-3 font-condensed text-base font-bold uppercase text-rof-or">Plus forte, plus rapide, plus explosive sur le terrain.</p>
        <Link href="/membres/agenda" className={`${bouton("primaire", "md")} mt-4`}>
          Aller à mes entraînements
        </Link>
        <p className="mt-3 text-xs text-rof-gris">Programme : Gym L&apos;Armure · Royal On Field Softball</p>
      </section>
    </main>
  );
}
