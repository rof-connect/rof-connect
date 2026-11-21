import type { Metadata } from "next";
import { DIVISIONS } from "@/lib/lfjmq-saison";

export const metadata: Metadata = { title: { absolute: "Divisions | LFJMQ" }, description: "Les trois divisions de la LFJMQ : Division 1 (junior majeur), Division 2 (15U) et Division 3 (13U)." };

export default function DivisionsPage() {
  return (
    <section className="band divs">
      <div className="wrap">
        <div className="head">
          <h1>Divisions</h1>
          <small>Trois niveaux de jeu, une seule ligue</small>
        </div>
        <div className="dgrid">
          {DIVISIONS.map((d, i) => (
            <article key={d.cle} className={`dv${i === 0 ? " on" : ""}`}>
              <span className="dn" aria-hidden>
                {i + 1}
              </span>
              <h3>{d.nom}</h3>
              <p className="lv">{d.niveau}</p>
              <ul>
                {d.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <a href={d.lien.href}>{d.lien.texte}</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
