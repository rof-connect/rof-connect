import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cadre } from "@/components/site-v2/Cadre";
import { CONTENU, engagementDe } from "@/lib/site-v2/donnees";
import { chargerJoueusePublique } from "@/lib/site-v2/roster";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const r = await chargerJoueusePublique((await params).id);
  return { title: r ? `${r.joueuse.nom} — ${r.equipe.nom} · Royal On Field` : "Joueuse — Royal On Field" };
}

export default async function ProfilJoueuse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await chargerJoueusePublique(id);
  if (!r) notFound();
  const { joueuse: j, equipe: e } = r;
  const c = CONTENU[e.sport];
  const lf = (v: string) => (v ? v : "—");
  const engagement = engagementDe(j.nom);

  const fiche: [string, string][] = [
    ["Numéro", j.numero],
    ["Position", j.positions.join(" · ")],
    ["Lance", j.lance],
    ["Frappe", j.frappe],
    ["Taille", j.taille],
    ["École", j.ecole],
    ["Ville", j.ville],
  ];

  return (
    <Cadre sport={e.sport} provisoire={e.provisoire}>
      <section className="roster-hero">
        <div className="wrap profil-hero">
          <div className="profil-photo">
            {j.photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={j.photo} alt={`Photo de ${j.nom}`} />
            ) : (
              <span className="initiales" aria-hidden>
                {j.nom
                  .split(/\s+/)
                  .map((m) => m[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            )}
          </div>
          <div>
            <Link className="retour" href={`/site-v2/equipes/${e.id}`}>
              ← Roster {e.nom}
            </Link>
            <div className="kicker">
              Royal {c.mot} On Field · {e.nom} · Saison {e.saison}
            </div>
            <h1>
              {j.numero && <span className="profil-no">#{j.numero}</span>} {j.nom}
            </h1>
            {j.positions.length > 0 && <p className="lead">{j.positions.join(" · ")}</p>}
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 56 }}>
        <div className="wrap">
          <div className="head">
            <h2>
              Fiche
              <br />
              <em>de la joueuse</em>
            </h2>
            <Link className="more" href={`/site-v2/equipes/${e.id}`}>Voir tout le roster →</Link>
          </div>
          <dl className="fiche-joueuse">
            {fiche.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{lf(v)}</dd>
              </div>
            ))}
            <div>
              <dt>Équipe</dt>
              <dd>{e.nom}</dd>
            </div>
          </dl>
          <p className="roster-note">La fiche de recrutement détaillée (mesures, vidéo, calendrier) est publiée par la joueuse dans ROF Connect.</p>
        </div>
      </section>
      {engagement && (
        <section className="block dark" id="commitment">
          <div className="wrap">
            <div className="head">
              <h2>
                Committed.
                <br />
                <em>{engagement.c}</em>
              </h2>
              <span className="pill hl">#EarnTheCrown</span>
            </div>
            <div className="engage-profil">
              {engagement.photo && (
                <div className="engage-photo">
                  <Image src={engagement.photo} alt={`${j.nom}, engagée avec ${engagement.s}`} fill loading="lazy" sizes="(min-width: 800px) 340px, 80vw" />
                </div>
              )}
              <div>
                <div className="sig-inline">SIGNÉE</div>
                <p className="engage-ecole">{engagement.s}</p>
                <p className="engage-meta">{engagement.m}</p>
                <p className="engage-annee">Saison {engagement.c}</p>
              </div>
            </div>
          </div>
        </section>
      )}
    </Cadre>
  );
}
