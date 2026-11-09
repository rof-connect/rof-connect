import { Bebas_Neue, DM_Sans } from "next/font/google";

// Polices de la charte ROF, chargées seulement pour la page publique /programme.
const bebas = Bebas_Neue({ variable: "--font-bebas", subsets: ["latin"], weight: "400", display: "swap" });
const dmSans = DM_Sans({ variable: "--font-dm", subsets: ["latin"], display: "swap" });

export default function ProgrammeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${bebas.variable} ${dmSans.variable} font-[family-name:var(--font-dm)]`}>
      {children}
    </div>
  );
}
