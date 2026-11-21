"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { D, adresseAutreLangueDepuis } from "@/lib/lfjmq-i18n";
import type { Lang } from "@/lib/lfjmq-saison";

/** Bouton FR / EN : mène à la même page dans l'autre langue. */
export function Langue({ lang }: { lang: Lang }) {
  const pathname = usePathname() ?? "/lfjmq";
  const t = D[lang].nav;
  return (
    <Link className="langue" href={adresseAutreLangueDepuis(pathname, lang)} hrefLang={lang === "fr" ? "en" : "fr"} lang={lang === "fr" ? "en" : "fr"} aria-label={t.langueLabel}>
      {t.langue}
    </Link>
  );
}
