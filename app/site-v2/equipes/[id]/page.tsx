import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cadre } from "@/components/site-v2/Cadre";
import { CalendrierGameChanger } from "@/components/site-v2/CalendrierGameChanger";
import { CONTENU, engagementDe } from "@/lib/site-v2/donnees";
import { chargerRoster } from "@/lib/site-v2/roster";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = await chargerRoster((await params).id);
  return { title: r ? `${r.nom} — ${CONTENU[r.sport].mot} · Royal On Field` : "Équipe — Royal On Field" };
}

export default async function RosterPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ apercu?: string }> }) {
  const { id } = await params;
  const { apercu } = await searchParams;
  const r = await chargerRoster(id, apercu === "1");
  if (!r) notFound();

  const c = CONTENU[r.sport];
  const f = r.sport === "softball";
  const mot = f ? "joueuse" : "joueur";

  return (
    <Cadre sport={r.sport} provisoire={r.provisoire}>
      <section className="roster-hero">
        <div className="wrap">
          <Link className="retour" href={`/site-v2?sport=${r.sport}#equipes`}>
            ← Toutes les équipes {c.mot.toLowerCase()}
          </Link>
          <div className="kicker">Royal {c.mot} On Field · Saison {r.saison}</div>
          <h1>{r.nom}</h1>
          {(r.categorie || r.niveau) && (
            <span className="team-tags team-tags-hero">
              {r.categorie && <span className="team-tag">{r.categorie}</span>}
              {r.niveau && <span className="team-tag team-niveau">{r.niveau}</span>}
            </span>
          )}
          {r.description && <p className="lead">{r.description}</p>}
          <dl className="roster-meta">
            <div>
              <dt>{f ? "Joueuses" : "Joueurs"}</dt>
              <dd>{r.total}</dd>
            </div>
            <div>
              <dt>Saison</dt>
              <dd>{r.saison}</dd>
            </div>
            <div>
              <dt>Sport</dt>
              <dd>{c.mot}</dd>
            </div>
          </dl>
        </div>
      </section>

      {r.afficher && (
      <section className="block" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <div className="head">
            <h2>
              Roster
              <br />
              <em>{r.saison}</em>
            </h2>
            <Link className="more" href="/inscription">Joindre le programme →</Link>
          </div>

          {!r.afficher ? (
            <div className="empty-clair">
              <h3>Le roster n&apos;est pas publié.</h3>
              <p>La liste des {mot}s de cette équipe n&apos;est pas affichée publiquement.</p>
            </div>
          ) : r.joueuses.length > 0 ? (
            <div className="roster" role="table" aria-label={`Roster ${r.nom}`}>
              <div className="roster-row roster-th" role="row">
                <span role="columnheader" className="c-no">N°</span>
                <span role="columnheader" className="c-photo">
                  <span className="sr">Photo</span>
                </span>
                <span role="columnheader">Nom</span>
                <span role="columnheader">Pos.</span>
                <span role="columnheader" className="c-lf">L / F</span>
                <span role="columnheader" className="c-taille">Taille</span>
                <span role="columnheader" className="c-ecole">École</span>
                <span role="columnheader" className="c-ville">Ville</span>
              </div>
              {r.joueuses.map((j) => {
                const contenu = (
                  <>
                    <span role="cell" className="c-no">{j.numero || "—"}</span>
                    <span role="cell" className="c-photo">
                      {j.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={j.photo} alt={`Photo de ${j.nom}`} loading="lazy" />
                      ) : (
                        <span className="initiales" aria-hidden>
                          {j.nom
                            .split(/\s+/)
                            .map((m) => m[0])
                            .slice(0, 2)
                            .join("")}
                        </span>
                      )}
                    </span>
                    <span role="cell" className="c-nom">{j.nom}{engagementDe(j.nom) && <em className="badge-commit">Committed {engagementDe(j.nom)?.c}</em>}</span>
                    <span role="cell" className="c-pos">{j.positions.join(" · ") || "—"}</span>
                    <span role="cell" className="c-lf">{[j.lance && j.lance.slice(0, 1).toUpperCase(), j.frappe && j.frappe.slice(0, 1).toUpperCase()].filter(Boolean).join(" / ") || "—"}</span>
                    <span role="cell" className="c-taille">{j.taille || "—"}</span>
                    <span role="cell" className="c-ecole">{j.ecole || "—"}</span>
                    <span role="cell" className="c-ville">{j.ville || "—"}</span>
                  </>
                );
                return j.lien ? (
                  <Link key={j.id} href={j.lien} className="roster-row" role="row">
                    {contenu}
                  </Link>
                ) : (
                  <div key={j.id} className="roster-row" role="row">
                    {contenu}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-clair">
              <h3>Le roster sera publié bientôt.</h3>
              <p>Les {mot}s de l&apos;équipe apparaîtront ici dès qu&apos;elles auront été acceptées par la Direction.</p>
            </div>
          )}

          {r.afficher && r.joueuses.length > 0 && (
            <p className="roster-note">
              L / F : lance (Gauche / Droite) · frappe (Gauche / Droite / Ambidextre).
              {r.joueuses.some((j) => j.lien) && ` Clique sur une ${mot} pour voir sa fiche de recrutement.`}
            </p>
          )}
        </div>
      </section>
      )}

      {(r.gamechanger || r.gamechangerLien) && (
        <section className="block dark" id="matchs">
          <div className="wrap">
            <div className="head">
              <h2>
                Calendrier
                <br />
                <em>des matchs</em>
              </h2>
              <span className="pill">GameChanger</span>
            </div>
            {r.gamechanger && (
              <div className="gc-boite">
                <CalendrierGameChanger widgetId={r.gamechanger} />
              </div>
            )}
            {r.gamechangerLien && (
              <a className="gc-lien" href={r.gamechangerLien} target="_blank" rel="noopener noreferrer">
                <span>
                  <strong>{r.gamechanger ? "Toute la saison sur GameChanger" : "Calendrier et résultats sur GameChanger"}</strong>
                  <small>Matchs, résultats et statistiques de {r.nom}</small>
                </span>
                <span aria-hidden>→</span>
              </a>
            )}
          </div>
        </section>
      )}
    </Cadre>
  );
}
