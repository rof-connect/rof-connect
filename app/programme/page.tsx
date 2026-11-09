import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionnaire();
  return {
    title: "Royal On Field | " + t.site.kicker,
    description: t.site.intro,
    openGraph: { title: "Royal On Field", description: t.site.intro, type: "website" },
  };
}

const kicker = "font-condensed text-sm font-bold uppercase tracking-[0.3em] text-rof-or";
const titre = "mt-2 font-condensed text-3xl font-bold uppercase leading-tight sm:text-5xl";

export default async function ProgrammePage() {
  const { t, locale } = await getDictionnaire();
  const s = t.site;
  const fr = locale !== "en";

  return (
    <main className="min-h-screen bg-rof-noir text-rof-texte">
      {/* Navigation */}
      <header className="sticky top-0 z-20 border-b border-rof-ligne bg-rof-noir/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <Link href="/programme" className="flex items-center gap-3">
            <Image src="/logo-r.png" alt="Royal On Field" width={40} height={40} priority />
            <span className="font-condensed text-sm font-bold uppercase tracking-[0.25em] text-rof-or">Royal On Field</span>
          </Link>
          <nav className="hidden items-center gap-6 font-condensed text-sm uppercase tracking-widest text-rof-gris md:flex">
            <a href="#approche" className="hover:text-rof-or">{s.approcheKicker}</a>
            <a href="#voies" className="hover:text-rof-or">{s.voiesKicker}</a>
            <a href="#scolaire" className="hover:text-rof-or">{s.scolaireTitre}</a>
            <a href="#resultats" className="hover:text-rof-or">{s.resultatsKicker}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LanguageToggle locale={locale} />
            <Link href="/connexion" className="hidden font-condensed text-sm uppercase tracking-widest text-rof-poudre underline sm:inline">
              {fr ? "Connexion" : "Log in"}
            </Link>
            <Link
              href="/inscription"
              className="rounded-full bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-black"
            >
              {fr ? "S'inscrire" : "Sign up"}
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-rof-ligne bg-gradient-to-b from-rof-royal-sombre/50 via-rof-noir to-rof-noir">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-24">
          <p className={kicker}>{s.kicker}</p>
          <h1 className="mt-4 max-w-4xl font-condensed text-5xl font-bold uppercase leading-[0.95] sm:text-7xl">
            {s.titre1} <span className="text-rof-or">{s.titreAccent}</span> {s.titre2}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-rof-texte/90">{s.intro}</p>
          <p className="mt-3 max-w-2xl text-rof-gris">
            {s.introSuite} <span className="text-rof-poudre">{s.destinations}</span>
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/inscription"
              className="rounded-full bg-rof-or px-7 py-3 font-condensed text-base font-bold uppercase tracking-wide text-black"
            >
              {s.creerProfil}
            </Link>
            <a
              href="#approche"
              className="rounded-full border border-rof-or px-7 py-3 font-condensed text-base font-bold uppercase tracking-wide text-rof-or hover:bg-rof-or hover:text-black"
            >
              {s.decouvrir}
            </a>
          </div>
          <p className="mt-6 font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{s.slogan}</p>
        </div>
        <div className="border-t border-rof-ligne bg-rof-blanc/40">
          <dl className="mx-auto grid max-w-6xl grid-cols-2 gap-px px-5 sm:grid-cols-4">
            {s.statsHero.map(([n, l]) => (
              <div key={l} className="px-2 py-6 text-center">
                <dt className="font-condensed text-4xl font-bold text-rof-or sm:text-5xl">{n}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-rof-gris">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Approche */}
      <section id="approche" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <p className={kicker}>{s.approcheKicker}</p>
        <h2 className={titre}>{s.approcheTitre}</h2>
        <p className="mt-4 max-w-3xl text-rof-gris">{s.approcheIntro}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {s.piliers.map((p) => (
            <article key={p.t} className="rounded-2xl border border-rof-ligne bg-rof-blanc p-6">
              <p className="text-3xl" aria-hidden>
                {p.ic}
              </p>
              <h3 className="mt-3 font-condensed text-xl font-bold uppercase text-rof-or">{p.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-rof-texte/90">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Voies de développement */}
      <section id="voies" className="scroll-mt-20 border-y border-rof-ligne bg-rof-blanc/40">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className={kicker}>{s.voiesKicker}</p>
          <h2 className={titre}>{s.voiesTitre}</h2>
          <p className="mt-4 max-w-3xl text-rof-gris">{s.voiesIntro}</p>
          <div className="mt-8 flex flex-col gap-8">
            {s.parcours.map((p) => (
              <div key={p.sport}>
                <h3 className="font-condensed text-lg font-bold uppercase tracking-widest text-rof-poudre">{p.sport}</h3>
                <div className="mt-3 grid gap-4 md:grid-cols-3">
                  {p.groupes.map((g) => (
                    <div key={g.groupe} className="rounded-2xl border border-rof-ligne bg-rof-noir p-5">
                      <p className="font-condensed text-3xl font-bold text-rof-or">{g.groupe}</p>
                      <ol className="mt-3 flex flex-col gap-1.5">
                        {g.etapes.map((e, i) => (
                          <li key={e} className="flex gap-2 text-sm">
                            <span className="font-condensed text-rof-or">{i + 1}.</span>
                            <span>{e}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 font-condensed text-sm uppercase tracking-[0.2em] text-rof-poudre">{s.duQuebec}</p>
        </div>
      </section>

      {/* Programme scolaire */}
      <section id="scolaire" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <p className={kicker}>{s.scolaireKicker}</p>
        <h2 className={titre}>{s.scolaireTitre}</h2>
        <p className="mt-4 max-w-3xl text-rof-gris">{s.scolaireIntro}</p>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {s.scolaire.map((e) => (
            <article key={e.n} className="rounded-2xl border border-rof-ligne bg-rof-blanc p-6">
              <p className="font-condensed text-xs uppercase tracking-[0.25em] text-rof-poudre">{e.t}</p>
              <h3 className="mt-1 font-condensed text-2xl font-bold uppercase text-rof-or">{e.n}</h3>
              <p className="mt-2 text-sm text-rof-texte/90">{e.d}</p>
              <p className="mt-3 text-xs uppercase tracking-widest text-rof-gris">{s.baseballSoftball}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Placement & recrutement */}
      <section className="border-y border-rof-ligne bg-gradient-to-b from-rof-royal-sombre/30 to-transparent">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <p className={kicker}>{s.recrutementKicker}</p>
          <h2 className={titre}>{s.recrutementTitre}</h2>
          <p className="mt-4 max-w-3xl text-rof-gris">{s.recrutementIntro}</p>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {s.placement.map((p) => (
              <li key={p} className="flex gap-3 rounded-xl border border-rof-ligne bg-rof-noir p-4">
                <span className="text-rof-or" aria-hidden>
                  ★
                </span>
                <span className="text-sm">{p}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 font-condensed text-3xl font-bold uppercase text-rof-or">{s.builtRoyal}</p>
        </div>
      </section>

      {/* Résultats */}
      <section id="resultats" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16">
        <p className={kicker}>{s.resultatsKicker}</p>
        <h2 className={titre}>{s.resultatsTitre}</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {s.palmares.map((a) => (
            <article key={a.annee} className="rounded-2xl border border-rof-ligne bg-rof-blanc p-6">
              <p className="font-condensed text-4xl font-bold text-rof-or">{a.annee}</p>
              <ul className="mt-3 flex flex-col gap-2">
                {a.faits.map((f) => (
                  <li key={f.texte} className={`flex gap-2 text-sm ${f.titre ? "font-semibold text-rof-texte" : "text-rof-gris"}`}>
                    <span className="text-rof-or" aria-hidden>
                      {f.titre ? "🏆" : "•"}
                    </span>
                    {f.texte}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Admission */}
      <section id="admission" className="border-t border-rof-ligne bg-rof-royal-sombre/40">
        <div className="mx-auto max-w-3xl px-5 py-16 text-center">
          <p className={kicker}>{s.admissionKicker}</p>
          <h2 className={titre}>{s.admissionTitre}</h2>
          <p className="mt-4 text-rof-texte/90" dangerouslySetInnerHTML={{ __html: s.admissionIntro }} />
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/inscription"
              className="rounded-full bg-rof-or px-8 py-3 font-condensed text-base font-bold uppercase tracking-wide text-black"
            >
              {s.creerProfil}
            </Link>
            <Link href="/parcours" className="font-condensed text-sm uppercase tracking-[0.2em] text-rof-or underline">
              {t.connexion.parcours}
            </Link>
          </div>
          <p className="mt-4 text-sm text-rof-gris">
            {fr ? "Déjà membre ?" : "Already a member?"}{" "}
            <Link href="/connexion" className="text-rof-poudre underline">
              {fr ? "Se connecter" : "Log in"}
            </Link>
          </p>
        </div>
      </section>

      <footer className="border-t border-rof-ligne px-5 py-8 text-center">
        <Image src="/logo-r.png" alt="" width={48} height={48} className="mx-auto" />
        <p className="mt-3 font-condensed text-sm uppercase tracking-[0.25em] text-rof-or">{s.footerTags}</p>
        <p className="mt-2 text-xs text-rof-gris">{s.footerLigne}</p>
        <p className="mt-2 text-xs text-rof-gris">royal@lentrepotdubaseball.com</p>
      </footer>
    </main>
  );
}
