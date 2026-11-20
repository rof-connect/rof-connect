import type { Metadata } from "next";
import { Bebas_Neue, Barlow } from "next/font/google";
import "./site-v2.css";

// Titres : Bebas Neue. Texte courant : Barlow (400 et 500). Chargées seulement pour le site public.
const barlow = Barlow({ variable: "--font-barlow", subsets: ["latin"], weight: ["400", "500"], display: "swap" });
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400", display: "swap" });

export const metadata: Metadata = {
  title: { absolute: "Royal On Field — Softball élite au Québec" },
  description: "Programme élite de baseball et softball du Québec. Équipes, calendrier, recrutement et engagements universitaires.",
};

export default function SiteV2Layout({ children }: { children: React.ReactNode }) {
  return <div className={`${bebas.variable} ${barlow.variable}`}>{children}</div>;
}
