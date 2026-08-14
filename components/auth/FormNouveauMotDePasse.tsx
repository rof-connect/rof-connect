"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Dictionnaire } from "@/lib/i18n/dictionaries";

export function FormNouveauMotDePasse({ t }: { t: Dictionnaire["nouveauMotDePasse"] }) {
  const router = useRouter();
  const [pret, setPret] = useState(false);
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [succes, setSucces] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const code = new URLSearchParams(window.location.search).get("code");
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const accessToken = hash.get("access_token");
    const refreshToken = hash.get("refresh_token");

    (async () => {
      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      } else if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
        history.replaceState(null, "", window.location.pathname);
      }
      setPret(true);
    })();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");

    if (motDePasse.length < 6) {
      setErreur(t.erreurCourt);
      return;
    }
    if (motDePasse !== confirmation) {
      setErreur(t.erreurDifferent);
      return;
    }

    setEnCours(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: motDePasse });
    setEnCours(false);

    if (error) {
      setErreur(t.erreurGenerique);
      return;
    }

    setSucces(true);
    setTimeout(() => router.push("/connexion"), 2000);
  }

  if (succes) {
    return <p className="mt-6 text-center text-rof-gazon">{t.succes}</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex w-full flex-col gap-4">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">{t.motDePasse}</p>
        <input
          type="password"
          required
          minLength={6}
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
        />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">{t.confirmer}</p>
        <input
          type="password"
          required
          minLength={6}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
        />
      </div>

      {erreur && <p className="text-sm text-rof-rouge">{erreur}</p>}

      <button
        type="submit"
        disabled={!pret || enCours}
        className="mt-2 w-full rounded-xl bg-rof-or py-3 font-condensed text-lg font-bold uppercase tracking-wider text-white disabled:opacity-50"
      >
        {enCours ? "…" : t.valider}
      </button>
    </form>
  );
}
