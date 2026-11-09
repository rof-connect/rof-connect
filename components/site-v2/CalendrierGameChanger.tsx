"use client";

import { useEffect, useId } from "react";

type GC = { team: { schedule: { init: (o: { target: string; widgetId: string; maxVerticalGamesVisible?: number }) => void } } };
declare global {
  interface Window {
    GC?: GC;
  }
}

const SDK = "https://widgets.gc.com/static/js/sdk.v1.js";

/** Calendrier des matchs de l'équipe : widget officiel GameChanger. */
export function CalendrierGameChanger({ widgetId }: { widgetId: string }) {
  const cible = "gc-" + useId().replace(/[^a-zA-Z0-9]/g, "");

  useEffect(() => {
    let annule = false;
    const demarrer = () => {
      if (annule || !window.GC) return;
      window.GC.team.schedule.init({ target: "#" + cible, widgetId, maxVerticalGamesVisible: 4 });
    };
    if (window.GC) {
      demarrer();
    } else {
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
    }
    return () => {
      annule = true;
    };
  }, [cible, widgetId]);

  return <div id={cible} className="gc-widget" aria-label="Calendrier des matchs GameChanger" />;
}
