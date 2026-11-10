import Image from "next/image";
import Link from "next/link";
import { Entete } from "./Entete";
import { affiliationsDe, CONTENU, SPORTS, type Sport } from "@/lib/site-v2/donnees";
import { liensUtilitaires } from "@/lib/site-v2/menu";

/** Cadre commun du site public : barre utilitaire, en-tête, pied de page et symboles SVG. */
export function Cadre({ sport, provisoire, accueil, children }: { sport: Sport; provisoire?: boolean; accueil?: boolean; children: React.ReactNode }) {
  // Sur l'accueil, les ancres restent locales ; ailleurs (roster), elles reviennent à l'accueil du sport.
  const base = accueil ? "" : `/site-v2?sport=${sport}`;
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

      {provisoire && (
        <div className="apercu" role="note">
          Aperçu : toutes les équipes actives de ROF Connect sont affichées. Après la migration 0009 (Supabase), seules les équipes cochées « Visible sur le site » le seront.
        </div>
      )}

      <div className="util">
        <div className="wrap">
          <div className="links">
            {liensUtilitaires(sport).map((l) => (
              <Link key={l.label} href={l.href}>{l.label}</Link>
            ))}
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

      <Entete sport={sport} base={base} />

      <main id="top">{children}</main>

      <footer>
        <div className="wrap">
          <div className="cols">
            <div>
              <div className="brand">
                <Image src="/logo-r.png" alt="" width={46} height={46} />
                <div className="name" style={{ color: "#fff" }}>
                  ROYAL ON FIELD<small>REPENTIGNY</small>
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
              <a href={`${base}#recrutement`}>Le parcours Royal</a>
            </div>
            <div>
              <h5>Accès</h5>
              <a href={`${base}#equipes`}>Équipes</a>
              <a href={`${base}#calendrier`}>Calendrier</a>
              <a href={`${base}#engagements`}>Engagements</a>
              <Link href={`/site-v2/centre-entrainement?sport=${sport}`}>Centre d&apos;entraînement</Link>
              <Link href={`/site-v2/organisation?sport=${sport}`}>Organisation</Link>
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
            <span>© 2026 Royal On Field</span>
            <ul className="footer-affil" aria-label="Affiliations">
              {affiliationsDe(sport).map((l) => (
                <li key={l.nom}>
                  <Image src={l.src} alt={l.nom} width={72} height={36} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
