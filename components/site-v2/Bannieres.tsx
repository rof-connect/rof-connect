import Image from "next/image";
import { BandeBannieres } from "./BandeBannieres";
import type { Banniere } from "@/lib/site-v2/donnees";

/**
 * Bannières de championnat, façon bannières suspendues dans un aréna.
 * Trois styles : « canam » (noir et or, liseré orange), « canada » (blanc, liseré orange, bleu marine) et « provincial » (bleu royal).
 * Dessin propre au site : l'emblème est le logo Royal On Field, pas celui des ligues.
 */
/** Logos affichés sur les bannières (fournis par le club). */
const LOGOS: Record<string, { src: string; alt: string }> = {
  ll: { src: "/partenaires/b-ll.png", alt: "Little League" },
  tc: { src: "/partenaires/b-tc.png", alt: "Triple Crown Fastpitch" },
  fpn: { src: "/partenaires/b-fpn.png", alt: "Fastpitch Nation Park" },
  homerun: { src: "/partenaires/b-homerun.png", alt: "Homerun Softball & Baseball" },
  nsa: { src: "/partenaires/b-nsa.png", alt: "NSA Softball" },
  pbr: { src: "/partenaires/b-pbr.png", alt: "PBR Baseball" },
  otw: { src: "/partenaires/b-otw.png", alt: "Ottawa West" },
};

/** Drapeau du Canada (dessin simple, feuille d'érable à 11 pointes). */
function DrapeauCanada() {
  return (
    <svg className="b-drapeau" viewBox="0 0 400 200" role="img" aria-label="Canada">
      <rect width="400" height="200" fill="#fff" />
      <rect width="100" height="200" fill="#D52B1E" />
      <rect x="300" width="100" height="200" fill="#D52B1E" />
      <polygon
        fill="#D52B1E"
        transform="translate(200 102) scale(1.85)"
        points="0,-50 9,-35 19,-39 15,-15 27,-22 29,-14 46,-10 41,0 45,5 23,17 26,25 5,21 5,48 -5,48 -5,21 -26,25 -23,17 -45,5 -41,0 -46,-10 -29,-14 -27,-22 -15,-15 -19,-39 -9,-35"
      />
    </svg>
  );
}

export function Bannieres({ items, titre, bande = false }: { items: Banniere[]; titre: string; bande?: boolean }) {
  if (!items.length) return null;
  const liste = (
    <div className={bande ? "bannieres bannieres-bande" : "bannieres"} role="list" aria-label={titre}>
      {items.map((b) => (
        <figure className={`banniere banniere-${b.style}`} role="listitem" key={`${b.titre}-${b.annee}-${b.categorie}`}>
          <span className="tringle" aria-hidden />
          <div className="toile">
            <p className={`b-titre${b.titre.length > 17 ? " long" : ""}`}>{b.titre}</p>
            {b.sous && <p className="b-sous">{b.sous}</p>}
            <Image className="b-logo" src="/logo-r.png" alt="" width={56} height={56} />
            <p className="b-annee">{b.annee}</p>
            <p className="b-mention">{b.mention}</p>
            <p className="b-cat">{b.categorie}</p>
            {b.embleme && (
              <div className="b-emblemes">
                {b.embleme === "canada" && <DrapeauCanada />}
                {b.embleme !== "canada" && LOGOS[b.embleme] && (
                  <Image className="b-ll" src={LOGOS[b.embleme].src} alt={LOGOS[b.embleme].alt} width={120} height={72} unoptimized />
                )}
              </div>
            )}
          </div>
          <figcaption className="sr">
            {b.titre} {b.sous ?? ""} {b.annee} : {b.mention}, {b.categorie}
          </figcaption>
        </figure>
      ))}
    </div>
  );
  return bande ? <BandeBannieres label={titre}>{liste}</BandeBannieres> : liste;
}
