import Link from "next/link";
import { dictionnaires } from "@/lib/i18n/dictionaries";
import { AFFILIATIONS, EQUIPE_ORGANISATION, type Sport } from "@/lib/site-v2/donnees";

const s = dictionnaires.fr.site;

/** Section « Organisation » : qui nous sommes, notre mission, nos valeurs et comment nous joindre. */
export function Organisation({ sport }: { sport: Sport }) {
  return (
    <section className="block" id="organisation" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div className="head">
          <h2>
            L&apos;organi
            <wbr />
            sation
            <br />
            <em>Royal On Field</em>
          </h2>
          <Link className="more" href="/inscription">Joindre le programme →</Link>
        </div>

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

        {EQUIPE_ORGANISATION.length > 0 && (
          <div className="org-equipe">
            <h3>Direction et personnel</h3>
            <ul>
              {EQUIPE_ORGANISATION.map((m) => (
                <li key={m.nom}>
                  <b>{m.nom}</b>
                  <span>{m.role}</span>
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
          <a className="btn solid" href="mailto:royal@lentrepotdubaseball.com">royal@lentrepotdubaseball.com</a>
        </div>
      </div>
    </section>
  );
}
