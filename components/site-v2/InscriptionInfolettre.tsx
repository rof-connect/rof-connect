"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { sInscrireInfolettre, type EtatInfolettre } from "@/app/site-v2/infolettre-actions";

const CLE = "rof-infolettre"; // « inscrit » : on ne redemande plus, ni en softball ni en baseball
const cleRefus = (sport: string) => `rof-infolettre-refus-${sport}`; // refus mémorisé séparément pour chaque sport : le volet baseball redemande même si le volet softball a été refusé
const PAUSE_REFUS_JOURS = 90;

const initial: EtatInfolettre = { ok: false, erreur: null };

const DELAI_MS = 25000; // ouverture après 25 secondes…
const DEFILEMENT = 0.5; // …ou dès que la moitié de la page a défilé (jamais au chargement)

/**
 * Inscription à l'infolettre : jamais au chargement, seulement après 25 s ou 50 % de défilement.
 * Sur ordinateur, une fenêtre ; sur mobile, un bandeau en bas de l'écran (jamais plein écran).
 * Le visiteur peut refuser, et on ne le redemande pas avant 90 jours.
 */
export function InscriptionInfolettre({ sport }: { sport: "softball" | "baseball" }) {
  const [ouvert, setOuvert] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [etat, action, enCours] = useActionState(sInscrireInfolettre, initial);
  const boite = useRef<HTMLDivElement>(null);
  const champ = useRef<HTMLInputElement>(null);
  const avant = useRef<HTMLElement | null>(null);

  const deja = () => {
    try {
      if (localStorage.getItem(CLE) === "inscrit") return true;
      const t = Number(localStorage.getItem(cleRefus(sport)));
      return Number.isFinite(t) && t > 0 && Date.now() - t < PAUSE_REFUS_JOURS * 86400000;
    } catch {
      return false;
    }
  };
  const retenir = (cle: string, valeur: string) => {
    try {
      localStorage.setItem(cle, valeur);
    } catch {
      /* navigation privée : on ne retient rien */
    }
  };

  // Réévalué à chaque changement de sport : ouvrir le volet baseball affiche la demande même si le softball a été refusé.
  useEffect(() => {
    setOuvert(false);
    if (deja()) return;
    let fait = false;
    const ouvrir = () => {
      if (fait) return;
      fait = true;
      avant.current = document.activeElement as HTMLElement | null;
      setMobile(window.matchMedia("(max-width: 700px)").matches);
      setOuvert(true);
    };
    const t = setTimeout(ouvrir, DELAI_MS);
    const surDefilement = () => {
      const haut = window.scrollY + window.innerHeight;
      if (haut / document.documentElement.scrollHeight >= DEFILEMENT) ouvrir();
    };
    window.addEventListener("scroll", surDefilement, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", surDefilement);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sport]);

  useEffect(() => {
    if (etat.ok) retenir(CLE, "inscrit");
  }, [etat.ok]);

  useEffect(() => {
    if (ouvert && !mobile) champ.current?.focus(); // sur mobile, pas de clavier ouvert d'office
  }, [ouvert]);

  const fermer = (refus: boolean) => {
    if (refus && !etat.ok) retenir(cleRefus(sport), String(Date.now()));
    setOuvert(false);
    avant.current?.focus?.();
  };

  const clavier = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") return fermer(true);
    if (e.key !== "Tab" || !boite.current) return;
    const f = [...boite.current.querySelectorAll<HTMLElement>("button, input:not([tabindex='-1'])")].filter((x) => !x.hasAttribute("disabled"));
    if (!f.length) return;
    const premier = f[0];
    const dernier = f[f.length - 1];
    if (e.shiftKey && document.activeElement === premier) {
      e.preventDefault();
      dernier.focus();
    } else if (!e.shiftKey && document.activeElement === dernier) {
      e.preventDefault();
      premier.focus();
    }
  };

  if (!ouvert) return null;
  return (
    <div className={`infolettre-fond${mobile ? " bandeau" : ""}`} onMouseDown={(e) => e.target === e.currentTarget && fermer(true)}>
      <div ref={boite} className="infolettre" role="dialog" aria-modal={mobile ? undefined : true} aria-labelledby="infolettre-titre" aria-describedby="infolettre-texte" onKeyDown={clavier}>
        <button type="button" className="infolettre-x" aria-label="Fermer sans m'inscrire" onClick={() => fermer(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d="M5 5l14 14M19 5 5 19" />
          </svg>
        </button>
        {etat.ok ? (
          <div role="status">
            <h2 id="infolettre-titre">Merci !</h2>
            <p id="infolettre-texte">Tu es inscrit à l&apos;infolettre de Royal On Field. À bientôt dans ta boîte de réception.</p>
            <button type="button" className="btn solid" onClick={() => fermer(false)}>
              Continuer vers le site
            </button>
          </div>
        ) : (
          <form action={action} noValidate>
            <h2 id="infolettre-titre">Reste dans le coup.</h2>
            <p id="infolettre-texte">Reçois les nouvelles de Royal On Field : évaluations, tournois, inscriptions et engagements universitaires.</p>
            <input type="hidden" name="sport" value={sport} />
            <input type="text" name="site_web" tabIndex={-1} autoComplete="off" aria-hidden="true" className="infolettre-piege" />
            <label htmlFor="infolettre-courriel">Ton courriel</label>
            <input
              ref={champ}
              id="infolettre-courriel"
              name="courriel"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              defaultValue={etat.valeur ?? ""}
              placeholder="nom@exemple.com"
              aria-invalid={etat.erreur ? true : undefined}
              aria-describedby={etat.erreur ? "infolettre-erreur" : undefined}
            />
            {etat.erreur && (
              <p id="infolettre-erreur" role="alert" className="infolettre-erreur">
                {etat.erreur}
              </p>
            )}
            <div className="infolettre-boutons">
              <button type="submit" className="btn solid" disabled={enCours}>
                {enCours ? "Envoi…" : "Je m'inscris"}
              </button>
              <button type="button" className="btn ghost" onClick={() => fermer(true)}>
                Non merci
              </button>
            </div>
            <p className="infolettre-note">En m&apos;inscrivant, je consens à recevoir les communications de Royal On Field. Je peux me désabonner en tout temps.</p>
          </form>
        )}
      </div>
    </div>
  );
}
