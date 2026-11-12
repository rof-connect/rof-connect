"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Onglet = {
  href: string;
  label: string;
  icone: keyof typeof ICONES;
  actifSi: (p: string) => boolean;
};

const ICONES = {
  accueil: "M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  agenda: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4",
  equipe: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a2.5 2.5 0 1 0 0-5M16 14a5 5 0 0 1 5 6",
  messages: "M4 5h16v11H9l-5 4z",
  moi: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0",
  direction: "M4 20V10M10 20V4M16 20v-7M22 20H2",
};

const commence = (p: string, ...prefixes: string[]) => prefixes.some((x) => p === x || p.startsWith(x + "/"));

export function BarreOnglets({
  labels,
  estAdmin,
}: {
  labels: { accueil: string; agenda: string; equipe: string; messages: string; moi: string; direction: string };
  estAdmin: boolean;
}) {
  const pathname = usePathname() ?? "/membres";

  // Pour la Direction, l'accueil est la page de direction.
  const onglets: Onglet[] = [
    estAdmin
      ? { href: "/membres/admin", label: labels.direction, icone: "direction", actifSi: (p) => commence(p, "/membres/admin") }
      : { href: "/membres", label: labels.accueil, icone: "accueil", actifSi: (p) => p === "/membres" },
    { href: "/membres/agenda", label: labels.agenda, icone: "agenda", actifSi: (p) => commence(p, "/membres/agenda") },
    { href: "/membres/equipe", label: labels.equipe, icone: "equipe", actifSi: (p) => commence(p, "/membres/equipe", "/membres/gc") },
    { href: "/membres/messages", label: labels.messages, icone: "messages", actifSi: (p) => commence(p, "/membres/messages") },
    {
      href: "/membres/moi",
      label: labels.moi,
      icone: "moi",
      actifSi: (p) => commence(p, "/membres/moi", "/membres/parcours", "/membres/documents", "/membres/sondages", "/membres/contact"),
    },
  ];

  return (
    <nav
      aria-label="Navigation principale"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-rof-ligne bg-rof-marine/95 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-3xl justify-around">
        {onglets.map((o) => {
          const actif = o.actifSi(pathname);
          return (
            <li key={o.href} className="flex-1">
              <Link
                href={o.href}
                aria-current={actif ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-2.5 font-condensed text-[11px] font-semibold uppercase tracking-wide ${
                  actif ? "text-rof-poudre" : "text-rof-gris"
                }`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={ICONES[o.icone]} />
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
