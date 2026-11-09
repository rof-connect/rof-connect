"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = { sport: "softball" | "baseball"; base?: string };

/** En-tête collant : logo, navigation et menu mobile. */
export function Entete({ sport, base = "" }: Props) {
  const [ouvert, setOuvert] = useState(false);
  const ferme = () => setOuvert(false);

  return (
    <header className="main">
      <div className="wrap">
        <a className="brand" href={`${base}#top`}>
          <Image src="/logo-r.png" alt="" width={46} height={46} priority />
          <div className="name">
            ROYAL ON FIELD<small>{sport === "softball" ? "SOFTBALL" : "BASEBALL"}</small>
          </div>
        </a>
        <nav className={`primary${ouvert ? " open" : ""}`} id="nav" aria-label="Navigation principale">
          <a href={`${base}#equipes`} onClick={ferme}>Équipes</a>
          <a href={`${base}#calendrier`} onClick={ferme}>Calendrier</a>
          <a href={`${base}#recrutement`} onClick={ferme}>Recrutement</a>
          <a href={`${base}#engagements`} onClick={ferme}>Engagements universitaires</a>
          <a href={`${base}#organisation`} onClick={ferme}>Organisation</a>
          <Link className="cta" href="/connexion" onClick={ferme}>ROF Connect</Link>
        </nav>
        <button
          type="button"
          className="burger"
          aria-label={ouvert ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={ouvert}
          aria-controls="nav"
          onClick={() => setOuvert((o) => !o)}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
            <path d={ouvert ? "M5 5l14 14M19 5 5 19" : "M3 6h18M3 12h18M3 18h18"} />
          </svg>
        </button>
      </div>
    </header>
  );
}
