import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cadre } from "@/components/site-v2/Cadre";
import { CONTENU } from "@/lib/site-v2/donnees";

export const metadata: Metadata = { title: "Royal On Field Varsity/JV — Automne 2027" };

export default function VarsityPage() {
  const v = CONTENU.softball.aVenir;
  if (!v) notFound();

  return (
    <Cadre sport="softball">
      <section className="roster-hero">
        <div className="wrap">
          <Link className="retour" href="/site-v2?sport=softball#equipes">
            ← Toutes les équipes softball
          </Link>
          <div className="kicker">Royal Softball On Field · {v.sous}</div>
          <h1>{v.titre}</h1>
          <span className="team-tags team-tags-hero">
            <span className="team-tag">{v.etiquette}</span>
            <span className="team-tag team-niveau">{v.places}</span>
          </span>
          <p className="lead">{v.intro}</p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 48 }}>
        <div className="wrap">
          <div className="head">
            <h2>
              Tu <em>veux…</em>
            </h2>
            <Link className="more" href="/inscription">Créer mon profil →</Link>
          </div>
          <ul className="envies">
            {v.envies.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>

          <div className="avenir-conclusion">
            <p className="c1">{v.conclusion}</p>
            <p className="c2">{v.signature}</p>
          </div>

          <ul className="avenir-points">
            {v.details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>

          <div className="org-contact">
            <div>
              <h3>{v.places}</h3>
              <p>Écris-nous pour réserver ta place et être informé des prochaines étapes. Plus de détails à venir.</p>
            </div>
            <a className="btn solid" href="mailto:royal@lentrepotdubaseball.com">royal@lentrepotdubaseball.com</a>
          </div>
        </div>
      </section>
    </Cadre>
  );
}
