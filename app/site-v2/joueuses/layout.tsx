import type { Metadata } from "next";

/** Les fiches de joueuses ne sont jamais indexées par les moteurs de recherche. */
export const metadata: Metadata = { robots: { index: false, follow: false, nocache: true } };

export default function JoueusesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
