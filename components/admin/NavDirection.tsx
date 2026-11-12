"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const ONGLETS: { href: string; label: string; icone: string }[] = [
  { href: "/membres/admin", label: "Accueil", icone: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" },
  { href: "/membres/admin/joueurs", label: "Joueurs", icone: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0" },
  { href: "/membres/admin/equipes", label: "Équipes", icone: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a2.5 2.5 0 1 0 0-5M16 14a5 5 0 0 1 5 6" },
  { href: "/membres/admin/statuts", label: "Statuts", icone: "M4 6h16M4 12h10M4 18h6M17 14l2 2 4-4" },
  { href: "/membres/admin/conversations", label: "Conversations", icone: "M4 5h16v11H9l-5 4zM8 9h8M8 12h5" },
  { href: "/membres/admin/messages", label: "Messages", icone: "M4 5h16v11H9l-5 4z" },
  { href: "/membres/admin/sondages", label: "Sondages", icone: "M5 20V10M12 20V4M19 20v-7" },
  { href: "/membres/admin/parcours", label: "Parcours", icone: "M4 19h16M6 15l4-4 3 3 5-6" },
  { href: "/membres/admin/infolettre", label: "Infolettre", icone: "M3 6h18v12H3zM3 7l9 6 9-6" },
  { href: "/membres/admin/comptes", label: "Comptes", icone: "M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z" },
  { href: "/membres/admin/connexions", label: "Connexions", icone: "M12 7v5l3 3M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" },
];

export function NavDirection() {
  const pathname = usePathname() ?? "/membres/admin";
  const actifRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    actifRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [pathname]);

  const estActif = (href: string) =>
    href === "/membres/admin" ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <nav aria-label="Menu Direction" className="border-b border-rof-ligne bg-rof-noir">
      <ul className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-5 py-2.5 [scrollbar-width:none]">
        {ONGLETS.map((o) => {
          const actif = estActif(o.href);
          return (
            <li key={o.href} className="shrink-0">
              <Link
                ref={actif ? actifRef : undefined}
                href={o.href}
                aria-current={actif ? "page" : undefined}
                className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3.5 py-1.5 font-condensed text-sm font-bold uppercase tracking-wide transition-colors active:scale-[0.97] ${
                  actif ? "bg-rof-or text-black" : "border border-rof-ligne bg-rof-craie text-rof-gris hover:text-rof-texte"
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={o.icone} />
                </svg>
                {o.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
