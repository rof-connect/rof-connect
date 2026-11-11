"use client";

import { useState } from "react";
import { bouton } from "@/components/ui/boutons";

/** Affiche le lien de la page de présentation avec « Copier » et « Partager ». */
export function LienPartage({ chemin }: { chemin: string }) {
  const [copie, setCopie] = useState(false);
  const url = typeof window === "undefined" ? chemin : window.location.origin + chemin;

  async function copier() {
    try {
      await navigator.clipboard.writeText(url);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      window.prompt("Copie ce lien :", url);
    }
  }

  async function partager() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Ma page de présentation", url });
        return;
      } catch {
        return;
      }
    }
    await copier();
  }

  return (
    <div className="flex flex-col gap-2">
      <input readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-xs text-rof-texte" />
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={copier} className={bouton("primaire", "md")}>
          {copie ? "Lien copié ✓" : "Copier le lien"}
        </button>
        <button type="button" onClick={partager} className={bouton("secondaire")}>
          Partager
        </button>
        <a href={chemin} target="_blank" rel="noopener noreferrer" className={bouton("secondaire")}>
          Voir ma page ↗
        </a>
      </div>
    </div>
  );
}
