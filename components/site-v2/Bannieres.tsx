import Image from "next/image";
import { BandeBannieres } from "./BandeBannieres";
import type { Banniere } from "@/lib/site-v2/donnees";

/**
 * Bannières de championnat, façon bannières suspendues dans un aréna.
 * Trois styles : « canam » (noir et or, liseré orange), « canada » (blanc, liseré orange, bleu marine) et « provincial » (bleu royal).
 * Dessin propre au site : l'emblème est le logo Royal On Field, pas celui des ligues.
 */
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
