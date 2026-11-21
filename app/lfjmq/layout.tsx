import type { Metadata } from "next";
import Link from "next/link";
import { Oswald, Source_Sans_3 } from "next/font/google";
import { EnteteLigue } from "@/components/lfjmq/EnteteLigue";
import "./lfjmq.css";

// Site de la ligue, indépendant de celui de Royal On Field : titres Oswald (tableau d'affichage, majuscules compactes), texte Source Sans 3.
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });
const source = Source_Sans_3({ variable: "--font-source", subsets: ["latin"], weight: ["400", "600"], display: "swap" });

export const metadata: Metadata = {
  title: { absolute: "LFJMQ | Ligue Fastpitch Junior Majeur du Québec" },
  description: "Horaire, classement et résumés des matchs de la Ligue Fastpitch Junior Majeur du Québec.",
  icons: { icon: "/partenaires/n-lfjmq.png", apple: "/partenaires/n-lfjmq.png" },
};

export default function LigueLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`lf ${oswald.variable} ${source.variable}`}>
      <EnteteLigue />
      <main id="contenu">{children}</main>
      <footer className="lf-pied">
        <div className="lf-wrap">
          <div>
            <p className="lf-pied-titre">LFJMQ</p>
            <p>Ligue Fastpitch Junior Majeur du Québec</p>
          </div>
          <div>
            <p className="lf-pied-titre">Une question?</p>
            <a href="mailto:royal@lentrepotdubaseball.com">royal@lentrepotdubaseball.com</a>
          </div>
          <div>
            <p className="lf-pied-titre">Équipes de la ligue</p>
            <Link href="/">Royal On Field Softball →</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
