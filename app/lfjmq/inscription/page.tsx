import type { Metadata } from "next";

export const metadata: Metadata = { title: { absolute: "Inscrire une équipe en 2027 | LFJMQ" }, description: "Inscris ton équipe à la LFJMQ en 2027 : trois divisions, forfaits Événement et Saison à partir de 99 $." };

export default function InscriptionPage() {
  return (
    <section className="band join">
      <div className="wrap grid">
        <div>
          <h1>Inscrire une équipe en 2027</h1>
          <p>
            La LFJMQ entame sa deuxième saison et ouvre la porte à de nouvelles équipes situées à moins de 3 heures de route, au Québec, en Ontario et aux États-Unis. Trois divisions : Division 1, Division 2 (15U) et Division 3 (13U).
          </p>
          <p>Formule payée à la présence : forfaits Événement et Saison, à partir de 99 $.</p>
          <div className="btns">
            <a className="btn gold" href="mailto:royal@lentrepotdubaseball.com?subject=Inscription%20LFJMQ%202027">
              Demander l&apos;information
            </a>
          </div>
          <p className="note" style={{ color: "#b7bfdc" }}>
            royal@lentrepotdubaseball.com
          </p>
          <p className="en" lang="en">
            Teams within a 3-hour drive, in Canada or the U.S., are welcome. Information is available in English.
          </p>
        </div>
        <ul className="cal">
          <li>
            <b>Mai</b>Tournoi de printemps
          </li>
          <li>
            <b>Mai à août</b>Saison régulière
          </li>
          <li>
            <b>Septembre</b>Tournoi de fin de saison et finale
          </li>
        </ul>
      </div>
    </section>
  );
}
