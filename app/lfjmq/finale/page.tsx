import type { Metadata } from "next";
import Image from "next/image";
import { LIGNES_FINALE } from "@/lib/lfjmq-saison";

export const metadata: Metadata = { title: { absolute: "La finale 2026 | LFJMQ" }, description: "Golden Crown blanchit Force 4 à 0 et remporte la finale 2026 de la LFJMQ." };

export default function FinalePage() {
  return (
    <section className="band final">
      <div className="wrap grid">
        <div>
          <div className="head">
            <h1>La finale</h1>
            <small>Golden Crown 4, Force 0</small>
          </div>
          <h3>Golden Crown blanchit Force et soulève la bannière</h3>
          <p className="lead">Les deux meilleures équipes de la saison régulière se sont retrouvées en finale, et c&apos;est le lancer qui a fait la différence.</p>
          <p>
            Rosalie Paquette a donné le ton dès la première manche avec un triple qui a ouvert la marque. Frappeuse de quatrième, elle a terminé avec trois points produits. Virginie Bluteau et Laurence Dupont ont ajouté deux coups sûrs chacune, pour un total de neuf pour Golden Crown.
          </p>
          <p>
            Partante, Beatrice Vezina a lancé six manches sans accorder de point : trois coups sûrs, neuf retraits au bâton et un seul but sur balles. Arielle Prescott a fermé la porte en relève et a obtenu le dernier retrait sur un ballon d&apos;Eve Beaudoin.
          </p>
          <p>
            Kassandra Turmel a tenu Force dans le match pendant six manches et un tiers, avec six retraits au bâton. Adele Dostaler, Gabriela Chacon et Eve Beaudoin ont frappé les trois coups sûrs de Force. Aucune des deux équipes n&apos;a commis d&apos;erreur.
          </p>
          <div className="lines">
            {LIGNES_FINALE.map(([nom, ligne]) => (
              <div key={nom}>
                <b>{nom}</b>
                <span>{ligne}</span>
              </div>
            ))}
          </div>
        </div>
        <figure>
          <Image src="/lfjmq/finalistes.jpg" alt="Les joueuses de Golden Crown et de Force réunies autour de la bannière après la finale" width={1400} height={1050} sizes="(min-width: 820px) 50vw, 100vw" priority />
          <figcaption>Golden Crown et Force réunies après la finale 2026.</figcaption>
        </figure>
      </div>
    </section>
  );
}
