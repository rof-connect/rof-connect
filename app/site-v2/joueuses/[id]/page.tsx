import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Cadre } from "@/components/site-v2/Cadre";
import { CONTENU, engagementDe } from "@/lib/site-v2/donnees";
import { chargerJoueusePublique } from "@/lib/site-v2/roster";
import { chargerFiche } from "@/lib/site-v2/fiche";

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
  const fiche = await chargerFiche(id);
  const dateFr = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
  const c = CONTENU[e.sport];
  const lf = (v: string) => (v ? v : "—");
  const engagement = engagementDe(j.nom);

  const infos: [string, string][] = [
    ["Numéro", j.numero],
    ["Position", j.positions.join(" · ")],
    ["Lance", j.lance],
    ["Frappe", j.frappe],
    ["Âge de la saison", j.statut],
    ["Grad", j.grad],
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
            <p className="profil-puces">
              {j.statut && <span className="team-tag">{j.statut}</span>}
              {j.grad && <span className="team-tag team-niveau">Grad {j.grad}</span>}
            </p>
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
            {infos.map(([k, v]) => (
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
          {j.fieldlevel && (
            <section className="bloc-reco bloc-fl">
              <h3>Profil FieldLevel</h3>
              <div className="reco-fl">
                <iframe
                  src={j.fieldlevel}
                  title={`Profil FieldLevel de ${j.nom}`}
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              </div>
              <a className="btn ghost-clair" href={j.fieldlevel} target="_blank" rel="noopener noreferrer nofollow">
                Ouvrir sur FieldLevel ↗
              </a>
            </section>
          )}

          {!fiche && <p className="roster-note">La fiche de recrutement détaillée (mesures, vidéo, calendrier) sera ajoutée ici lorsque la joueuse l&apos;aura complétée dans ROF Connect.</p>}

          {fiche && (
            <div className="fiche-reco">
              {fiche.faits.length > 0 && (
                <dl className="fiche-joueuse fiche-faits">
                  {fiche.faits.map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              )}
              {fiche.apropos && (
                <section className="bloc-reco">
                  <h3>À propos</h3>
                  <p className="texte-libre">{fiche.apropos}</p>
                </section>
              )}
              {fiche.video && (
                <section className="bloc-reco">
                  <h3>Vidéo de présentation</h3>
                  <div className="reco-video">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${fiche.video}`}
                      title={`Vidéo de présentation : ${j.nom}`}
                      loading="lazy"
                      allow="encrypted-media; picture-in-picture"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                </section>
              )}
              {fiche.mesures.length > 0 && (
                <section className="bloc-reco">
                  <h3>Mesures athlétiques</h3>
                  <dl className="fiche-joueuse">
                    {fiche.mesures.map((m) => (
                      <div key={m.label}>
                        <dt>{m.label}</dt>
                        <dd>{m.valeur}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              {fiche.realisations.length > 0 && (
                <section className="bloc-reco">
                  <h3>Réalisations et honneurs</h3>
                  <ul className="reco-liste">
                    {fiche.realisations.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </section>
              )}
              {fiche.etudes.length > 0 && (
                <section className="bloc-reco">
                  <h3>Études</h3>
                  <dl className="fiche-joueuse">
                    {fiche.etudes.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}
              {fiche.evenements.length > 0 && (
                <section className="bloc-reco">
                  <h3>Calendrier des matchs et compétitions</h3>
                  <ul className="reco-cal">
                    {fiche.evenements.map((ev) => (
                      <li key={ev.date + ev.nom} className={ev.passe ? "passe" : ""}>
                        <b>{ev.nom}</b>
                        <span>
                          {dateFr(ev.date)}
                          {ev.lieu ? ` · ${ev.lieu}` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {fiche.liens.length > 0 && (
                <section className="bloc-reco">
                  <h3>Liens</h3>
                  <div className="reco-liens">
                    {fiche.liens.map(([k, u]) => (
                      <a key={k} className="btn ghost-clair" href={u} target="_blank" rel="noopener noreferrer nofollow">
                        {k} ↗
                      </a>
                    ))}
                  </div>
                </section>
              )}
              {fiche.reference && (
                <section className="bloc-reco">
                  <h3>Référence</h3>
                  <p className="texte-libre">
                    <b>{fiche.reference.nom}</b>
                    {fiche.reference.role ? ` — ${fiche.reference.role}` : ""}
                    {fiche.reference.contact ? ` · ${fiche.reference.contact}` : ""}
                  </p>
                </section>
              )}
            </div>
          )}
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
