"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { definirLangue } from "@/lib/i18n/actions";
import type { Locale } from "@/lib/i18n/config";
import { IcFermer, IcMenu } from "./Icones";

type Lien = { href: string; label: string };

/** Choix FR / EN avec des zones cliquables d'au moins 44 × 44 px. */
export function ChoixLangue({ locale, className = "" }: { locale: Locale; className?: string }) {
  const [, startTransition] = useTransition();
  const changer = (l: Locale) => {
    if (l !== locale) startTransition(() => void definirLangue(l, "/programme"));
  };
  const b = "inline-flex min-h-11 min-w-11 items-center justify-center rounded-[6px] px-3 text-sm font-bold uppercase tracking-wider";
  return (
    <div className={`flex items-center gap-1 ${className}`} role="group" aria-label="Langue / Language">
      {(["fr", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => changer(l)}
          aria-pressed={locale === l}
          lang={l}
          className={`${b} ${locale === l ? "bg-[#D4AF4A] text-[#0B0B0D]" : "border border-[#263247] text-[#F5F7FA] hover:bg-[#0F1520]"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function EnteteProgramme({
  locale,
  liens,
  connexion,
  menu,
  fermer,
}: {
  locale: Locale;
  liens: Lien[];
  connexion: string;
  menu: string;
  fermer: string;
}) {
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!ouvert) return;
    const fin = (e: KeyboardEvent) => e.key === "Escape" && setOuvert(false);
    window.addEventListener("keydown", fin);
    return () => window.removeEventListener("keydown", fin);
  }, [ouvert]);

  const lienNav = "flex min-h-11 items-center rounded-[6px] px-3 text-[15px] text-[#F5F7FA] hover:bg-[#0F1520]";

  return (
    <header className="sticky top-0 z-50 border-b border-[#263247] bg-[#0B0B0D]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4 lg:h-16">
        <Link href="/programme" className="flex min-h-11 shrink-0 items-center gap-2" aria-label="Royal On Field">
          <Image src="/logo-r.png" alt="" width={34} height={34} priority />
          <span className="whitespace-nowrap font-[family-name:var(--font-bebas)] text-[17px] uppercase tracking-[0.1em] text-[#F5F7FA] sm:text-xl sm:tracking-[0.12em]">Royal On Field</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {liens.map((l) => (
            <a key={l.href} href={l.href} className={lienNav}>
              {l.label}
            </a>
          ))}
          <ChoixLangue locale={locale} className="ml-2" />
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/connexion"
            className="inline-flex min-h-11 items-center rounded-[6px] bg-[#1C4BAE] px-3 text-[13px] sm:px-4 sm:text-sm font-bold uppercase tracking-wider text-white hover:brightness-110"
          >
            {connexion}
          </Link>
          <button
            type="button"
            onClick={() => setOuvert((o) => !o)}
            aria-expanded={ouvert}
            aria-controls="menu-programme"
            aria-label={ouvert ? fermer : menu}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[6px] border border-[#263247] text-[#F5F7FA] lg:hidden"
          >
            {ouvert ? <IcFermer /> : <IcMenu />}
          </button>
        </div>
      </div>

      {ouvert && (
        <div id="menu-programme" className="border-t border-[#263247] bg-[#0B0B0D] px-4 pb-4 pt-2 lg:hidden">
          <nav className="flex flex-col" aria-label="Navigation principale">
            {liens.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOuvert(false)} className={lienNav}>
                {l.label}
              </a>
            ))}
          </nav>
          <ChoixLangue locale={locale} className="mt-3 border-t border-[#263247] pt-3" />
        </div>
      )}
    </header>
  );
}
