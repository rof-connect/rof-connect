import Link from "next/link";
import { LogoR } from "@/components/LogoR";
import { SiteNav } from "@/components/site/SiteNav";
import { Kicker, Section } from "@/components/site/Section";
import { STATS_HERO, PILIERS, PARCOURS, SCOLAIRE, PLACEMENT, PALMARES } from "@/lib/site-data";

export default function Home() {
  return (
    <div className="bg-rof-noir font-sans">
      <SiteNav />

      {/* Héro */}
      <section
        id="haut"
        className="relative overflow-hidden px-5 pb-10 pt-20 text-center"
        style={{ background: "radial-gradient(circle at 50% 0%, #132A5E 0%, #05070C 62%)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(circle at 82% 18%, #B8860B33 0%, transparent 40%)" }}
        />
        <div className="relative mx-auto max-w-3xl">
          <Kicker texte="Académie élite · Baseball & Softball · Québec" />
          <div className="mt-5 flex justify-center">
            <LogoR h={140} />
          </div>
          <h1 className="mt-4 font-condensed text-5xl font-bold uppercase leading-none tracking-[0.03em] text-white sm:text-7xl">
            Deviens l&apos;athlète que tu <span className="text-rof-or">mérites</span> d&apos;être.
          </h1>
          <div className="mt-3 font-script text-4xl text-rof-poudre sm:text-5xl">Earn the crown.</div>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-rof-gris">
            Royal On Field est l&apos;académie québécoise de développement complet — athlétique, scolaire et humain — pour
            les joueurs et joueuses de baseball et softball qui visent les plus grandes scènes, jusqu&apos;à Williamsport.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#apropos"
              className="rounded-xl bg-rof-or px-6 py-3 font-condensed text-base font-bold uppercase tracking-[0.08em] text-rof-noir"
            >
              Découvrir l&apos;académie
            </a>
            <Link
              href="/connexion"
              className="rounded-xl border-[1.5px] border-rof-or px-6 py-3 font-condensed text-base font-bold uppercase tracking-[0.08em] text-rof-or"
            >
              Espace membres
            </Link>
          </div>
          <div className="mt-8 font-condensed text-xs uppercase tracking-[0.2em] text-rof-gris">
            Baseball Québec · Softball Québec
          </div>
        </div>

        <div className="relative mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-rof-ligne bg-rof-ligne md:grid-cols-4">
          {STATS_HERO.map(([n, l]) => (
            <div key={l} className="bg-rof-marine px-4 py-6">
              <div className="font-condensed text-5xl font-bold text-rof-or">{n}</div>
              <div className="mt-1 text-xs uppercase leading-snug tracking-[0.08em] text-rof-gris">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* L'expérience Royal */}
      <Section id="apropos" kicker="Notre approche" titre="L'expérience Royal" fond="noir">
        <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-rof-texte">
          Comme les grandes académies internationales, nous développons la personne au complet. Trois piliers portent
          chaque athlète, du premier entraînement jusqu&apos;au niveau collégial et universitaire.
        </p>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {PILIERS.map((p, i) => (
            <div key={p.t} className="rounded-2xl border border-rof-ligne bg-rof-blanc p-7">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{p.ic}</span>
                <span className="font-condensed text-5xl font-bold text-rof-royal-sombre">0{i + 1}</span>
              </div>
              <div className="mt-3 font-condensed text-2xl font-bold uppercase leading-tight tracking-[0.03em] text-white">
                {p.t}
              </div>
              <div className="mt-2 h-0.5 w-10 bg-rof-or" />
              <p className="mt-3 text-sm leading-relaxed text-rof-gris">{p.d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Voies de développement */}
      <Section id="programmes" kicker="Voies de développement" titre="Un parcours. Une destination." fond="marine">
        <p className="mx-auto mb-8 max-w-2xl text-center text-base text-rof-gris">
          Chaque groupe d&apos;âge s&apos;inscrit dans un plan de développement continu qui vise les plus grandes scènes du
          baseball et de la softball mineurs — jusqu&apos;à Williamsport.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {PARCOURS.map((g) => (
            <div key={g.age} className="flex flex-col rounded-2xl border border-rof-ligne bg-rof-blanc p-6">
              <div className="font-condensed text-4xl font-bold uppercase tracking-[0.03em] text-rof-or">{g.age}</div>
              <div className="mt-2 h-0.5 w-10 bg-rof-royal" />
              <ul className="mt-4 grid gap-2.5">
                {g.items.map((x) => (
                  <li key={x} className="flex items-start gap-2 text-base leading-snug text-rof-texte">
                    <span className="text-rof-poudre">♦</span> {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-rof-gris">* Selon la qualification</p>
      </Section>

      {/* Programme scolaire */}
      <Section id="scolaire" kicker="Étudiant·e-athlète d'abord" titre="Programme scolaire" fond="noir">
        <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-rof-texte">
          La réussite scolaire n&apos;est pas négociable. Notre continuum école-terrain accompagne l&apos;athlète du
          primaire à la fin du secondaire, sans compromis.
        </p>
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          {SCOLAIRE.map((s) => (
            <div key={s.n} className="rounded-2xl border border-rof-ligne bg-rof-blanc p-6">
              <div className="font-condensed text-xs font-bold uppercase tracking-[0.1em] text-rof-poudre">{s.t}</div>
              <div className="mt-1 font-condensed text-2xl font-bold uppercase leading-tight text-white">{s.n}</div>
              <p className="mt-2 text-sm leading-relaxed text-rof-gris">{s.d}</p>
              <div className="mt-3 font-condensed text-xs font-bold uppercase tracking-[0.08em] text-rof-royal">
                Baseball · Softball
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Placement & recrutement */}
      <Section id="academie" kicker="L'après-Royal" titre="Placement & recrutement" fond="marine">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <p className="text-lg leading-relaxed text-rof-texte">
              Le développement ne s&apos;arrête pas au dernier retrait. Pour nos athlètes JV et Varsity, l&apos;académie
              bâtit activement le pont vers le niveau collégial et universitaire.
            </p>
            <ul className="mt-5 grid gap-2.5">
              {PLACEMENT.map((x) => (
                <li key={x} className="flex items-start gap-2 text-base leading-snug text-rof-texte">
                  <span className="text-rof-or">♦</span> {x}
                </li>
              ))}
            </ul>
          </div>
          <div
            className="rounded-2xl border border-rof-royal-sombre p-8 text-center"
            style={{ background: "linear-gradient(160deg, #132A5E, #152340)" }}
          >
            <div className="flex justify-center">
              <LogoR h={110} />
            </div>
            <div className="mt-3 font-script text-3xl text-rof-poudre">Built Royal.</div>
            <div className="mt-2 font-condensed text-xs uppercase tracking-[0.15em] text-rof-poudre">
              NCAA · NAIA · U Sports
            </div>
          </div>
        </div>
      </Section>

      {/* Résultats */}
      <Section id="champions" kicker="Résultats" titre="Le palmarès parle" fond="noir">
        <div className="mx-auto max-w-3xl">
          {PALMARES.map((a) => (
            <div key={a.annee} className="mb-8 last:mb-0">
              <div className="flex items-center gap-4">
                <div className="font-condensed text-5xl font-bold text-rof-or">{a.annee}</div>
                <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, #B8860B, transparent)" }} />
              </div>
              <ul className="mt-3 grid gap-2.5">
                {a.faits.map((x) => (
                  <li
                    key={x}
                    className={`flex items-start gap-3 rounded-xl border bg-rof-blanc px-4 py-3 text-base leading-snug text-rof-texte ${
                      x.startsWith("Champion") ? "border-rof-or-fonce" : "border-rof-ligne"
                    }`}
                  >
                    <span className="shrink-0 text-rof-poudre">{x.startsWith("Champion") ? "🏆" : "⭐"}</span>
                    {x}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* Admission */}
      <Section id="rejoindre" kicker="Admission" titre="Ton parcours commence ici" fond="marine">
        <p className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-rof-texte">
          L&apos;admission débute par un profil <strong className="text-rof-poudre">Prospect</strong> dans l&apos;espace
          membres. Notre personnel évalue chaque athlète et l&apos;assigne à sa division — de Mineur à Varsity. Joueurs,
          joueuses et parents y retrouvent calendrier, plan annuel, messagerie d&apos;équipe et suivi de recrutement.
        </p>
        <div className="mt-7 text-center">
          <Link
            href="/inscription"
            className="inline-block rounded-xl bg-rof-or px-8 py-4 font-condensed text-lg font-bold uppercase tracking-[0.08em] text-rof-noir"
          >
            Créer mon profil Prospect
          </Link>
          <div className="mt-3 text-xs text-rof-gris">Déjà membre ? La connexion se trouve dans le menu ci-dessus.</div>
        </div>
      </Section>

      {/* Pied de page */}
      <footer className="border-t border-rof-ligne bg-rof-noir px-5 py-10 text-center">
        <div className="flex justify-center">
          <LogoR h={46} />
        </div>
        <div className="mt-3 font-condensed text-sm uppercase tracking-[0.12em] text-rof-gris">
          #EarnTheCrown · #BuiltRoyal · #RoyalOnField
        </div>
        <div className="mt-2 text-xs text-rof-gris">Royal On Field — Académie élite Baseball & Softball · Québec · OBNL</div>
      </footer>
    </div>
  );
}
