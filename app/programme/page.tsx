import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionnaire();
  return {
    title: "Royal On Field | Earn the Crown",
    description: t.site.intro,
    openGraph: { title: "Royal On Field | Earn the Crown", description: t.site.intro, type: "website", images: ["/photos/cercle-equipe.jpg"] },
  };
}

const bouton =
  "inline-flex items-center justify-center rounded-full px-8 py-4 font-condensed text-base font-bold uppercase tracking-wider transition";

/** Photo plein cadre avec légende en dégradé. */
function Photo({ src, alt, legende, className = "", position = "center" }: { src: string; alt: string; legende?: string; className?: string; position?: string }) {
  return (
    <figure className={`group relative overflow-hidden rounded-3xl bg-rof-blanc ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 50vw, 100vw"
        className="object-cover transition duration-700 group-hover:scale-105"
        style={{ objectPosition: position }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      {legende && (
        <figcaption className="absolute bottom-4 left-5 font-condensed text-2xl font-bold uppercase tracking-wide text-white drop-shadow sm:text-3xl">
          {legende}
        </figcaption>
      )}
    </figure>
  );
}

export default async function ProgrammePage() {
  const { t, locale } = await getDictionnaire();
  const s = t.site;
  const fr = locale !== "en";
  const centre = fr
    ? {
        titre: "Centre d'entraînement privé",
        texte:
          "Des cages de frappe avec lanceurs automatiques et une surface dédiée à l'entraînement : un centre privé pour travailler la technique, la répétition et la confiance, au rythme de chaque athlète.",
      }
    : {
        titre: "Private training center",
        texte:
          "Batting cages with automatic pitching machines and a dedicated training surface: a private center to work on technique, repetition and confidence, at each athlete's pace.",
      };
  const committed = fr
    ? { titre: "Elles ont signé", sous: "Nos athlètes engagées au niveau collégial américain." }
    : { titre: "They committed", sous: "Our athletes committed to the American college level." };
  const engagees = [
    { src: "/photos/committed-maeva-gascon.jpg", nom: "Maeva Gascon", ecole: "North Platte Community College · NJCAA Division 1", detail: "2026 - Nebraska" },
    { src: "/photos/committed-julia-collard.jpg", nom: "Julia Collard", ecole: "Dodge City Community College · NJCAA Division 1", detail: "2027 - Kansas" },
    { src: "/photos/committed-hill-college.webp", nom: "Béatrice Vézina", ecole: "Hill College · NJCAA Division 1", detail: "2027 - Texas" },
  ];
  const partenaires = [
    { src: "/partenaires/little-league.jpg", nom: "Little League", zoom: 1.9 },
    { src: "/partenaires/usa-softball.png", nom: "USA Softball", zoom: 1 },
    { src: "/partenaires/fastpitch-nation.jpg", nom: "Fastpitch Nation", zoom: 1 },
    { src: "/partenaires/entrepot-du-baseball.png", nom: "L'entrepôt du Baseball", zoom: 1 },
    { src: "/partenaires/sebastien-gervais-photo.jpg", nom: "Sébastien Gervais Photo", zoom: 1 },
  ];
  const galerie = [
    ["/photos/galerie-01.jpg", 1024, 1280],
    ["/photos/galerie-02.jpg", 1024, 819],
    ["/photos/galerie-03.jpg", 1024, 1280],
    ["/photos/galerie-04.jpg", 1024, 1280],
    ["/photos/galerie-05.jpg", 1024, 1280],
    ["/photos/galerie-06.jpg", 1024, 1280],
    ["/photos/galerie-07.jpg", 1024, 1280],
    ["/photos/galerie-08.jpg", 1024, 1280],
    ["/photos/galerie-09.jpg", 1024, 1280],
    ["/photos/galerie-10.jpg", 1024, 819],
    ["/photos/galerie-11.jpg", 1024, 819],
    ["/photos/galerie-12.jpg", 740, 2000],
  ] as [string, number, number][];
  const legendes = fr
    ? { unies: "Unies", fieres: "Fières", focus: "Focus", canada: "Équipe Canada", fun: "Le plaisir de jouer" }
    : { unies: "United", fieres: "Proud", focus: "Focus", canada: "Team Canada", fun: "The joy of playing" };

  return (
    <main className="bg-rof-noir text-rof-texte">
      {/* ───────── HERO ───────── */}
      <section className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
        <Image src="/photos/cercle-equipe.jpg" alt="" fill priority sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: "50% 45%" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/55 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/2 bg-gradient-to-t from-rof-noir to-transparent" />

        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5">
          <Link href="/programme" className="flex items-center gap-3">
            <Image src="/logo-r.png" alt="Royal On Field" width={48} height={48} priority />
            <span className="hidden font-condensed text-sm font-bold uppercase tracking-[0.3em] text-white sm:inline">Royal On Field</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageToggle locale={locale} />
            <Link href="/connexion" className="hidden font-condensed text-sm uppercase tracking-widest text-white/80 underline sm:inline">
              {fr ? "Connexion" : "Log in"}
            </Link>
          </div>
        </header>

        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-5 pb-24 pt-10">
          <p className="font-condensed text-sm font-bold uppercase tracking-[0.4em] text-rof-or">{s.kicker}</p>
          <h1 className="mt-5 max-w-4xl font-condensed text-6xl font-bold uppercase leading-[0.9] text-white sm:text-8xl lg:text-9xl">
            Earn the
            <br />
            <span className="text-rof-or">Crown.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-white/85 sm:text-xl">{s.intro}</p>
          <div className="mt-9 flex flex-wrap gap-4">
            <Link href="/inscription" className={`${bouton} bg-rof-or text-black hover:brightness-110`}>
              {s.creerProfil}
            </Link>
            <a href="#experience" className={`${bouton} border border-white/60 text-white hover:bg-white hover:text-black`}>
              {s.decouvrir}
            </a>
          </div>
        </div>

        <a href="#chiffres" aria-label="Scroll" className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce text-3xl text-white/70">
          ↓
        </a>
      </section>

      {/* ───────── CHIFFRES ───────── */}
      <section id="chiffres" className="border-y border-rof-ligne bg-rof-blanc">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-5 py-12 text-center sm:grid-cols-3">
          {s.statsHero.map(([n, l]) => (
            <div key={l}>
              <dt className="font-condensed text-6xl font-bold leading-none text-rof-or sm:text-7xl">{n}</dt>
              <dd className="mx-auto mt-2 max-w-[12rem] text-xs uppercase tracking-widest text-rof-gris">{l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────── L'EXPÉRIENCE ───────── */}
      <section id="experience" className="mx-auto max-w-7xl scroll-mt-4 px-5 py-24">
        <h2 className="max-w-3xl font-condensed text-5xl font-bold uppercase leading-none sm:text-7xl">
          {s.approcheTitre}
        </h2>
        <p className="mt-5 max-w-2xl text-lg text-rof-gris">{s.approcheIntro}</p>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {s.piliers.map((p, i) => (
            <article key={p.t} className="relative overflow-hidden rounded-3xl border border-rof-ligne bg-rof-blanc p-8">
              <span className="absolute -right-3 -top-6 font-condensed text-[9rem] font-bold leading-none text-white/[0.04]" aria-hidden>
                {i + 1}
              </span>
              <p className="text-5xl" aria-hidden>
                {p.ic}
              </p>
              <h3 className="mt-5 font-condensed text-2xl font-bold uppercase text-rof-or">{p.t}</h3>
              <p className="mt-3 leading-relaxed text-rof-texte/90">{p.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ───────── GALERIE ───────── */}
      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:grid-rows-[repeat(3,280px)]">
          <Photo src="/photos/trio-sourire.jpg" alt="" legende={legendes.fieres} className="col-span-2 aspect-[5/4] lg:row-span-2 lg:aspect-auto" position="50% 30%" />
          <Photo src="/photos/receveuse.jpg" alt="" legende={legendes.focus} className="aspect-[3/4] lg:row-span-2 lg:aspect-auto" position="50% 40%" />
          <Photo src="/photos/canada.jpg" alt="" legende={legendes.canada} className="aspect-[3/4] lg:row-span-2 lg:aspect-auto" position="50% 30%" />
          <Photo src="/photos/celebration.jpg" alt="" legende={legendes.unies} className="col-span-2 aspect-[3/2] lg:aspect-auto" position="50% 45%" />
          <Photo src="/photos/trio-fun.jpg" alt="" legende={legendes.fun} className="col-span-2 aspect-[3/2] lg:aspect-auto" position="50% 35%" />
        </div>
      </section>

      {/* ───────── EN IMAGES (bandes animées) ───────── */}
      <section className="overflow-hidden pb-24" aria-label={fr ? "En images" : "In pictures"}>
        <style>{`
          @keyframes defile { from { transform: translateX(0); } to { transform: translateX(-50%); } }
          .bande-piste { animation: defile 80s linear infinite; }
          .bande-inverse { animation-direction: reverse; animation-duration: 95s; }
          .bande:hover .bande-piste { animation-play-state: paused; }
          @media (prefers-reduced-motion: reduce) { .bande-piste { animation: none; } .bande { overflow-x: auto; } }
        `}</style>
        <h2 className="mx-auto max-w-7xl px-5 font-condensed text-4xl font-bold uppercase leading-none sm:text-6xl">{fr ? "En images" : "In pictures"}</h2>
        <div className="mt-8 flex flex-col gap-3">
          {[galerie.slice(0, 6), galerie.slice(6)].map((rangee, r) => (
            <div key={r} className="bande overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className={`bande-piste flex w-max gap-3 ${r === 1 ? "bande-inverse" : ""}`}>
                {[0, 1].map((copie) =>
                  rangee.map(([src, w, h]) => (
                    <div
                      key={`${copie}-${src}`}
                      aria-hidden={copie === 1}
                      className="relative h-44 shrink-0 overflow-hidden rounded-xl bg-rof-blanc sm:h-56"
                      style={{ aspectRatio: String(Math.max(w / h, 0.75)) }}
                    >
                      <Image src={src} alt="" fill sizes="280px" loading="eager" className="object-cover" />
                    </div>
                  )),
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── CENTRE D'ENTRAÎNEMENT PRIVÉ ───────── */}
      <section className="relative isolate overflow-hidden">
        <Image src="/photos/centre-entrainement.webp" alt="" fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: "50% 60%" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/65 to-black/10" />
        <div className="mx-auto flex min-h-[28rem] max-w-7xl items-center px-5 py-20">
          <div className="max-w-xl">
            <p className="font-condensed text-sm font-bold uppercase tracking-[0.35em] text-rof-or">Royal On Field</p>
            <h2 className="mt-3 font-condensed text-5xl font-bold uppercase leading-none text-white sm:text-7xl">{centre.titre}</h2>
            <p className="mt-5 text-lg text-white/85">{centre.texte}</p>
          </div>
        </div>
      </section>

      {/* ───────── PALMARÈS ───────── */}
      <section className="border-y border-rof-ligne bg-gradient-to-b from-rof-royal-sombre/40 to-rof-noir">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <h2 className="font-condensed text-5xl font-bold uppercase leading-none sm:text-7xl">{s.resultatsTitre}</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {s.palmares.map((a) => (
              <article key={a.annee} className="rounded-3xl border border-rof-ligne bg-rof-noir/80 p-8">
                <p className="font-condensed text-7xl font-bold leading-none text-rof-or">{a.annee}</p>
                <ul className="mt-5 flex flex-col gap-3">
                  {a.faits.map((f) => (
                    <li key={f.texte} className={`flex gap-3 ${f.titre ? "font-semibold text-white" : "text-rof-texte/90"}`}>
                      <span aria-hidden>{f.titre ? "🏆" : "🥎"}</span>
                      <span>{f.texte}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── PROGRAMME SCOLAIRE (pleine largeur) ───────── */}
      <section className="border-t border-rof-ligne">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <h2 className="font-condensed text-5xl font-bold uppercase leading-none sm:text-7xl">{s.scolaireTitre}</h2>
          <p className="mt-4 max-w-3xl text-lg text-rof-gris">{s.scolaireIntro}</p>
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {s.scolaire.map((e) => (
              <li key={e.n} className="rounded-3xl border border-rof-ligne bg-rof-blanc p-8">
                <p className="font-condensed text-xs uppercase tracking-[0.25em] text-rof-poudre">{e.t}</p>
                <p className="mt-2 font-condensed text-3xl font-bold uppercase text-rof-or">{e.n}</p>
                <p className="mt-2 text-rof-texte/90">{e.d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── PLACEMENT & RECRUTEMENT (pleine largeur) ───────── */}
      <section className="border-t border-rof-ligne bg-gradient-to-b from-rof-royal-sombre/30 to-transparent">
        <div className="mx-auto max-w-7xl px-5 py-24">
          <h2 className="font-condensed text-5xl font-bold uppercase leading-none sm:text-7xl">{s.recrutementTitre}</h2>
          <p className="mt-4 max-w-3xl text-lg text-rof-gris">{s.recrutementIntro}</p>
          <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {s.placement.map((p) => (
              <li key={p} className="flex gap-3 rounded-2xl border border-rof-ligne bg-rof-noir/70 p-5 text-rof-texte">
                <span className="text-rof-or" aria-hidden>
                  ★
                </span>
                {p}
              </li>
            ))}
          </ul>
          <p className="mt-10 font-condensed text-5xl font-bold uppercase text-rof-or">{s.builtRoyal}</p>
        </div>
      </section>

      {/* ───────── COMMITTED ───────── */}
      <section className="mx-auto max-w-7xl px-5 py-24">
        <h2 className="font-condensed text-5xl font-bold uppercase leading-none sm:text-7xl">
          <span className="text-rof-or">Committed.</span> {committed.titre}
        </h2>
        <p className="mt-4 max-w-2xl text-lg text-rof-gris">{committed.sous}</p>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {engagees.map((e) => (
            <figure key={e.src} className="group overflow-hidden rounded-3xl border border-rof-ligne bg-rof-blanc">
              <div className="relative aspect-[4/5]">
                <Image
                  src={e.src}
                  alt={[e.nom, e.ecole].filter(Boolean).join(" · ")}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              </div>
              <figcaption className="px-5 py-4">
                {e.nom && <p className="font-condensed text-2xl font-bold uppercase text-white">{e.nom}</p>}
                <p className={e.nom ? "text-sm text-rof-gris" : "font-condensed text-2xl font-bold uppercase text-white"}>{e.ecole}</p>
                <p className="text-xs uppercase tracking-widest text-rof-or">{e.detail}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ───────── APPEL FINAL ───────── */}
      <section className="relative isolate overflow-hidden">
        <Image src="/photos/celebration.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" style={{ objectPosition: "50% 40%" }} />
        <div className="absolute inset-0 -z-10 bg-black/70" />
        <div className="mx-auto max-w-3xl px-5 py-28 text-center">
          <h2 className="font-condensed text-5xl font-bold uppercase leading-none text-white sm:text-7xl">{s.admissionTitre}</h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-white/85" dangerouslySetInnerHTML={{ __html: s.admissionIntro }} />
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/inscription" className={`${bouton} bg-rof-or text-black hover:brightness-110`}>
              {s.creerProfil}
            </Link>
            <Link href="/parcours" className={`${bouton} border border-white/60 text-white hover:bg-white hover:text-black`}>
              {t.connexion.parcours}
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/70">
            {fr ? "Déjà membre ?" : "Already a member?"}{" "}
            <Link href="/connexion" className="underline">
              {fr ? "Se connecter" : "Log in"}
            </Link>
          </p>
        </div>
      </section>

      {/* ───────── NOS PARTENAIRES (discret, en bas de page) ───────── */}
      <section className="border-t border-rof-ligne px-5 py-8">
        <p className="text-center font-condensed text-xs uppercase tracking-[0.35em] text-rof-gris">{fr ? "Nos partenaires" : "Our partners"}</p>
        <ul className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-3">
          {partenaires.map((p) => (
            <li key={p.nom} title={p.nom} className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-white p-1.5 opacity-60 grayscale transition hover:opacity-100 hover:grayscale-0">
              <div className="relative h-full w-full" style={{ transform: `scale(${p.zoom})` }}>
                <Image src={p.src} alt={p.nom} fill sizes="56px" className="object-contain" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <footer className="border-t border-rof-ligne px-5 py-10 text-center">
        <Image src="/logo-r.png" alt="Royal On Field" width={56} height={56} className="mx-auto" />
        <p className="mt-3 font-condensed text-sm uppercase tracking-[0.3em] text-rof-or">{s.footerTags}</p>
        <p className="mt-2 text-xs text-rof-gris">{s.footerLigne}</p>
        <p className="mt-1 text-xs text-rof-gris">royal@lentrepotdubaseball.com</p>
      </footer>
    </main>
  );
}
