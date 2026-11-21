"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const LIENS = [
  { href: "/lfjmq", label: "Accueil" },
  { href: "/lfjmq/horaire", label: "Horaire" },
  { href: "/lfjmq/classement", label: "Classement" },
  { href: "/lfjmq/resumes", label: "Résumés" },
];

function Liens() {
  const pathname = usePathname();
  const demo = useSearchParams().get("demo") === "1" ? "?demo=1" : ""; // aperçu fictif : on le garde d'une page à l'autre
  return (
    <nav aria-label="Navigation de la ligue" className="lf-nav">
      {LIENS.map((l) => (
        <Link key={l.href} href={l.href + demo} aria-current={pathname === l.href ? "page" : undefined}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}

export function EnteteLigue() {
  return (
    <header className="lf-entete">
      <div className="lf-wrap">
        <Link href="/lfjmq" className="lf-marque" aria-label="LFJMQ, accueil">
          <Image src="/partenaires/n-lfjmq.png" alt="" width={56} height={56} priority />
          <span>
            LFJMQ<small>Ligue Fastpitch Junior Majeur du Québec</small>
          </span>
        </Link>
        <Suspense fallback={null}>
          <Liens />
        </Suspense>
      </div>
    </header>
  );
}
