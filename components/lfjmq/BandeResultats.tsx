"use client";

import { useEffect, useId, useRef, useState } from "react";
import { OPTIONS_DIVISION, RESULTATS } from "@/lib/lfjmq-saison";

type GC = { team: { schedule: { init: (o: { target: string; widgetId: string; maxVerticalGamesVisible?: number }) => void } } };
declare global {
  interface Window {
    GC?: GC;
  }
}

const SDK = "https://widgets.gc.com/static/js/sdk.v1.js";
const CLE = "lfjmq-div";

type Props = { widgets: Record<string, { widgetId: string; url: string }> };

/** Bande de résultats du haut : changer de division change les résultats (widget GameChanger de la division, sinon derniers résultats saisis). */
export function BandeResultats({ widgets }: Props) {
  const [division, setDivision] = useState("d1");
  const liste = useRef<HTMLDivElement>(null);
  const cible = "gc-" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const widget = widgets[division]?.widgetId ?? "";
  const lien = widgets[division]?.url || "";
  const parties = RESULTATS[division] ?? [];

  useEffect(() => {
    try {
      const v = localStorage.getItem(CLE);
      if (v && OPTIONS_DIVISION.some((o) => o.cle === v)) requestAnimationFrame(() => setDivision(v)); // division choisie lors de la dernière visite
    } catch {
      /* navigation privée */
    }
  }, []);

  useEffect(() => {
    if (!widget) return;
    let annule = false;
    const demarrer = () => {
      if (annule || !window.GC) return;
      const el = document.getElementById(cible);
      if (el) el.innerHTML = "";
      window.GC.team.schedule.init({ target: "#" + cible, widgetId: widget, maxVerticalGamesVisible: 4 });
    };
    if (window.GC) {
      demarrer();
      return () => {
        annule = true;
      };
    }
    let script = document.querySelector<HTMLScriptElement>(`script[src="${SDK}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = SDK;
      script.async = true;
      document.body.appendChild(script);
    }
    script.addEventListener("load", demarrer);
    return () => {
      annule = true;
      script?.removeEventListener("load", demarrer);
    };
  }, [widget, division, cible]);

  const changer = (v: string) => {
    setDivision(v);
    try {
      localStorage.setItem(CLE, v);
    } catch {
      /* navigation privée */
    }
  };

  const defiler = () => {
    const reduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    liste.current?.scrollBy({ left: (liste.current?.clientWidth ?? 300) * 0.8, behavior: reduit ? "auto" : "smooth" });
  };

  return (
    <div className="tick" role="region" aria-label="Résultats récents">
      <div className="wrap">
        <label className="sel">
          <span className="sr">Division</span>
          <select value={division} onChange={(e) => changer(e.target.value)}>
            {OPTIONS_DIVISION.map((o) => (
              <option key={o.cle} value={o.cle}>
                {o.nom}
              </option>
            ))}
          </select>
        </label>
        <div className="games" ref={liste} tabIndex={0}>
          {widget ? (
            <div className="gcw" id={cible} />
          ) : parties.length ? (
            <>
              {parties.map((p) => {
                const aGagne = p.a[1] > p.b[1];
                return (
                  <article className="g" key={p.a[0] + p.b[0] + p.d}>
                    <div className="st">
                      <span>{p.st}</span>
                      <span>{p.d}</span>
                    </div>
                    <div className={`r${aGagne ? " w" : ""}`}>
                      <span>{p.a[0]}</span>
                      <b>{p.a[1]}</b>
                    </div>
                    <div className={`r${aGagne ? "" : " w"}`}>
                      <span>{p.b[0]}</span>
                      <b>{p.b[1]}</b>
                    </div>
                  </article>
                );
              })}
              <div className="g msg">Saison 2027 : début en mai</div>
            </>
          ) : (
            <div className="g msg">Aucun résultat pour l&apos;instant. La saison commence en mai.</div>
          )}
        </div>
        <div className="nav">
          <button type="button" onClick={defiler} aria-label="Résultats suivants">
            ›
          </button>
        </div>
        <a className="all" href={widget && lien ? lien : "#classement"} {...(widget && lien ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
          Tous les résultats
        </a>
      </div>
    </div>
  );
}
