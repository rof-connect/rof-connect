import Link from "next/link";
import { dictionnaires } from "@/lib/i18n/dictionaries";
import { AFFILIATIONS, type Sport } from "@/lib/site-v2/donnees";
import { DIRECTION_SITE, type Entraineur } from "@/lib/site-v2/personnel";

const s = dictionnaires.fr.site;

/** Page « Organisation » : qui nous sommes, nos piliers, la direction et les entraîneurs. */
export function Organisation({ sport, entraineurs }: { sport: Sport; entraineurs: Entraineur[] }) {
  return (
    <section className="block" id="organisation" style={{ paddingTop: 56 }}>
      <div className="wrap">
        <div className="org">
          <div className="org-texte">
            <p className="org-lead">
              Un programme de développement qui favorise la pratique du sport et les saines habitudes de vie, dans un environnement
              professionnel : installations professionnelles, entraîneurs compétents et compétition.
            </p>
            <ul className="org-faits">
              <li>
                <b>Repentigny</b>
                <span>Lanaudière, Québec</span>
              </li>
              <li>
                <b>Affiliations</b>
                <span>{AFFILIATIONS[sport].join(" · ")}</span>
              </li>
            </ul>
          </div>

          <div className="org-valeurs">
            <h3>Nos trois piliers</h3>
            {s.piliers.map((p) => (
              <div className="org-valeur" key={p.t}>
                <h4>{p.t}</h4>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="org-equipe">
          <h3>Direction</h3>
          <ul>
            {DIRECTION_SITE.map((m) => (
              <li key={m.nom}>
                <b>{m.nom}</b>
                <span>{m.role}</span>
              </li>
            ))}
          </ul>
        </div>

        {entraineurs.length > 0 && (
          <div className="org-equipe">
            <h3>Entraîneurs</h3>
            <ul>
              {entraineurs.map((m) => (
                <li key={m.nom}>
                  <b>{m.nom}</b>
                  <span>{m.equipes.length ? m.equipes.join(" · ") : "Équipe à venir"}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="org-contact">
          <div>
            <h3>Nous joindre</h3>
            <p>Une question sur le programme, l&apos;inscription ou le parcours vers le collège américain?</p>
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a className="btn solid" href="mailto:royal@lentrepotdubaseball.com">royal@lentrepotdubaseball.com</a>
            <Link className="btn ghost" href="/inscription">Joindre le programme</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
