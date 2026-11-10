"use client";

import { useRef } from "react";

/** Bande défilante de bannières : on fait glisser (ou on utilise les flèches / le clavier). Rien ne bouge seul. */
export function BandeBannieres({ children, label }: { children: React.ReactNode; label: string }) {
  const piste = useRef<HTMLDivElement>(null);
  const defiler = (sens: 1 | -1) => {
    const p = piste.current;
    if (!p) return;
    p.scrollBy({ left: sens * Math.max(240, p.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="bande-bann">
      <button type="button" className="fleche fleche-g" onClick={() => defiler(-1)} aria-label="Bannières précédentes">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m15 6-6 6 6 6" />
        </svg>
      </button>
      <div className="piste" ref={piste} tabIndex={0} role="region" aria-label={label}>
        {children}
      </div>
      <button type="button" className="fleche fleche-d" onClick={() => defiler(1)} aria-label="Bannières suivantes">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
