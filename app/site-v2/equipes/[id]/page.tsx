import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cadre } from "@/components/site-v2/Cadre";
import { CONTENU } from "@/lib/site-v2/donnees";
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
  const autres = r.total - r.joueuses.length;

  return (
    <Cadre sport={r.sport} provisoire={r.provisoire}>
      <section className="roster-hero">
        <div className="wrap">
          <Link className="retour" href={`/site-v2?sport=${r.sport}#equipes`}>
            ← Toutes les équipes {c.mot.toLowerCase()}
          </Link>
          <div className="kicker">Royal {c.mot} On Field · Saison {r.saison}</div>
          <h1>{r.nom}</h1>
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

          {r.joueuses.length > 0 ? (
            <div className="roster" role="table" aria-label={`Roster ${r.nom}`}>
              <div className="roster-row roster-th" role="row">
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
              {r.joueuses.map((j) => (
                <Link key={j.id} href={j.lien} className="roster-row" role="row">
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
                  <span role="cell" className="c-nom">{j.nom}</span>
                  <span role="cell" className="c-pos">{j.positions.join(" · ") || "—"}</span>
                  <span role="cell" className="c-lf">{[j.lance && j.lance.slice(0, 1).toUpperCase(), j.frappe && j.frappe.slice(0, 1).toUpperCase()].filter(Boolean).join(" / ") || "—"}</span>
                  <span role="cell" className="c-taille">{j.taille || "—"}</span>
                  <span role="cell" className="c-ecole">{j.ecole || "—"}</span>
                  <span role="cell" className="c-ville">{j.ville || "—"}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="empty-clair">
              <h3>Le roster sera publié bientôt.</h3>
              <p>Les {mot}s apparaissent ici lorsqu&apos;elles (ou leurs parents) autorisent leur page publique dans ROF Connect.</p>
            </div>
          )}

          {autres > 0 && r.joueuses.length > 0 && (
            <p className="roster-note">
              {autres} autre{autres > 1 ? "s" : ""} {mot}
              {autres > 1 ? "s" : ""} de l&apos;équipe {autres > 1 ? "n'ont" : "n'a"} pas (encore) activé {autres > 1 ? "leur page" : "sa page"} publique.
            </p>
          )}
          {r.joueuses.length > 0 && <p className="roster-note">L / F : lance (Gauche / Droite) · frappe (Gauche / Droite / Ambidextre). Clique sur une {mot} pour voir sa fiche de recrutement.</p>}
        </div>
      </section>
    </Cadre>
  );
}
