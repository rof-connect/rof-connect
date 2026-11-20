"use client";

import { useActionState } from "react";
import { sInscrireInfolettre, type EtatInfolettre } from "@/app/site-v2/infolettre-actions";

const initial: EtatInfolettre = { ok: false, erreur: null };

/** Formulaire d'infolettre toujours présent dans le pied de page (la fenêtre contextuelle n'apparaît qu'une fois). */
export function FormInfolettrePied({ sport }: { sport: "softball" | "baseball" }) {
  const [etat, action, enCours] = useActionState(sInscrireInfolettre, initial);
  return (
    <div className="footer-infolettre">
      <h5 id="pied-infolettre-titre">Infolettre</h5>
      {etat.ok ? (
        <p role="status">Merci ! Tu es inscrit à l&apos;infolettre de Royal On Field.</p>
      ) : (
        <form action={action} noValidate aria-labelledby="pied-infolettre-titre">
          <input type="hidden" name="sport" value={sport} />
          <input type="text" name="site_web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="infolettre-piege" />
          <label htmlFor="pied-infolettre-courriel">Reçois les nouvelles : évaluations, tournois, engagements.</label>
          <div className="footer-infolettre-champ">
            <input
              id="pied-infolettre-courriel"
              name="courriel"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              defaultValue={etat.valeur ?? ""}
              placeholder="nom@exemple.com"
              aria-invalid={etat.erreur ? true : undefined}
              aria-describedby={etat.erreur ? "pied-infolettre-erreur" : "pied-infolettre-note"}
            />
            <button type="submit" className="btn solid" disabled={enCours}>
              {enCours ? "Envoi…" : "Je m'inscris"}
            </button>
          </div>
          {etat.erreur && (
            <p id="pied-infolettre-erreur" role="alert" className="infolettre-erreur">
              {etat.erreur}
            </p>
          )}
          <p id="pied-infolettre-note" className="infolettre-note">
            En m&apos;inscrivant, je consens à recevoir les communications de Royal On Field. Je peux me désabonner en tout temps.
          </p>
        </form>
      )}
    </div>
  );
}
