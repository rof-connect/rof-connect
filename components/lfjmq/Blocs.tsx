import type { Division, Resume } from "@/lib/lfjmq";

export const jour = (iso: string) => new Date(iso + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });

export function Classement({ divisions, limite }: { divisions: Division[]; limite?: number }) {
  return (
    <>
      {divisions.map((div) => (
        <div className="lf-division" key={div.nom}>
          {divisions.length > 1 && <h3>{div.nom}</h3>}
          <div className="lf-defile">
            <table className="lf-table">
              <caption className="lf-sr">Classement {div.nom}</caption>
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
                {(limite ? div.lignes.slice(0, limite) : div.lignes).map((l, i) => (
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
    </>
  );
}

export function ListeResumes({ resumes }: { resumes: Resume[] }) {
  return (
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
  );
}
