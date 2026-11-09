import Image from "next/image";
import Link from "next/link";
import { Entete } from "@/components/site-v2/Entete";
import { chargerEquipesPubliques } from "@/lib/site-v2/equipes";
import { CONTENU, ETAPES, GALERIE, PARTENAIRES, SPORTS, sportDe } from "@/lib/site-v2/donnees";

export const dynamic = "force-dynamic";

const Icone = ({ children }: { children: React.ReactNode }) => (
  <svg className="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
    {children}
  </svg>
);

export default async function SiteV2({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const { sport: param } = await searchParams;
  const sport = sportDe(param);
  const c = CONTENU[sport];
  const { equipes, source } = await chargerEquipesPubliques(sport);

  const nbJoueurs = equipes.reduce((s, e) => s + (e.nb ?? 0), 0);
  const stats: [string, string][] = [...c.stats];
  if (source === "bd" && equipes.length > 0) {
    const mot = sport === "softball" ? "Joueuses" : "Joueurs";
    if (sport === "softball") stats.push([String(nbJoueurs), `${mot} · ${equipes.length} équipe${equipes.length > 1 ? "s" : ""}`]);
    else stats.unshift([String(equipes.length), "Équipes"], [String(nbJoueurs), mot]);
  }
  const qEquipes = equipes.length ? `${equipes.length} équipe${equipes.length > 1 ? "s" : ""} · 10U à Varsity` : "10U à Varsity";
  const qEngagees = c.engagees.length ? `${c.engagees.length} athlètes signées` : "Les premiers à venir";

  return (
    <div className="v2" data-sport={sport}>
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
        <defs>
          <symbol id="diamondArt" viewBox="0 0 400 400">
            <g fill="none" stroke="#fff" strokeWidth="3">
              <path d="M200 40 L360 200 L200 360 L40 200 Z" />
              <path d="M200 120 L280 200 L200 280 L120 200 Z" />
              <circle cx="200" cy="200" r="22" />
              <path d="M200 360 A220 220 0 0 1 40 200" strokeDasharray="6 10" />
              <path d="M200 360 A220 220 0 0 0 360 200" strokeDasharray="6 10" />
            </g>
          </symbol>
        </defs>
      </svg>

      {source === "apercu" && (
        <div className="apercu" role="note">
          Aperçu : les équipes ci-dessous sont des exemples. Appliquer la migration 0009 dans Supabase, puis cocher « Visible sur le site » dans la gestion des équipes.
        </div>
      )}

      {/* Barre utilitaire */}
      <div className="util">
        <div className="wrap">
          <div className="links">
            <Link href="/inscription">Inscription</Link>
            <Link href="/parcours">Questionnaire NCAA</Link>
            <a href="#partenaires">Partenaires</a>
          </div>
          <div className="sport-switch" role="group" aria-label="Choisir le sport">
            {SPORTS.map((s) => (
              <Link key={s} href={`/site-v2?sport=${s}`} scroll={false} className={s === sport ? "on" : ""} aria-current={s === sport ? "true" : undefined}>
                {CONTENU[s].mot}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Entete sport={sport} />

      <main id="top">
        {/* HERO */}
        <section className="hero">
          {sport === "softball" ? (
            <div className="photo">
              <Image src="/photos/celebration.jpg" alt="Les joueuses de Royal On Field, de dos, lèvent les bras ensemble sur le terrain" fill priority sizes="100vw" style={{ objectPosition: "62% 30%" }} />
            </div>
          ) : (
            <div className="photo ph" />
          )}
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
                {c.mot}
                <br />
                <em>Équipes</em>
              </h2>
              <Link className="more" href="/inscription">Joindre le programme →</Link>
            </div>
            {equipes.length > 0 ? (
              <div className="teams">
                {equipes.map((t) => (
                  <Link key={t.id} className={`team${t.vedette ? " feat" : ""}`} href="/inscription">
                    <div className="big" aria-hidden>{t.nom.replace("Varsity", "V")}</div>
                    <div className="lvl">{t.nom}</div>
                    {t.nb !== null && t.nb > 0 && (
                      <div className="meta">
                        {t.nb} {sport === "softball" ? (t.nb > 1 ? "joueuses" : "joueuse") : t.nb > 1 ? "joueurs" : "joueur"}
                      </div>
                    )}
                    {t.description && (
                      <>
                        <div className="bar" />
                        <div className="desc">{t.description}</div>
                      </>
                    )}
                  </Link>
                ))}
              </div>
            ) : (
              <p style={{ color: "#4A5570" }}>Les équipes {c.mot.toLowerCase()} de la saison seront publiées ici bientôt.</p>
            )}
          </div>
        </section>

        {/* CALENDRIER */}
        <section className="block dark" id="calendrier">
          <div className="wrap">
            <div className="head">
              <h2>
                Calendrier
                <br />
                <em>{c.saison}</em>
              </h2>
              <span className="pill">{c.noteCalendrier}</span>
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
                      <p>{e.p}</p>
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
                Le palmarès
                <br />
                <em>parle.</em>
              </h2>
            </div>
            <div className="honors">
              {c.palmares.length > 0 ? (
                c.palmares.map((h) => (
                  <div className="honor" key={h.y}>
                    <div className="yr">{h.y}</div>
                    <ul>
                      {h.l.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <div className="honor" style={{ gridColumn: "1/-1", textAlign: "center", borderTopColor: "var(--accent)" }}>
                  <div className="yr" style={{ fontSize: 56 }}>Le prochain chapitre s&apos;écrit.</div>
                  <p style={{ marginTop: 12, color: "#4A5570" }}>{c.videPalmares}</p>
                </div>
              )}
            </div>
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
                {ETAPES.map((e) => (
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
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ENGAGEMENTS */}
        <section className="block dark" id="engagements">
          <div className="wrap">
            <div className="head">
              <h2>
                Committed.
                <br />
                <em>{c.engagementsSous}</em>
              </h2>
              <span className="pill hl">#EarnTheCrown</span>
            </div>
            {c.engagees.length > 0 ? (
              <div className="commits">
                {c.engagees.map((e) => (
                  <div className="commit" key={e.who}>
                    <div className="img">
                      <svg aria-hidden>
                        <use href="#diamondArt" />
                      </svg>
                    </div>
                    <div className="sig">SIGNÉE</div>
                    <div className="body">
                      <div className="who">
                        {e.who.split(" ").map((m, i) => (
                          <span key={i}>
                            {i > 0 && <br />}
                            {m}
                          </span>
                        ))}
                      </div>
                      <div className="school">{e.s}</div>
                      <div className="meta">{e.m}</div>
                    </div>
                    <div className="cls">{e.c}</div>
                  </div>
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
                En
                <br />
                <em>images</em>
              </h2>
            </div>
            <div className="gallery">
              {GALERIE.map((g) => (
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
                Nos
                <br />
                <em>partenaires</em>
              </h2>
            </div>
            <div className="partners">
              {PARTENAIRES.map((p) =>
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
      </main>

      <footer>
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="brand">
                <Image src="/logo-r.png" alt="" width={46} height={46} />
                <div className="name" style={{ color: "#fff" }}>
                  ROYAL ON FIELD<small>OBNL · REPENTIGNY</small>
                </div>
              </div>
              <div className="tag">
                EARN THE <span>CROWN.</span>
              </div>
            </div>
            <div>
              <h5>Programmes</h5>
              <Link href="/site-v2?sport=softball">Softball</Link>
              <Link href="/site-v2?sport=baseball">Baseball</Link>
              <a href="#recrutement">Le parcours Royal</a>
            </div>
            <div>
              <h5>Accès</h5>
              <a href="#equipes">Équipes</a>
              <a href="#calendrier">Calendrier</a>
              <a href="#engagements">Engagements</a>
              <Link href="/connexion">ROF Connect</Link>
            </div>
            <div>
              <h5>Contact</h5>
              <a href="mailto:royal@lentrepotdubaseball.com">royal@lentrepotdubaseball.com</a>
              <a>Repentigny, Lanaudière</a>
              <a>#EarnTheCrown</a>
            </div>
          </div>
          <div className="bottom">
            <span>© 2026 Royal On Field — Organisme à but non lucratif</span>
            <span>Affilié à Little League Canada · Baseball Québec · Softball Québec</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
