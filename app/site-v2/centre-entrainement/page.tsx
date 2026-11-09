import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Cadre } from "@/components/site-v2/Cadre";
import { CENTRE, CONTENU, sportDe } from "@/lib/site-v2/donnees";

export const metadata: Metadata = { title: "Centre d'entraînement — Royal On Field" };

export default async function CentrePage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const sport = sportDe((await searchParams).sport);
  const c = CONTENU[sport];

  return (
    <Cadre sport={sport}>
      <section className="roster-hero">
        <div className="wrap">
          <Link className="retour" href={`/site-v2?sport=${sport}`}>
            ← Accueil {c.mot.toLowerCase()}
          </Link>
          <div className="kicker">Royal {c.mot} On Field · Repentigny, QC</div>
          <h1>{CENTRE.titre}</h1>
          <p className="lead">{CENTRE.intro}</p>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 48 }}>
        <div className="wrap">
          <div className="centre-photo">
            <Image src={CENTRE.photo} alt={CENTRE.alt} fill priority sizes="(min-width: 1280px) 1200px, 100vw" style={{ objectPosition: "50% 60%" }} />
          </div>
          <ul className="avenir-points" style={{ marginTop: 24 }}>
            {CENTRE.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <div className="empty-clair" style={{ marginTop: 24 }}>
            <h3>Plus d&apos;information bientôt.</h3>
            <p>L&apos;horaire, les tarifs et les réservations seront publiés ici.</p>
          </div>
          <div className="org-contact">
            <div>
              <h3>Une question?</h3>
              <p>Écris-nous pour réserver ou en savoir plus sur le centre d&apos;entraînement.</p>
            </div>
            <a className="btn solid" href="mailto:royal@lentrepotdubaseball.com">royal@lentrepotdubaseball.com</a>
          </div>
        </div>
      </section>
    </Cadre>
  );
}
