"use client";

import { useEffect, useRef } from "react";

/**
 * Exécute un extrait de code (HTML + <script>) collé depuis GameChanger
 * (Outils → Create Scoreboard Widget). Un simple dangerouslySetInnerHTML
 * n'exécute jamais les balises <script> — on les recrée nous-mêmes via le
 * DOM pour que le navigateur les lance réellement.
 */
export function GameChangerEmbed({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conteneur = ref.current;
    if (!conteneur || !code) return;

    conteneur.innerHTML = "";
    const temp = document.createElement("div");
    temp.innerHTML = code;

    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const ancien = node as HTMLScriptElement;
        const script = document.createElement("script");
        Array.from(ancien.attributes).forEach((attr) => script.setAttribute(attr.name, attr.value));
        script.text = ancien.textContent ?? "";
        conteneur.appendChild(script);
      } else {
        conteneur.appendChild(node.cloneNode(true));
      }
    });
  }, [code]);

  return <div ref={ref} className="mt-3 overflow-hidden rounded-lg" />;
}
