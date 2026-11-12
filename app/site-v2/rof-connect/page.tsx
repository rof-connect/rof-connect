import { accueilHref } from "@/lib/site-v2/adresses";
import type { Metadata } from "next";
import Link from "next/link";
import { Cadre } from "@/components/site-v2/Cadre";
import { CONTENU, sportDe } from "@/lib/site-v2/donnees";

export const metadata: Metadata = {
  title: "ROF Connect — Royal On Field",
  description: "ROF Connect : l'outil exclusif au programme Royal On Field pour mieux suivre chaque athlète, 12 mois par année.",
};

type Fonction = { t: string; d: string; icone: string };

const FONCTIONS: Fonction[] = [
  { t: "Agenda", d: "Les matchs, pratiques et événements de ton équipe, avec ta réponse en un clic et des rappels par courriel.", icone: "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4" },
  { t: "Entraînements à distance", d: "Le programme du jour avec chaque exercice et sa photo. Un clic sur « J'ai complété cet entraînement » et c'est noté.", icone: "M4 14l4-4 3 3 5-6 4 4M4 20h16" },
  { t: "Messages", d: "Le fil de ton équipe et des conversations privées avec le personnel, sans passer par dix applications.", icone: "M4 5h16v11H9l-5 4z" },
  { t: "Documents", d: "Formulaires, horaires et PDF classés par équipe, toujours au même endroit.", icone: "M6 3h8l4 4v14H6zM14 3v4h4M9 12h6M9 16h6" },
  { t: "Sondages", d: "Disponibilités, tailles de vêtements, inscriptions : on répond en quelques secondes.", icone: "M5 20V10M12 20V4M19 20v-7" },
  { t: "Ma page de présentation", d: "Un profil de joueuse pour le recrutement. La famille décide ce qui est visible, et peut tout masquer.", icone: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM5 21a7 7 0 0 1 14 0" },
  { t: "Parcours NCAA", d: "Le questionnaire de recrutement et le suivi du parcours vers les universités américaines.", icone: "M4 19h16M6 15l4-4 3 3 5-6" },
  { t: "Famille", d: "Un seul accès pour plusieurs joueuses, avec le courriel du parent. On change de joueuse en un clic.", icone: "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M17 11a2.5 2.5 0 1 0 0-5M16 14a5 5 0 0 1 5 6" },
  { t: "À faire", d: "L'accueil rassemble ce qui t'attend : entraînement à compléter, sondage à remplir, fiche à terminer.", icone: "M5 12l4 4 10-10" },
];

const PUBLICS: { t: string; d: string }[] = [
  { t: "Joueuses et joueurs", d: "Ton agenda, tes entraînements, tes messages et ta page de présentation, dans la poche." },
  { t: "Parents", d: "Les horaires, les documents et les rappels de tous tes enfants avec un seul courriel." },
  { t: "Entraîneurs", d: "Les alignements, les présences, les messages d'équipe et les conversations privées." },
  { t: "Direction", d: "Les inscriptions, les équipes, les statuts selon l'âge et les messages à toute l'organisation." },
];

const ETAPES: { n: string; t: string; d: string }[] = [
  { n: "01", t: "S'inscrire", d: "Remplis le formulaire d'inscription avec le courriel du parent." },
  { n: "02", t: "Être placé", d: "La Direction accepte la joueuse ou le joueur, puis l'ajoute à son équipe selon l'âge." },
  { n: "03", t: "Se connecter", d: "Un courriel et un mot de passe, et l'espace réservé aux athlètes du programme s'ouvre." },
];

export default async function RofConnectPage({ searchParams }: { searchParams: Promise<{ sport?: string }> }) {
  const sport = sportDe((await searchParams).sport);
  const c = CONTENU[sport];

  return (
    <Cadre sport={sport}>
      <section className="roster-hero">
        <div className="wrap">
          <Link className="retour" href={accueilHref(sport)}>
            ← Accueil {c.mot.toLowerCase()}
          </Link>
          <div className="kicker">Espace membres · Royal On Field</div>
          <h1>ROF Connect</h1>
          <p className="lead">
            L&apos;outil exclusif au programme Royal On Field. Il permet de mieux suivre chaque athlète, 12 mois par année : en saison, entre les saisons et à distance.
          </p>
          <div className="btns rc-btns">
            <Link className="btn solid" href="/connexion">
              Se connecter
            </Link>
            <Link className="btn ghost" href="/inscription">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </section>

      <section className="block rc-exclusif">
        <div className="wrap">
          <div className="rc-bandeau">
            <div>
              <div className="kicker">Exclusif au programme</div>
              <h2>
                Un suivi <em>12 mois</em> par année
              </h2>
              <p>
                ROF Connect n&apos;est offert qu&apos;aux athlètes de Royal On Field. L&apos;encadrement ne s&apos;arrête pas à la fin de la saison : les entraînements, les échanges avec le personnel et le parcours vers les programmes collégiaux se poursuivent toute l&apos;année.
              </p>
            </div>
            <ul className="rc-saisons">
              <li>
                <b>En saison</b>
                <span>Matchs, pratiques, présences, alignements</span>
              </li>
              <li>
                <b>Hors saison</b>
                <span>Entraînements à distance, programme du jour, suivi des complétés</span>
              </li>
              <li>
                <b>Toute l&apos;année</b>
                <span>Messages, documents, fiche de recrutement et parcours NCAA</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="head">
            <h2>
              Tout est <em>ici</em>
            </h2>
          </div>
          <div className="rc-grille">
            {FONCTIONS.map((f) => (
              <article key={f.t} className="rc-carte">
                <svg className="rc-ic" width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={f.icone} />
                </svg>
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="block dark">
        <div className="wrap">
          <div className="head">
            <h2>
              Pour <em>toute la famille</em> Royal
            </h2>
          </div>
          <div className="rc-publics">
            {PUBLICS.map((p) => (
              <div key={p.t} className="rc-public">
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="block">
        <div className="wrap">
          <div className="recruit">
            <div className="visual">
              <h3>
                Comment <span>ça marche</span>
              </h3>
              <p>Trois étapes, et tu es prêt. Les parents gardent le contrôle de ce qui est partagé.</p>
            </div>
            <div className="steps">
              {ETAPES.map((e) => (
                <div key={e.n} className="step">
                  <div className="n">{e.n}</div>
                  <div>
                    <h4>{e.t}</h4>
                    <p>{e.d}</p>
                  </div>
                </div>
              ))}
              <div className="actions">
                <Link className="btn blue" href="/inscription">
                  S&apos;inscrire
                </Link>
                <Link className="btn ghost rc-ghost" href="/connexion">
                  J&apos;ai déjà un compte
                </Link>
              </div>
            </div>
          </div>

          <div className="rc-mobile">
            <h3>Sur ton téléphone, comme une application</h3>
            <p>
              <strong>iPhone :</strong> ouvre ROF Connect dans Safari, touche Partager, puis « Sur l&apos;écran d&apos;accueil ». <strong>Android :</strong> ouvre le menu de Chrome, puis « Installer l&apos;application ». L&apos;espace membres est disponible en français et en anglais.
            </p>
          </div>

          <div className="org-contact">
            <div>
              <h3>Une question sur ROF Connect?</h3>
              <p>Écris-nous : on t&apos;aide à créer ton compte ou à retrouver ton accès.</p>
            </div>
            <a className="btn solid" href="mailto:royal@lentrepotdubaseball.com">
              royal@lentrepotdubaseball.com
            </a>
          </div>
        </div>
      </section>
    </Cadre>
  );
}
