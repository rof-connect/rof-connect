import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Oswald, Source_Sans_3 } from "next/font/google";
import { BandeResultats } from "@/components/lfjmq/BandeResultats";
import { Langue } from "@/components/lfjmq/Langue";
import { chargerLfjmq } from "@/lib/lfjmq";
import { D, LANGS, MAIL, adresse, estLang } from "@/lib/lfjmq-i18n";
import { CLASSEMENT_D1, OPTIONS_DIVISION } from "@/lib/lfjmq-saison";
import "../lfjmq.css";

// Site de la ligue, indépendant de celui de Royal On Field : titres Oswald (tableau d'affichage), texte Source Sans 3.
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const source = Source_Sans_3({ variable: "--font-source", subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  icons: { icon: "/partenaires/n-lfjmq.png", apple: "/partenaires/n-lfjmq.png" },
};

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export default async function LigueLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!estLang(lang)) notFound();
  const d = D[lang];
  const { widgets } = await chargerLfjmq();

  return (
    <div className={`lf ${oswald.variable} ${source.variable}`} lang={d.htmlLang}>
      <BandeResultats lang={lang} widgets={widgets} />

      <header className="top">
        <div className="wrap">
          <Link className="brand" href={adresse(lang)}>
            <Image src="/partenaires/n-lfjmq.png" alt="" width={48} height={48} priority />
            <span>
              <b>LFJMQ</b>
              <small>{d.marque}</small>
            </span>
          </Link>
          <nav aria-label={d.nav.aria}>
            <Link href={adresse(lang, undefined, "classement")}>{d.nav.classement}</Link>
            <Link href={adresse(lang, "equipes")}>{d.nav.equipes}</Link>
            <Link href={adresse(lang, "meneuses")}>{d.nav.meneuses}</Link>
            <Link href={adresse(lang, "finale")}>{d.nav.finale}</Link>
            <Link href={adresse(lang, "divisions")}>{d.nav.divisions}</Link>
            <Link href={adresse(lang, "inscription")} className="cta">
              {d.nav.inscrire}
              <span className="lg">{d.nav.inscrireSuite}</span>
            </Link>
            <Langue lang={lang} />
          </nav>
        </div>
      </header>

      <main id="contenu">{children}</main>

      <footer className="band">
        <div className="wrap">
          <div>
            <h3>LFJMQ</h3>
            {d.pied.descr}
            <br />
            {d.pied.saison}
          </div>
          <div>
            <h3>{d.pied.equipes}</h3>
            <ul>
              {[...CLASSEMENT_D1].sort((a, b) => a.nom.localeCompare(b.nom, "fr")).map((e) => (
                <li key={e.nom}>{e.nom}</li>
              ))}
            </ul>
            <h3 style={{ marginTop: 18 }}>{d.pied.divisions}</h3>
            <ul>
              {OPTIONS_DIVISION.map((o) => (
                <li key={o.cle}>{o.nom[lang]}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{d.pied.question}</h3>
            <a href={`mailto:${MAIL}`}>{MAIL}</a>
            <br />
            <br />
            <Link href="/">{d.pied.retour}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
