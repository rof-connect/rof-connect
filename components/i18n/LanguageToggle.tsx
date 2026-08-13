"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { definirLangue } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/config";

export function LanguageToggle({ locale, sombre = false }: { locale: Locale; sombre?: boolean }) {
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function changer(nouvelle: Locale) {
    if (nouvelle === locale) return;
    startTransition(() => {
      definirLangue(nouvelle, pathname ?? "/");
    });
  }

  const base = "font-condensed text-xs font-bold uppercase tracking-wide";
  const inactif = sombre ? "text-rof-gris" : "text-rof-gris";
  const actif = "text-rof-or";

  return (
    <div className="flex items-center gap-1">
      <button onClick={() => changer("fr")} className={`${base} ${locale === "fr" ? actif : inactif}`}>
        FR
      </button>
      <span className="text-rof-gris">/</span>
      <button onClick={() => changer("en")} className={`${base} ${locale === "en" ? actif : inactif}`}>
        EN
      </button>
    </div>
  );
}
