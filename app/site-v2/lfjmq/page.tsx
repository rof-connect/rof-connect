import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cadre } from "@/components/site-v2/Cadre";
import { CalendrierGameChanger } from "@/components/site-v2/CalendrierGameChanger";
import { chargerLfjmq, lfjmqPublie } from "@/lib/lfjmq";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "LFJMQ — Royal On Field Softball",
  description: "La Ligue Fastpitch Junior Majeur du Québec : horaire, classement et résumés des matchs de Royal On Field.",
  robots: lfjmqPublie() && process.env.NODE_ENV === "production" ? undefined : { index: false, follow: false },
};

const jour = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });

export default async function LfjmqPage() {
  if (!lfjmqPublie()) notFound(); // page préparée mais pas encore en ligne
  const d = await chargerLfjmq();
  const resumes = [...d.resumes].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <Cadre sport="softball">
      <section className="roster-hero">
        <div className="wrap">
          <Link className="retour" href="/">
            ← Accueil softball
          </Link>
          <div className="kicker">Ligue Fastpitch Junior Majeur du Québec</div>
          <h1>LFJMQ</h1>
          <p className="lead">Notre ligue : l&apos;horaire des matchs, le classement et les résumés de chaque rencontre de Royal On Field.</p>
          <div className="btns rc-btns">
            <a className="btn solid" href="#horaire">Horaire</a>
            <a className="btn ghost" href="#classement">Classement</a>
            <a className="btn ghost" href="#resumes">Résumés</a>
          </div>
        </div>
      </section>

      <section className="block" id="horaire">
        <div className="wrap">
          <div className="head">
            <h2>
              Horaire <em>des matchs</em>
            </h2>
            {d.lienHoraire && (
              <a className="more" href={d.lienHoraire} target="_blank" rel="noopener noreferrer">
                Voir sur GameChanger →
              </a>
            )}
          </div>
          {d.widgetId ? <CalendrierGameChanger widgetId={d.widgetId} /> : <p className="lf-vide">L&apos;horaire de la saison sera publié ici bientôt.</p>}
        </div>
      </section>

      <section className="block dark" id="classement">
        <div className="wrap">
          <div className="head">
            <h2>
              Le <em>classement</em>
            </h2>
            {d.lienClassement && (
              <a className="more" href={d.lienClassement} target="_blank" rel="noopener noreferrer">
                Classement complet sur GameChanger →
              </a>
            )}
          </div>
          {d.divisions.length === 0 && <p className="lf-vide">Le classement sera publié dès les premiers matchs.</p>}
          {d.divisions.map((div) => (
            <div className="lf-division" key={div.nom}>
              {d.divisions.length > 1 && <h3>{div.nom}</h3>}
              <div className="lf-table-defile">
                <table className="lf-table">
                  <caption className="sr-only">Classement {div.nom}</caption>
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Équipe</th>
                      <th scope="col" title="Parties jouées">PJ</th>
                      <th scope="col" title="Victoires">V</th>
                      <th scope="col" title="Défaites">D</th>
                      <th scope="col" title="Nulles">N</th>
                      <th scope="col" title="Points">PTS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {div.lignes.map((l, i) => (
                      <tr key={l.equipe} className={/royal/i.test(l.equipe) ? "lf-royal" : undefined}>
                        <td>{i + 1}</td>
                        <th scope="row">{l.equipe}</th>
                        <td>{l.j}</td>
                        <td>{l.v}</td>
                        <td>{l.d}</td>
                        <td>{l.n}</td>
                        <td className="lf-pts">{l.pts}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {d.maj && d.divisions.length > 0 && <p className="lf-maj">Classement mis à jour le {jour(d.maj.slice(0, 10))}.</p>}
        </div>
      </section>

      <section className="block" id="resumes">
        <div className="wrap">
          <div className="head">
            <h2>
              Résumés <em>des matchs</em>
            </h2>
          </div>
          {resumes.length === 0 && <p className="lf-vide">Les résumés des matchs seront publiés ici après chaque rencontre.</p>}
          <div className="lf-resumes">
            {resumes.map((r) => (
              <article className="lf-resume" key={r.id}>
                <time dateTime={r.date}>{jour(r.date)}</time>
                <h3>{r.titre}</h3>
                <p>{r.fr}</p>
                {r.lien && (
                  <a href={r.lien} target="_blank" rel="noopener noreferrer">
                    Feuille de match sur GameChanger →
                  </a>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="org-contact">
            <div>
              <h3>Une question sur la ligue?</h3>
              <p>Écris-nous : on te répond avec plaisir.</p>
            </div>
            <Image src="/partenaires/n-lfjmq.png" alt="Logo de la LFJMQ" width={120} height={60} style={{ height: 60, width: "auto", background: "#fff", borderRadius: 6, padding: 8 }} />
            <a className="btn solid" href="mailto:royal@lentrepotdubaseball.com">
              royal@lentrepotdubaseball.com
            </a>
          </div>
        </div>
      </section>
    </Cadre>
  );
}
