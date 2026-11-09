import Image from "next/image";
import Link from "next/link";
import { Cadre } from "@/components/site-v2/Cadre";
import { ReseauxSociaux } from "@/components/site-v2/ReseauxSociaux";
import { chargerEquipesPubliques } from "@/lib/site-v2/equipes";
import { CONTENU, FIELDLEVEL, GALERIES, HERO, NIVEAUX, PARTENAIRES_PAR_SPORT, lienFieldLevel, sportDe } from "@/lib/site-v2/donnees";

export const dynamic = "force-dynamic";

const Icone = ({ children }: { children: React.ReactNode }) => (
  <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    {children}
  </svg>
);

/** « 16U Dostaler » : niveau « 16U » en grand, nom « Dostaler » dessous (le nom complet reste « 16U Dostaler »). */
function niveauNom(nom: string) {
  const m = nom.match(/^(\d{1,2}(?:\/\d{1,2})?U)\s+(.+)$/i);
  return m ? { niveau: m[1], reste: m[2] } : { niveau: nom, reste: "" };
}

export default async function SiteV2({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const { sport: param } = await searchParams;
  const sport = sportDe(param);
  const c = CONTENU[sport];
  const { equipes, source } = await chargerEquipesPubliques(sport);

  const stats: [string, string][] = [...c.stats];
  // Pas de nombre de joueuses dans la bande ; le baseball ajoute seulement le nombre d'équipes.
  if (sport === "baseball" && equipes.length > 0) stats.unshift([String(equipes.length), "Équipes"]);
  const qEquipes = equipes.length ? `${equipes.length} équipe${equipes.length > 1 ? "s" : ""} · ${NIVEAUX[sport]}` : NIVEAUX[sport];
  const qEngagees = c.engagees.length ? `${c.engagees.length} athlètes signées` : "Les premiers à venir";

  return (
    <Cadre sport={sport} accueil provisoire={source === "provisoire"}>
        {/* HERO */}
        <section className="hero">
          <div className="photo">
            <Image src={HERO[sport].src} alt={HERO[sport].alt} fill priority sizes="100vw" style={{ objectPosition: HERO[sport].position }} />
          </div>
          <svg className="diamond" aria-hidden>
            <use href="#diamondArt" />
          </svg>
          <div className="wrap content">
            <div className="kicker">{c.kicker}</div>
            <h1>
              EARN THE
              <br />
              <span className="gold">CROWN.</span>
            </h1>
            <p className="lead">{c.accroche}</p>
            <div className="btns">
              <a className="btn solid" href="#recrutement">Le parcours Royal →</a>
              <a className="btn ghost" href="#equipes">Nos équipes</a>
            </div>
          </div>
        </section>

        {/* Chiffres */}
        <div className="statbar">
          <div className="wrap" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)},1fr)` }}>
            {stats.map(([b, s]) => (
              <div className="stat" key={s}>
                <b>{b}</b>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accès rapides */}
        <nav className="quick" aria-label="Accès rapides">
          <div className="wrap">
            <a href="#equipes">
              <Icone>
                <circle cx="9" cy="8" r="3.5" />
                <circle cx="17" cy="9" r="2.5" />
                <path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5M15 14.6c2.8-.2 5.3 1.3 6 4.4" />
              </Icone>
              <strong>Équipes</strong>
              <small>{qEquipes}</small>
            </a>
            <a href="#calendrier">
              <Icone>
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </Icone>
              <strong>Calendrier</strong>
              <small>Tournois & showcases</small>
            </a>
            <a href="#recrutement">
              <Icone>
                <path d="M12 3l9 5-9 5-9-5 9-5z" />
                <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
              </Icone>
              <strong>Recrutement</strong>
              <small>NCAA · NAIA · NJCAA</small>
            </a>
            <a href="#engagements">
              <Icone>
                <path d="M12 15l-4 6 1-5-4-3 5-.5L12 8l2 4.5 5 .5-4 3 1 5z" />
              </Icone>
              <strong>Engagements</strong>
              <small>{qEngagees}</small>
            </a>
            <Link href="/connexion">
              <Icone>
                <rect x="4" y="3" width="16" height="18" rx="3" />
                <path d="M9 17h6" />
                <circle cx="12" cy="9" r="2.5" />
              </Icone>
              <strong>ROF Connect</strong>
              <small>Espace membres</small>
            </Link>
          </div>
        </nav>

        {/* ÉQUIPES (choisies par la Direction dans ROF Connect) */}
        <section className="block" id="equipes">
          <div className="wrap">
            <div className="head">
              <h2>
                {c.mot} <em>Équipes</em>
              </h2>
              <Link className="more" href="/inscription">Joindre le programme →</Link>
            </div>
            {equipes.length > 0 ? (
              <>
              <div className="teams">
                {c.aVenir && (
                  <Link className="team team-avenir" href="/site-v2/varsity">
                    <div className="big" aria-hidden>V</div>
                    <span className="team-tags">
                      <span className="team-tag">{c.aVenir.etiquette}</span>
                    </span>
                    <div className="lvl">{c.aVenir.niveau}</div>
                    <div className="team-nom">{c.aVenir.nom}</div>
                    <div className="meta">{c.aVenir.sous}</div>
                  </Link>
                )}
                {equipes.map((t) => (
                  <Link key={t.id} className={`team${t.vedette ? " feat" : ""}`} href={t.roster || t.matchs ? `/site-v2/equipes/${t.id}` : "/inscription"}>
                    <div className="big" aria-hidden>{niveauNom(t.nom).niveau.replace("Varsity", "V")}</div>
                    {t.categorie && (
                      <span className="team-tags">
                        <span className="team-tag">{t.categorie}</span>
                      </span>
                    )}
                    <div className="lvl">{niveauNom(t.nom).niveau}</div>
                    {niveauNom(t.nom).reste && <div className="team-nom">{niveauNom(t.nom).reste}</div>}
                    {t.description && (
                      <>
                        <div className="bar" />
                        <div className="desc">{t.description}</div>
                      </>
                    )}
                  </Link>
                ))}
              </div>
              </>
            ) : (
              <p style={{ color: "#4A5570" }}>Les équipes {c.mot.toLowerCase()} de la saison seront publiées ici bientôt.</p>
            )}
            {c.volet && (
              <div className="volet">
                <h3>{c.volet.titre}</h3>
                <div className="volet-groupes">
                  {c.volet.groupes.map((g) => (
                    <div className="volet-groupe" key={g.nom}>
                      <h4>{g.nom}</h4>
                      <ul>
                        {g.equipes.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* CALENDRIER */}
        <section className="block dark" id="calendrier">
          <div className="wrap">
            <div className="head">
              <h2>
                Calendrier <em>{c.saison}</em>
              </h2>
              {c.noteCalendrier && <span className="pill">{c.noteCalendrier}</span>}
            </div>
            <div className="sched">
              {c.calendrier.length > 0 ? (
                c.calendrier.map((e) => (
                  <div className="ev" key={e.t}>
                    <div className="date">
                      <b>{e.m}</b>
                      <span>{e.y}</span>
                    </div>
                    <div>
                      <h3>{e.t}</h3>
                      {e.p && <p>{e.p}</p>}
                    </div>
                    <span className={`pill${e.hl ? " hl" : ""}`}>{e.tag}</span>
                  </div>
                ))
              ) : (
                <div className="empty">
                  <h3>Calendrier 2027 à venir</h3>
                  <p>{c.videCalendrier}</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* PALMARÈS */}
        <section className="block" id="palmares">
          <div className="wrap">
            <div className="head">
              <h2>
                Le palmarès <em>parle.</em>
              </h2>
            </div>
            {c.palmares.length > 0 ? (
              <div className="palmares">
                {c.palmares.map((h, i) => (
                  <details className="annee" key={h.y} open={i === 0}>
                    <summary>
                      <span className="yr">{h.y}</span>
                      <span className="nb-titres">{h.l.length} résultat{h.l.length > 1 ? "s" : ""}</span>
                      <svg className="chev" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </summary>
                    <ul>
                      {h.l.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            ) : (
              <div className="honor" style={{ textAlign: "center", borderTopColor: "var(--accent)" }}>
                <div className="yr" style={{ fontSize: 44 }}>Le prochain chapitre s&apos;écrit.</div>
                <p style={{ marginTop: 10, color: "#4A5570" }}>{c.videPalmares}</p>
              </div>
            )}
          </div>
        </section>

        {/* RECRUTEMENT */}
        <section className="block" id="recrutement" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="recruit">
              <div className="visual">
                <svg style={{ position: "absolute", right: -80, top: -40, width: 460, opacity: 0.12 }} aria-hidden>
                  <use href="#diamondArt" />
                </svg>
                <div className="kicker">Recrutement</div>
                <h3>
                  Le parcours
                  <br />
                  <span>Royal.</span>
                </h3>
                <p>{c.lead}</p>
              </div>
              <div className="steps">
                {c.etapes.map((e) => (
                  <div className="step" key={e.n}>
                    <div className="n">{e.n}</div>
                    <div>
                      <h4>{e.t}</h4>
                      <p>{e.d}</p>
                    </div>
                  </div>
                ))}
                <div className="actions">
                  <Link className="btn blue" href="/parcours">Questionnaire de parcours →</Link>
                  <Link className="btn solid" href="/inscription">Créer mon profil</Link>
                  {lienFieldLevel(FIELDLEVEL[sport]) && (
                    <a className="btn ghost-clair" href={lienFieldLevel(FIELDLEVEL[sport])} target="_blank" rel="noopener noreferrer">
                      Notre profil FieldLevel
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PARCOURS ACADÉMIQUE (softball) */}
        {c.academique.length > 0 && (
          <section className="block" id="academique" style={{ paddingTop: 0 }}>
            <div className="wrap">
              <div className="head">
                <h2>
                  Le parcours <em>académique</em>
                </h2>
              </div>
              <ol className="acad">
                {c.academique.map((a, i) => (
                  <li key={a.t}>
                    <span className="n">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3>{a.t}</h3>
                      <p>{a.d}</p>
                      {a.lien && (
                        <a href={a.lien} target="_blank" rel="noopener noreferrer">
                          En savoir plus →
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ENGAGEMENTS */}
        <section className="block dark" id="engagements">
          <div className="wrap">
            <div className="head">
              <h2>
                Committed. <em>{c.engagementsSous}</em>
              </h2>
              <span className="pill hl">#EarnTheCrown</span>
            </div>
            {c.engagees.length > 0 ? (
              <div className="commits">
                {c.engagees.map((e) => (
                  <figure className="commit-photo" key={e.who}>
                    <div className="commit-visuel">
                      {e.photo ? (
                        <Image src={e.photo} alt={`${e.who}, engagée avec ${e.s}`} fill loading="lazy" sizes="(min-width: 1000px) 400px, 90vw" />
                      ) : (
                        <svg aria-hidden>
                          <use href="#diamondArt" />
                        </svg>
                      )}
                    </div>
                    <figcaption>
                      <b>{e.who}</b>
                      <span>{e.s}</span>
                      <em>
                        {e.m} · {e.c}
                      </em>
                    </figcaption>
                  </figure>
                ))}
              </div>
            ) : (
              <div className="empty">
                <h3>Ton nom ici.</h3>
                <p>{c.videEngagements}</p>
                <p style={{ marginTop: 18 }}>
                  <Link className="btn solid" href="/parcours">Commencer mon parcours →</Link>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* GALERIE */}
        <section className="block" id="galerie">
          <div className="wrap">
            <div className="head">
              <h2>
                En <em>images</em>
              </h2>
            </div>
            <div className={`gallery${GALERIES[sport].length > 5 ? " gallery-auto" : ""}`}>
              {GALERIES[sport].map((g) => (
                <div className="g" key={g.src}>
                  <Image src={g.src} alt={g.alt} fill loading="lazy" sizes="(min-width: 1000px) 40vw, 50vw" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ROF CONNECT */}
        <section className="block" id="connect" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="connect">
              <svg style={{ position: "absolute", right: -120, bottom: -140, width: 520, opacity: 0.08 }} aria-hidden>
                <use href="#diamondArt" />
              </svg>
              <div>
                <div className="kicker">Espace membres</div>
                <h2>
                  ROF
                  <br />
                  <span>Connect.</span>
                </h2>
                <p>La plateforme des joueurs, des parents et des entraîneurs : horaires, plans d&apos;entraînement, bibliothèque vidéo, messagerie et suivi du parcours de recrutement.</p>
                <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
                  <Link className="btn solid" href="/connexion">Se connecter →</Link>
                  <Link className="btn ghost" href="/inscription">Créer un profil Prospect</Link>
                </div>
              </div>
              <ul>
                <li><i />Horaires et présences par équipe</li>
                <li><i />Plans d&apos;entraînement et bibliothèque vidéo</li>
                <li><i />Calculateur d&apos;admissibilité NCAA</li>
                <li><i />Liens GameChanger et FieldLevel</li>
              </ul>
            </div>
          </div>
        </section>

        {/* PARTENAIRES */}
        <section className="block" id="partenaires" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="head">
              <h2>
                Nos <em>partenaires</em>
              </h2>
            </div>
            <div className="partners">
              {PARTENAIRES_PAR_SPORT[sport].map((p) =>
                p.src ? (
                  <div className="logo" key={p.nom}>
                    <Image src={p.src} alt={p.nom} fill loading="lazy" sizes="150px" />
                  </div>
                ) : (
                  <div key={p.nom}>{p.nom}</div>
                ),
              )}
            </div>
          </div>
        </section>

      <ReseauxSociaux sport={sport} />
    </Cadre>
  );
}
