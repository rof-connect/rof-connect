import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getDictionnaire } from "@/lib/i18n/server";
import { EnteteProgramme, ChoixLangue } from "@/components/programme/EnteteProgramme";
import { BarreMobile } from "@/components/programme/BarreMobile";
import {
  IcBalle,
  IcChevron,
  IcCouronne,
  IcCourriel,
  IcDiplome,
  IcEclair,
  IcFacebook,
  IcFleche,
  IcInstagram,
  IcTrophee,
} from "@/components/programme/Icones";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionnaire();
  return {
    title: "Royal On Field | Earn the Crown",
    description: t.site.intro,
    openGraph: { title: "Royal On Field | Earn the Crown", description: t.site.intro, type: "website", images: ["/photos/celebration.jpg"] },
  };
}

// Liens des réseaux sociaux : à renseigner (variables d'environnement). Le lien n'apparaît que s'il est défini.
const INSTAGRAM_URL = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "";
const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL ?? "";

const TITRE = "font-[family-name:var(--font-bebas)] uppercase";
const BTN = "inline-flex min-h-12 items-center justify-center rounded-[6px] px-6 text-[15px] font-bold uppercase tracking-wider transition";
const SECTION = "mx-auto w-full max-w-6xl px-4 py-14 lg:py-20";

/** Titre de section avec filet or de 3 px. */
function Titre({ children, id }: { children: React.ReactNode; id?: string }) {
  return (
    <div>
      <h2 id={id} className={`${TITRE} text-[40px] leading-none text-[#F5F7FA] lg:text-6xl`}>
        {children}
      </h2>
      <span className="mt-3 block h-[3px] w-14 bg-[#D4AF4A]" aria-hidden />
    </div>
  );
}

