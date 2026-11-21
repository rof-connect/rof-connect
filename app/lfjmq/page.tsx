import Image from "next/image";
import Link from "next/link";
import { CHIFFRES, CLASSEMENT_D1 } from "@/lib/lfjmq-saison";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { href: "/lfjmq/equipes", titre: "Équipes", texte: "Les cinq équipes de la Division 1 et leurs meneuses" },
  { href: "/lfjmq/meneuses", titre: "Meneuses", texte: "Au bâton et au monticule, saison 2026" },
  { href: "/lfjmq/finale", titre: "La finale", texte: "Golden Crown 4, Force 0 : le résumé et la photo" },
  { href: "/lfjmq/divisions", titre: "Divisions", texte: "Division 1, Division 2 (15U) et Division 3 (13U)" },
  { href: "/lfjmq/inscription", titre: "Inscrire une équipe", texte: "Saison 2027 : forfaits à partir de 99 $" },
];

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
              <Link className="btn gold" href="/lfjmq/finale">
                Résumé de la finale
              </Link>
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

      <section className="band explorer" aria-labelledby="t-explorer">
        <div className="wrap">
          <div className="head">
            <h2 id="t-explorer">Explorer la ligue</h2>
          </div>
          <ul className="exp">
            {SECTIONS.map((s) => (
              <li key={s.href}>
                <Link href={s.href}>
                  <b>{s.titre}</b>
                  <span>{s.texte}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
