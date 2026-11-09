import Link from "next/link";
import { dictionnaires } from "@/lib/i18n/dictionaries";
import { EQUIPE_ORGANISATION } from "@/lib/site-v2/donnees";

const s = dictionnaires.fr.site;

/** Section « Organisation » : qui nous sommes, notre mission, nos valeurs et comment nous joindre. */
export function Organisation() {
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
              Royal On Field est un organisme à but non lucratif de Repentigny, dans Lanaudière. Nous développons des athlètes de baseball et de
              softball, de 10U jusqu&apos;à Varsity, et les accompagnons jusqu&apos;au collège américain.
            </p>
            <p>{s.intro}</p>
            <ul className="org-faits">
              <li>
                <b>OBNL</b>
                <span>Organisme à but non lucratif</span>
              </li>
              <li>
                <b>Repentigny</b>
                <span>Lanaudière, Québec</span>
              </li>
              <li>
                <b>Affiliations</b>
                <span>Little League Canada · Baseball Québec · Softball Québec</span>
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
