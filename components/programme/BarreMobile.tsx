"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/** Barre fixe (mobile seulement) : apparaît quand on a dépassé le haut de page. */
export function BarreMobile({ label, apres = 560 }: { label: string; apres?: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const maj = () => setVisible(window.scrollY > apres);
    maj();
    window.addEventListener("scroll", maj, { passive: true });
    return () => window.removeEventListener("scroll", maj);
  }, [apres]);

  return (
    <div
      aria-hidden={!visible}
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-[#263247] bg-[#0B0B0D]/95 px-4 pt-3 backdrop-blur transition-transform duration-300 lg:hidden ${
        visible ? "translate-y-0" : "invisible translate-y-full"
      }`}
      style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
    >
      <Link
        href="/inscription"
        tabIndex={visible ? 0 : -1}
        className="flex min-h-12 w-full items-center justify-center rounded-[6px] bg-[#D4AF4A] text-base font-bold uppercase tracking-wider text-[#0B0B0D]"
      >
        {label}
      </Link>
    </div>
  );
}
