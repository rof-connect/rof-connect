/**
 * Fenêtre de téléphone avec des écrans de démonstration de ROF Connect.
 * Les écrans reproduisent l'application avec des données fictives : aucune vraie joueuse ni aucun vrai message n'est montré.
 */

function Cadre({ legende, actif, children }: { legende: string; actif: string; children: React.ReactNode }) {
  return (
    <figure className="tel-fig">
      <div className="tel" role="img" aria-label={legende}>
        <div className="tel-encoche" aria-hidden />
        <div className="tel-ecran" aria-hidden>
          <div className="tel-statut">
            <span>9:41</span>
            <span>●●●</span>
          </div>
          <div className="tel-entete">
            <span className="tel-logo">R</span>
            <span>ROF Connect</span>
          </div>
          <div className="tel-corps">{children}</div>
          <div className="tel-onglets">
            {["Accueil", "Agenda", "Équipe", "Messages", "Moi"].map((o) => (
              <span key={o} className={o === actif ? "on" : ""}>
                {o}
              </span>
            ))}
          </div>
        </div>
      </div>
      <figcaption>{legende}</figcaption>
    </figure>
  );
}

export function TelephoneAccueil() {
  return (
    <Cadre legende="Accueil : ce qu'il y a à faire" actif="Accueil">
      <p className="tel-salut">Bonjour Léa</p>
      <div className="tel-afaire">
        <div className="tel-ligne">
          <b>À FAIRE</b>
          <span className="tel-pastille">2</span>
        </div>
        <div className="tel-carte">
          <strong>JOUR 2 · ENTRAÎNEMENT À DISTANCE</strong>
          <small>Avant le jeudi 12 novembre</small>
          <div className="tel-btns">
            <span className="tel-btn sec">Voir le programme</span>
            <span className="tel-btn">✓ J&apos;ai complété</span>
          </div>
        </div>
        <div className="tel-carte mince">
          <strong>1 SONDAGE À REMPLIR</strong>
          <span aria-hidden>→</span>
        </div>
      </div>
      <div className="tel-prochain">
        <small>PROCHAIN ÉVÉNEMENT</small>
        <strong>Pratique · Mardi 18 h 30</strong>
        <span>Centre d&apos;entraînement</span>
      </div>
    </Cadre>
  );
}

export function TelephoneProgramme() {
  const exercices: [string, string, string][] = [
    ["A1", "Rotation du tronc", "3 × 10"],
    ["A2", "Fente avant avec lancer", "3 × 8"],
    ["B1", "Pont fessier", "3 × 12"],
  ];
  return (
    <Cadre legende="Agenda : le programme du jour" actif="Agenda">
      <div className="tel-carte">
        <strong>JOUR 1 · ENTRAÎNEMENT À DISTANCE</strong>
        <span className="tel-etat">Non complété</span>
        <small>Programme du jour · 6 exercices</small>
      </div>
      {exercices.map(([code, nom, series]) => (
        <div key={code} className="tel-exo">
          <div className="tel-photo">
            <svg viewBox="0 0 80 40" aria-hidden>
              <circle cx="20" cy="9" r="5" />
              <path d="M20 14v14M20 18l-9 6M20 18l9 6M20 28l-7 9M20 28l7 9" />
              <circle cx="60" cy="9" r="5" />
              <path d="M60 14v14M60 18l-12 3M60 18l11 -4M60 28l-7 9M60 28l9 8" />
            </svg>
          </div>
          <div className="tel-exo-t">
            <span>
              <i>{code}</i> {nom}
            </span>
            <em>{series}</em>
          </div>
        </div>
      ))}
      <div className="tel-btns plein">
        <span className="tel-btn">✓ J&apos;ai complété cet entraînement</span>
      </div>
    </Cadre>
  );
}

export function TelephoneMessages() {
  return (
    <Cadre legende="Messages : l'équipe et le personnel" actif="Messages">
      <div className="tel-chats">
        <span className="on">👥 Équipe</span>
        <span>🔒 Mon coach</span>
      </div>
      <div className="tel-fil">
        <div className="tel-bulle autre">
          <b>Coach Marie</b>
          Bravo pour l&apos;entraînement de ce matin ! On se voit mardi à 18 h 30.
          <small>8 nov. · 20:12</small>
        </div>
        <div className="tel-bulle moi">
          Merci ! Je serai là. Est-ce que je dois apporter mes jambières ?
          <small>8 nov. · 20:20</small>
        </div>
        <div className="tel-bulle autre">
          <b>Coach Marie</b>
          Oui, tout l&apos;équipement.
          <small>8 nov. · 20:31</small>
        </div>
      </div>
      <div className="tel-saisie">
        <span>Écris ton message…</span>
        <i>Envoyer</i>
      </div>
    </Cadre>
  );
}
