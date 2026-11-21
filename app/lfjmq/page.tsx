import Image from "next/image";
import {
  CHIFFRES,
  CLASSEMENT_D1,
  DIVISIONS,
  EQUIPES_D1,
  LIGNES_FINALE,
  MENEUSES_ATTAQUE,
  MENEUSES_MONTICULE,
  type Meneuses,
} from "@/lib/lfjmq-saison";

export const dynamic = "force-dynamic";

function Bouclier({ sigle, champ }: { sigle: string; champ?: boolean }) {
  return (
    <svg viewBox="0 0 52 60" aria-hidden="true">
      <path d="M26 2 L49 9 V30 C49 44 39 53 26 58 C13 53 3 44 3 30 V9 Z" fill={champ ? "#f3d110" : "#11309f"} stroke="#c8102e" strokeWidth="2.5" />
      <text x="26" y="36" textAnchor="middle" fontFamily="Oswald, Impact, sans-serif" fontWeight="700" fontSize="18" fill={champ ? "#14193a" : "#fff"}>
        {sigle}
      </text>
    </svg>
  );
}

function Liste({ m }: { m: Meneuses }) {
  return (
    <div className="ldr">
      <h3>
        {m.titre}
        {m.sous && <small>{m.sous}</small>}
      </h3>
      <ol>
        {m.lignes.map(([nom, equipe, valeur]) => (
          <li key={nom + valeur}>
            <span className="n">{nom}</span>
            <span className="t">{equipe}</span>
            <span className="v">{valeur}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function AccueilLigue() {
  return (
    <>
      <section className="hero">
        <div className="wrap">
          <figure>
            <Image src="/lfjmq/championnes.jpg" alt="Les joueuses de Golden Crown posent avec la bannière Championnes LFJMQ 2026" fill priority sizes="(min-width: 820px) 55vw, 100vw" />
          </figure>
          <div className="txt">
            <span className="tag">Saison 2026 · Division 1</span>
            <h1>Golden Crown, championnes 2026</h1>
            <p>Blanchissage en finale : Beatrice Vezina et Arielle Prescott ont limité Force à trois coups sûrs.</p>
            <div className="score" role="group" aria-label="Pointage de la finale">
              <table>
                <tbody>
                  <tr>
                    <th>Finale</th>
                    <th>P</th>
                    <th>CS</th>
                    <th>E</th>
                  </tr>
                  <tr className="win">
                    <td>Golden Crown</td>
                    <td>4</td>
                    <td>9</td>
                    <td>0</td>
                  </tr>
                  <tr>
                    <td>Force</td>
                    <td>0</td>
                    <td>3</td>
                    <td>0</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="btns">
              <a className="btn gold" href="#finale">
                Résumé de la finale
              </a>
              <a className="btn line" href="#classement">
                Classement final
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="nums" aria-label="Saison 2026 en chiffres">
        <div className="wrap">
          {CHIFFRES.map(([n, texte]) => (
            <div key={texte}>
              <b>{n}</b>
              <span>{texte}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="band" id="classement">
        <div className="wrap">
          <div className="head">
            <h2>Classement 2026</h2>
            <small>Saison régulière · Division 1</small>
          </div>
          <table className="std">
            <thead>
              <tr>
                <th>#</th>
                <th>Équipe</th>
                <th>V</th>
                <th>D</th>
                <th>N</th>
                <th>PCT</th>
                <th>Écart</th>
                <th className="hide">Points marqués</th>
              </tr>
            </thead>
            <tbody>
              {CLASSEMENT_D1.map((t, i) => (
                <tr key={t.nom} className={t.champ ? "champ" : undefined}>
                  <td>{i + 1}</td>
                  <td>{t.nom}</td>
                  <td>{t.v}</td>
                  <td>{t.d}</td>
                  <td>{t.n}</td>
                  <td className="pct">
                    {t.pct}
                    <span className="bar">
                      <i style={{ width: `${parseFloat(t.pct) * 100}%` }} />
                    </span>
                  </td>
                  <td>{t.ecart}</td>
                  <td className="hide">{t.pm}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note">V : victoires · D : défaites · N : matchs nuls · PCT : pourcentage de victoires. Source : GameChanger.</p>
        </div>
      </section>

      <section className="band" id="equipes">
        <div className="wrap">
          <div className="head">
            <h2>Équipes</h2>
            <small>Division 1 · fiche 2026</small>
          </div>
          <div className="tgrid">
            {EQUIPES_D1.map((t) => (
              <article key={t.nom} className={`tm${t.champ ? " champ" : ""}`}>
                {t.champ && <span className="badge">Championnes 2026</span>}
                <header>
                  <Bouclier sigle={t.sigle} champ={t.champ} />
                  <div>
                    <h3>{t.nom}</h3>
                    <span className="rk">
                      {t.rang}
                      <sup>{t.rang === 1 ? "re" : "e"}</sup> au classement
                    </span>
                  </div>
                </header>
                <div className="rec">
                  <div>
                    <b>
                      {t.v}-{t.d}-{t.n}
                    </b>
                    <span>V-D-N</span>
                  </div>
                  <div>
                    <b>{t.pct}</b>
                    <span>PCT</span>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>Points marqués</dt>
                    <dd>{t.pm}</dd>
                  </div>
                  <div>
                    <dt>Au bâton</dt>
                    <dd>
                      {t.bat[0]} · <span style={{ fontWeight: 400 }}>{t.bat[1]}</span>
                    </dd>
                  </div>
                  <div>
                    <dt>Au monticule</dt>
                    <dd>
                      {t.pit[0]} · <span style={{ fontWeight: 400 }}>{t.pit[1]}</span>
                    </dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="band divs" id="divisions">
        <div className="wrap">
          <div className="head">
            <h2>Divisions</h2>
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

      <section className="band final" id="finale">
        <div className="wrap grid">
          <div>
            <div className="head">
              <h2>La finale</h2>
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
            <Image src="/lfjmq/finalistes.jpg" alt="Les joueuses de Golden Crown et de Force réunies autour de la bannière après la finale" width={1400} height={1050} sizes="(min-width: 820px) 50vw, 100vw" loading="lazy" />
            <figcaption>Golden Crown et Force réunies après la finale 2026.</figcaption>
          </figure>
        </div>
      </section>

      <section className="band" id="meneuses">
        <div className="wrap">
          <div className="head">
            <h2>Meneuses 2026</h2>
            <small>Joueuses qualifiées selon GameChanger · saison complète</small>
          </div>
          <div className="split">
            <h3 className="grp">À l&apos;attaque</h3>
            {MENEUSES_ATTAQUE.map((m) => (
              <Liste key={m.titre} m={m} />
            ))}
            <h3 className="grp">Au monticule</h3>
            <div className="callout">
              <b>1,34 · 82 RB · 0,86</b>
              <span>Beatrice Vezina (Golden Crown) termine première de la ligue pour la moyenne de points mérités, les retraits au bâton et le WHIP.</span>
            </div>
            {MENEUSES_MONTICULE.map((m) => (
              <Liste key={m.titre} m={m} />
            ))}
          </div>
        </div>
      </section>

      <section className="band join" id="inscription">
        <div className="wrap grid">
          <div>
            <h2>Inscrire une équipe en 2027</h2>
            <p>
              La LFJMQ entame sa deuxième saison et ouvre la porte à de nouvelles équipes situées à moins de 3 heures de route, au Québec, en Ontario et aux États-Unis. Trois divisions : Division 1, Division 2 (14U) et Division 3 (12U).
            </p>
            <p>Formule payée à la présence : forfaits Événement et Saison, à partir de 99 $.</p>
            <div className="btns">
              <a className="btn gold" href="mailto:royal@lentrepotdubaseball.com?subject=Inscription%20LFJMQ%202027">
                Demander l&apos;information
              </a>
            </div>
            <p className="note" style={{ color: "#b7bfdc" }}>
              royal@lentrepotdubaseball.com
            </p>
            <p className="en" lang="en">
              Teams within a 3-hour drive, in Canada or the U.S., are welcome. Information is available in English.
            </p>
          </div>
          <ul className="cal">
            <li>
              <b>Mai</b>Tournoi de printemps
            </li>
            <li>
              <b>Mai à août</b>Saison régulière
            </li>
            <li>
              <b>Septembre</b>Tournoi de fin de saison et finale
            </li>
          </ul>
        </div>
      </section>
    </>
  );
}
