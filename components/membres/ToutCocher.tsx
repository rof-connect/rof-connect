"use client";

import { useRef } from "react";

/** Coche ou décoche toutes les cases « profile_id » du formulaire qui contient ce bouton. */
export function ToutCocher({ className }: { className?: string }) {
  const bouton = useRef<HTMLButtonElement>(null);
  const basculer = () => {
    const form = bouton.current?.closest("form");
    if (!form) return;
    const cases = [...form.querySelectorAll<HTMLInputElement>('input[type="checkbox"][name="profile_id"]')];
    const toutes = cases.every((c) => c.checked);
    cases.forEach((c) => (c.checked = !toutes));
  };
  return (
    <button ref={bouton} type="button" onClick={basculer} className={className}>
      Tout cocher / décocher
    </button>
  );
}
