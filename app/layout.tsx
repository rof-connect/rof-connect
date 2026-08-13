import type { Metadata } from "next";
import { Inter, Barlow_Condensed, Playfair_Display, Dancing_Script } from "next/font/google";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["800"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancing-script",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://rof-connect.vercel.app";
const TITRE = "ROF Connect — Royal On Field";
const DESCRIPTION =
  "Académie élite de baseball et softball au Québec. Portail public et espace membres de Royal On Field.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITRE, template: "%s · ROF Connect" },
  description: DESCRIPTION,
  applicationName: "ROF Connect",
  openGraph: {
    type: "website",
    locale: "fr_CA",
    siteName: "ROF Connect",
    title: TITRE,
    description: DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITRE,
    description: DESCRIPTION,
  },
};

export const viewport = {
  themeColor: "#05070C",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${barlowCondensed.variable} ${playfair.variable} ${dancingScript.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-rof-noir text-rof-texte">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
