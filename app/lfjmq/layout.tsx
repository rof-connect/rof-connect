import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Oswald, Source_Sans_3 } from "next/font/google";
import { BandeResultats } from "@/components/lfjmq/BandeResultats";
import { chargerLfjmq } from "@/lib/lfjmq";
import { CLASSEMENT_D1 } from "@/lib/lfjmq-saison";
import "./lfjmq.css";

// Site de la ligue, indépendant de celui de Royal On Field : titres Oswald (tableau d'affichage), texte Source Sans 3.
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const source = Source_Sans_3({ variable: "--font-source", subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });

export const metadata: Metadata = {
  title: { absolute: "LFJMQ | Ligue Fastpitch Junior Majeur du Québec" },
  description: "Classement, équipes, divisions et statistiques de la Ligue Fastpitch Junior Majeur du Québec. Golden Crown, championnes 2026.",
  icons: { icon: "/partenaires/n-lfjmq.png", apple: "/partenaires/n-lfjmq.png" },
};

export default async function LigueLayout({ children }: { children: React.ReactNode }) {
  const { widgets } = await chargerLfjmq();
  return (
    <div className={`lf ${oswald.variable} ${source.variable}`}>
      <BandeResultats widgets={widgets} />

      <header className="top">
        <div className="wrap">
          <Link className="brand" href="/lfjmq">
            <Image src="/partenaires/n-lfjmq.png" alt="" width={48} height={48} priority />
            <span>
              <b>LFJMQ</b>
              <small>Ligue Fastpitch Junior Majeur du Québec</small>
            </span>
          </Link>
          <nav aria-label="Navigation principale">
            <Link href="/lfjmq#classement">Classement</Link>
            <Link href="/lfjmq/equipes">Équipes</Link>
            <Link href="/lfjmq/meneuses">Meneuses</Link>
            <Link href="/lfjmq/finale">Finale</Link>
            <Link href="/lfjmq/divisions">Divisions</Link>
            <Link href="/lfjmq/inscription" className="cta">
              Inscrire<span className="lg"> une équipe</span>
            </Link>
          </nav>
        </div>
      </header>

      <main id="contenu">{children}</main>

      <footer className="band">
        <div className="wrap">
          <div>
            <h3>LFJMQ</h3>
            Ligue Fastpitch Junior Majeur du Québec
            <br />
            Saison 2026 : Golden Crown, championnes
          </div>
          <div>
            <h3>Équipes · Division 1</h3>
            <ul>
              {[...CLASSEMENT_D1].sort((a, b) => a.nom.localeCompare(b.nom, "fr")).map((e) => (
                <li key={e.nom}>{e.nom}</li>
              ))}
            </ul>
            <h3 style={{ marginTop: 18 }}>Divisions</h3>
            <ul>
              <li>Division 1</li>
              <li>Division 2 · 15U</li>
              <li>Division 3 · 13U</li>
            </ul>
          </div>
          <div>
            <h3>Une question?</h3>
            <a href="mailto:royal@lentrepotdubaseball.com">royal@lentrepotdubaseball.com</a>
            <br />
            <br />
            <Link href="/">Royal On Field Softball</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