export default async function ProgrammePage() {
  const { t, locale } = await getDictionnaire();
  const s = t.site;
  const fr = locale !== "en";

  const L = fr
    ? {
        liens: [
          { href: "#experience", label: "L'expérience" },
          { href: "#parcours", label: "Le parcours" },
          { href: "#centre", label: "Le centre" },
          { href: "#palmares", label: "Palmarès" },
          { href: "#committed", label: "Committed" },
        ],
        connexion: "Connexion",
        menu: "Ouvrir le menu",
        fermer: "Fermer le menu",
        accroche: "Baseball et softball au Québec : un développement complet, athlétique, scolaire et humain.",
        stats: ["Séries mondiales LL", "Titres canadiens", "Athlètes signées"],
        images: "En images",
        parcoursTitre: "Le parcours Royal",
        parcoursIntro: "De l'école primaire au collégial américain, un seul continuum école-terrain, sans compromis sur les études.",
        questionnaire: "Questionnaire de parcours NCAA",
        centreTitre: "Centre d'entraînement privé",
        centreTexte:
          "Des cages de frappe avec lanceurs automatiques et une surface dédiée à l'entraînement : un centre privé pour travailler la technique, la répétition et la confiance, au rythme de chaque athlète.",
        committedTitre: "Committed",
        committedSous: "Nos athlètes engagées au niveau collégial américain.",
        ctaSecond: "Questionnaire de parcours NCAA",
        dejaMembre: "Déjà membre ?",
        seConnecter: "Se connecter",
        partenaires: "Nos partenaires",
        obnl: "OBNL · Repentigny",
        barre: "Créer mon profil",
        etapes: [
          { t: "Primaire", n: "PSES — 5e et 6e année", d: s.scolaire[0].d },
          {
            t: "Secondaire 1 à 5",
            n: "Collège L'Assomption",
            d: s.scolaire[1].d,
            plus: `${s.scolaire[2].n} — ${s.scolaire[2].t}`,
          },
          { t: "Placement & recrutement", n: "JV / Varsity", d: s.recrutementIntro, liste: [s.placement[0], s.placement[1], s.placement[3]] },
          { t: "L'après-Royal", n: "Collège américain", d: s.builtRoyal, liste: [s.placement[2], s.placement[4]] },
        ],
      }
    : {
        liens: [
          { href: "#experience", label: "The experience" },
          { href: "#parcours", label: "The pathway" },
          { href: "#centre", label: "The center" },
          { href: "#palmares", label: "Results" },
          { href: "#committed", label: "Committed" },
        ],
        connexion: "Log in",
        menu: "Open menu",
        fermer: "Close menu",
        accroche: "Baseball and softball in Québec: complete development, athletic, academic and personal.",
        stats: ["Little League World Series", "Canadian titles", "Athletes signed"],
        images: "In pictures",
        parcoursTitre: "The Royal pathway",
        parcoursIntro: "From elementary school to American college, one school-and-field continuum, with no compromise on studies.",
        questionnaire: "NCAA pathway questionnaire",
        centreTitre: "Private training center",
        centreTexte:
          "Batting cages with automatic pitching machines and a dedicated training surface: a private center to work on technique, repetition and confidence, at each athlete's pace.",
        committedTitre: "Committed",
        committedSous: "Our athletes committed to the American college level.",
        ctaSecond: "NCAA pathway questionnaire",
        dejaMembre: "Already a member?",
        seConnecter: "Log in",
        partenaires: "Our partners",
        obnl: "Non-profit · Repentigny",
        barre: "Create my profile",
        etapes: [
          { t: "Elementary", n: "PSES — Grades 5 and 6", d: s.scolaire[0].d },
          {
            t: "Secondary 1 to 5",
            n: "Collège L'Assomption",
            d: s.scolaire[1].d,
            plus: `${s.scolaire[2].n} — ${s.scolaire[2].t}`,
          },
          { t: "Placement & recruiting", n: "JV / Varsity", d: s.recrutementIntro, liste: [s.placement[0], s.placement[1], s.placement[3]] },
          { t: "After Royal", n: "American college", d: s.builtRoyal, liste: [s.placement[2], s.placement[4]] },
        ],
      };

  const piliers = [IcEclair, IcDiplome, IcCouronne].map((Ic, i) => ({ Ic, ...s.piliers[i] }));
  const nombres = s.statsHero.map(([n]) => n);

  // 8 photos maximum, chargées au besoin (lazy).
  const galerie = fr
    ? [
        ["/photos/trio-sourire.jpg", "Trois joueuses de Royal On Field posent ensemble devant le décor « Earn the Crown »"],
        ["/photos/receveuse.jpg", "Gros plan sur le regard d'une receveuse sous son casque rouge"],
        ["/photos/canada.jpg", "Une joueuse tient le chandail Canada numéro 8"],
        ["/photos/trio-fun.jpg", "Trois joueuses de Royal On Field s'amusent devant le décor de l'académie"],
        ["/photos/galerie-01.jpg", "Une jeune lanceuse tend une balle de softball vers la caméra"],
        ["/photos/galerie-02.jpg", "Deux joueuses de dos montrent leur chandail Royal, numéros 24 et 42"],
        ["/photos/galerie-05.jpg", "Deux joueuses de Royal On Field font un cœur avec leurs doigts"],
        ["/photos/galerie-10.jpg", "Trois joueuses posent avec leurs gants de softball"],
      ]
    : [
        ["/photos/trio-sourire.jpg", "Three Royal On Field players pose together in front of the “Earn the Crown” backdrop"],
        ["/photos/receveuse.jpg", "Close-up of a catcher's eye behind her red helmet"],
        ["/photos/canada.jpg", "A player holds up a Canada jersey, number 8"],
        ["/photos/trio-fun.jpg", "Three Royal On Field players having fun in front of the academy backdrop"],
        ["/photos/galerie-01.jpg", "A young pitcher holds out a softball toward the camera"],
        ["/photos/galerie-02.jpg", "Two players seen from behind showing their Royal jerseys, numbers 24 and 42"],
        ["/photos/galerie-05.jpg", "Two Royal On Field players make a heart with their fingers"],
        ["/photos/galerie-10.jpg", "Three players pose with their softball gloves"],
      ];

  const engagees = [
    { src: "/photos/committed-maeva-gascon.jpg", alt: "Maeva Gascon, engagée avec North Platte Community College", etiquette: "NJCAA Division 1 · Nebraska · 2026" },
    { src: "/photos/committed-julia-collard.jpg", alt: "Julia Collard, engagée avec Dodge City Community College", etiquette: "NJCAA Division 1 · Kansas · 2027" },
    { src: "/photos/committed-hill-college.webp", alt: "Béatrice Vézina, engagée avec Hill College", etiquette: "NJCAA Division 1 · Texas · 2027" },
  ];
  if (!fr) {
    engagees[0].alt = "Maeva Gascon, committed to North Platte Community College";
    engagees[1].alt = "Julia Collard, committed to Dodge City Community College";
    engagees[2].alt = "Béatrice Vézina, committed to Hill College";
  }

  const partenaires = [
    { src: "/partenaires/little-league.jpg", nom: "Little League", zoom: 1.6 },
    { src: "/partenaires/usa-softball.png", nom: "USA Softball", zoom: 1 },
    { src: "/partenaires/fastpitch-nation.jpg", nom: "Fastpitch Nation", zoom: 1 },
    { src: "/partenaires/entrepot-du-baseball.png", nom: "L'entrepôt du Baseball", zoom: 1 },
    { src: "/partenaires/sebastien-gervais-photo.jpg", nom: "Sébastien Gervais Photo", zoom: 1 },
  ];

  return (
    <main className="bg-[#0B0B0D] text-[#F5F7FA]">
      {/* 1 ───────── EN-TÊTE COLLANT ───────── */}
      <EnteteProgramme locale={locale} liens={L.liens} connexion={L.connexion} menu={L.menu} fermer={L.fermer} />

      {/* 2 ───────── HAUT DE PAGE ───────── */}
      <section className="relative isolate flex h-[620px] flex-col justify-end overflow-hidden lg:h-[720px]">
        <Image
          src="/photos/celebration.jpg"
          alt={fr ? "Les joueuses de Royal On Field, de dos, lèvent les bras ensemble sur le terrain" : "Royal On Field players, seen from behind, raise their arms together on the field"}
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
          style={{ objectPosition: "62% 50%" }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0B0B0D] via-[#0B0B0D]/85 via-45% to-[#0B0B0D]/10" />
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 lg:pb-16">
          <p className="text-[13px] font-bold uppercase tracking-[0.22em] text-[#D4AF4A]">{s.kicker}</p>
          <h1 className={`${TITRE} mt-3 text-[84px] leading-[0.88] text-[#F5F7FA] lg:text-[150px]`}>
            Earn the
            <br />
            <span className="text-[#D4AF4A]">Crown.</span>
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[#F5F7FA]/90 lg:text-lg">{L.accroche}</p>
          <div className="mt-6 flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-5">
            <Link href="/inscription" className={`${BTN} w-full bg-[#D4AF4A] text-[#0B0B0D] hover:brightness-110 sm:w-auto`}>
              {s.creerProfil}
            </Link>
            <a href="#experience" className="inline-flex min-h-11 items-center gap-2 text-[15px] font-medium text-[#F5F7FA] underline-offset-4 hover:underline">
              {s.decouvrir}
              <IcFleche className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 3 ───────── CHIFFRES ───────── */}
      <section aria-label={fr ? "Chiffres clés" : "Key figures"} className="border-y border-[#263247] bg-[#0F1520]">
        <dl className="mx-auto grid max-w-6xl grid-cols-3 divide-x divide-[#263247] px-2 py-8 text-center lg:py-12">
          {[nombres[0], nombres[1], "3"].map((n, i) => (
            <div key={i} className="flex flex-col-reverse px-2">
              <dt className="mt-2 text-[11px] font-medium uppercase leading-tight tracking-wider text-[#A9B4C4] lg:text-sm">{L.stats[i]}</dt>
              <dd className={`${TITRE} text-[44px] leading-none text-[#D4AF4A] lg:text-7xl`}>{n}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 4 ───────── L'EXPÉRIENCE ROYAL ───────── */}
      <section id="experience" className={`${SECTION} scroll-mt-16`}>
        <Titre>{s.approcheTitre}</Titre>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#A9B4C4]">{s.approcheIntro}</p>
        <ul className="mt-8 flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
          {piliers.map(({ Ic, t: titre, d }) => (
            <li key={titre} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] bg-[#1C4BAE] text-white">
                <Ic className="h-6 w-6" />
              </span>
              <div>
                <h3 className="text-lg font-bold text-[#F5F7FA]">{titre}</h3>
                <p className="mt-1 text-[15px] leading-relaxed text-[#A9B4C4]">{d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 5 ───────── EN IMAGES (un seul carrousel) ───────── */}
      <section className="bg-[#0F1520] py-14 lg:py-20" aria-labelledby="titre-images">
        <div className="mx-auto max-w-6xl px-4">
          <Titre id="titre-images">{L.images}</Titre>
        </div>
        <ul
          className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-auto lg:max-w-6xl [&::-webkit-scrollbar]:hidden"
          tabIndex={0}
          aria-label={L.images}
        >
          {galerie.map(([src, alt]) => (
            <li key={src} className="relative aspect-[4/5] w-[72%] shrink-0 snap-center overflow-hidden rounded-[12px] bg-[#0B0B0D] sm:w-[44%] lg:w-[300px]">
              <Image src={src} alt={alt} fill loading="lazy" sizes="(min-width: 1024px) 300px, (min-width: 640px) 44vw, 72vw" className="object-cover" />
            </li>
          ))}
        </ul>
      </section>

      {/* 6 ───────── LE PARCOURS ROYAL ───────── */}
      <section id="parcours" className={`${SECTION} scroll-mt-16`}>
        <Titre>{L.parcoursTitre}</Titre>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#A9B4C4]">{L.parcoursIntro}</p>
        <ol className="relative mt-10 ml-3 border-l-2 border-[#263247] lg:max-w-3xl">
          {L.etapes.map((e, i) => (
            <li key={e.n} className="relative pb-9 pl-8 last:pb-0">
              <span
                aria-hidden
                className="absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#D4AF4A] bg-[#0B0B0D] text-[11px] font-bold text-[#D4AF4A]"
              >
                {i + 1}
              </span>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9CC8EA]">{e.t}</p>
              <h3 className={`${TITRE} mt-1 text-[30px] leading-none text-[#F5F7FA]`}>{e.n}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#A9B4C4]">{e.d}</p>
              {"plus" in e && e.plus && (
                <p className="mt-2 inline-block rounded-[6px] border border-[#263247] px-3 py-1.5 text-sm text-[#F5F7FA]">{e.plus}</p>
              )}
              {"liste" in e && e.liste && (
                <ul className="mt-3 flex flex-col gap-2">
                  {e.liste.map((x) => (
                    <li key={x} className="flex gap-2.5 text-[15px] text-[#F5F7FA]">
                      <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF4A]" />
                      {x}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
        <Link href="/parcours" className={`${BTN} mt-10 w-full border border-[#F5F7FA]/60 text-[#F5F7FA] hover:bg-[#F5F7FA] hover:text-[#0B0B0D] sm:w-auto`}>
          {L.questionnaire}
        </Link>
      </section>

      {/* 7 ───────── CENTRE D'ENTRAÎNEMENT ───────── */}
      <section id="centre" className="scroll-mt-16 bg-[#0F1520]">
        <div className="mx-auto grid max-w-6xl lg:grid-cols-2 lg:items-center lg:gap-12 lg:px-4 lg:py-20">
          <div className="relative aspect-[3/2] w-full overflow-hidden lg:rounded-[12px]">
            <Image
              src="/photos/centre-entrainement.webp"
              alt={fr ? "Cages de frappe avec lanceurs automatiques et plaque sur surface rouge au centre d'entraînement privé" : "Batting cages with automatic pitching machines and a home plate on a red surface at the private training center"}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 560px, 100vw"
              className="object-cover"
              style={{ objectPosition: "50% 60%" }}
            />
          </div>
          <div className="px-4 py-10 lg:px-0 lg:py-0">
            <Titre>{L.centreTitre}</Titre>
            <p className="mt-5 text-base leading-relaxed text-[#A9B4C4]">{L.centreTexte}</p>
          </div>
        </div>
      </section>

      {/* 8 ───────── PALMARÈS (accordéon) ───────── */}
      <section id="palmares" className={`${SECTION} scroll-mt-16`}>
        <Titre>{s.resultatsTitre}</Titre>
        <div className="mt-8 flex flex-col gap-3 lg:max-w-3xl">
          {s.palmares.map((a, i) => (
            <details key={a.annee} open={i === 0} className="group rounded-[6px] border border-[#263247] bg-[#0F1520]">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between px-4 [&::-webkit-details-marker]:hidden">
                <span className={`${TITRE} text-[34px] leading-none text-[#D4AF4A]`}>{a.annee}</span>
                <IcChevron className="h-6 w-6 text-[#A9B4C4] transition-transform group-open:rotate-180" />
              </summary>
              <ul className="flex flex-col gap-3 border-t border-[#263247] px-4 py-4">
                {a.faits.map((f) => (
                  <li key={f.texte} className="flex gap-3">
                    {f.titre ? <IcTrophee className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF4A]" /> : <IcBalle className="mt-0.5 h-5 w-5 shrink-0 text-[#9CC8EA]" />}
                    <span className={f.titre ? "font-semibold text-[#F5F7FA]" : "text-[#A9B4C4]"}>{f.texte}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      {/* 9 ───────── COMMITTED ───────── */}
      <section id="committed" className="scroll-mt-16 bg-[#0F1520] py-14 lg:py-20">
        <div className="mx-auto max-w-6xl px-4">
          <Titre>{L.committedTitre}</Titre>
          <p className="mt-5 max-w-2xl text-base text-[#A9B4C4]">{L.committedSous}</p>
        </div>
        <ul className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] lg:mx-auto lg:grid lg:max-w-6xl lg:grid-cols-3 lg:overflow-visible [&::-webkit-scrollbar]:hidden" tabIndex={0} aria-label={L.committedTitre}>
          {engagees.map((e) => (
            <li key={e.src} className="w-[78%] shrink-0 snap-center sm:w-[46%] lg:w-auto">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[12px] bg-[#0B0B0D]">
                <Image src={e.src} alt={e.alt} fill loading="lazy" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 46vw, 78vw" className="object-cover" />
              </div>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-[#D4AF4A]">{e.etiquette}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* 10 ───────── APPEL À L'ACTION ───────── */}
      <section className="bg-[#1C4BAE]">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center lg:py-20">
          <h2 className={`${TITRE} text-[42px] leading-none text-white lg:text-6xl`}>{s.admissionTitre}</h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/90" dangerouslySetInnerHTML={{ __html: s.admissionIntro }} />
          <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link href="/inscription" className={`${BTN} bg-[#D4AF4A] text-[#0B0B0D] hover:brightness-110`}>
              {s.creerProfil}
            </Link>
            <Link href="/parcours" className={`${BTN} border border-white text-white hover:bg-white hover:text-[#1C4BAE]`}>
              {L.ctaSecond}
            </Link>
          </div>
          <p className="mt-5 text-sm text-white/90">
            {L.dejaMembre}{" "}
            <Link href="/connexion" className="inline-flex min-h-11 items-center px-1 font-semibold underline underline-offset-4">
              {L.seConnecter}
            </Link>
          </p>
        </div>
      </section>

      {/* 11 ───────── PARTENAIRES ───────── */}
      <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="titre-partenaires">
        <h2 id="titre-partenaires" className="text-center text-xs font-bold uppercase tracking-[0.3em] text-[#A9B4C4]">
          {L.partenaires}
        </h2>
        <ul className="mx-auto mt-6 grid max-w-md grid-cols-2 gap-3 lg:max-w-3xl lg:grid-cols-5">
          {partenaires.map((p, i) => (
            <li
              key={p.nom}
              className={`flex h-20 items-center justify-center overflow-hidden rounded-[6px] bg-white p-3 ${i === partenaires.length - 1 && partenaires.length % 2 === 1 ? "col-span-2 lg:col-span-1" : ""}`}
            >
              <div className="relative h-full w-full grayscale" style={{ transform: `scale(${p.zoom})` }}>
                <Image src={p.src} alt={p.nom} fill loading="lazy" sizes="160px" className="object-contain" />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* 12 ───────── PIED DE PAGE ───────── */}
      <footer className="border-t border-[#263247] bg-[#0F1520] px-4 pb-28 pt-10 text-center lg:pb-10">
        <Image src="/logo-r.png" alt="Royal On Field" width={56} height={56} className="mx-auto" />
        <p className={`${TITRE} mt-3 text-2xl tracking-[0.1em] text-[#D4AF4A]`}>#EarnTheCrown</p>
        <p className="mt-1 text-sm text-[#A9B4C4]">{L.obnl}</p>
        <ul className="mt-4 flex flex-wrap items-center justify-center gap-1">
          <li>
            <a href="mailto:royal@lentrepotdubaseball.com" className="inline-flex min-h-11 items-center gap-2 rounded-[6px] px-3 text-sm text-[#F5F7FA] hover:bg-[#0B0B0D]">
              <IcCourriel className="h-5 w-5" />
              royal@lentrepotdubaseball.com
            </a>
          </li>
          {INSTAGRAM_URL && (
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] text-[#F5F7FA] hover:bg-[#0B0B0D]">
                <IcInstagram />
              </a>
            </li>
          )}
          {FACEBOOK_URL && (
            <li>
              <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] text-[#F5F7FA] hover:bg-[#0B0B0D]">
                <IcFacebook />
              </a>
            </li>
          )}
        </ul>
        <ChoixLangue locale={locale} className="mt-3 justify-center" />
      </footer>

      {/* 13 ───────── BARRE FIXE MOBILE ───────── */}
      <BarreMobile label={L.barre} />
    </main>
  );
}
