import type { Metadata } from "next";
import { Bebas_Neue } from "next/font/google";
import "./site-v2.css";

// Inter est déjà chargée par le layout racine (--font-inter). Bebas Neue : seulement pour cette page.
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: "Royal On Field — Athletics",
  description: "Programme élite de baseball et softball de Lanaudière. Équipes, calendrier, recrutement et engagements universitaires.",
  robots: { index: false, follow: false }, // aperçu : à retirer lors de la mise en ligne
};

export default function SiteV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={bebas.variable}>{children}</div>;
}
