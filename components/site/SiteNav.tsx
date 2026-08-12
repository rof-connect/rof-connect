"use client";

import { useState } from "react";
import Link from "next/link";
import { LogoR } from "@/components/LogoR";
import { LIENS_NAV } from "@/lib/site-data";

export function SiteNav() {
  const [menu, setMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-rof-ligne bg-rof-noir/92 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <a href="#haut" className="flex items-center gap-2">
          <LogoR h={34} />
          <span className="font-condensed text-xl font-bold uppercase tracking-[0.04em] text-white">
            Royal <span className="text-rof-or">On Field</span>
          </span>
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {LIENS_NAV.map(([id, l]) => (
            <a key={id} href={`#${id}`} className="font-condensed text-sm font-semibold uppercase tracking-wide text-rof-gris">
              {l}
            </a>
          ))}
          <Link
            href="/connexion"
            className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-[0.08em] text-rof-noir"
          >
            Espace membres
          </Link>
        </nav>
        <button onClick={() => setMenu(!menu)} className="text-2xl text-rof-or md:hidden" aria-label="Menu">
          ☰
        </button>
      </div>
      {menu && (
        <div className="border-t border-rof-ligne bg-rof-noir px-5 py-3 md:hidden">
          {LIENS_NAV.map(([id, l]) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={() => setMenu(false)}
              className="block w-full py-2 text-left text-base font-semibold uppercase text-rof-texte"
            >
              {l}
            </a>
          ))}
          <Link
            href="/connexion"
            className="mt-2 block w-full rounded-lg bg-rof-or py-2.5 text-center font-condensed text-base font-bold uppercase tracking-[0.08em] text-rof-noir"
          >
            Espace membres
          </Link>
        </div>
      )}
    </header>
  );
}
