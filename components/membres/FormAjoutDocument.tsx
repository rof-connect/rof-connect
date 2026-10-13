"use client";

import { useState, useTransition } from "react";
import { ajouterDocument } from "@/app/membres/documents/actions";

const TAILLE_MAX_PDF = 20 * 1024 * 1024;

export function FormAjoutDocument({ teamId, joueuses }: { teamId: string; joueuses: { id: string; nom: string }[] }) {
  const [destination, setDestination] = useState<"equipe" | "joueuses">("equipe");
  const [ouvert, setOuvert] = useState(false);
  const [erreur, setErreur] = useState("");
  const [enCours, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErreur("");
    const formData = new FormData(e.currentTarget);
    const fichier = formData.get("fichier") as File | null;
    if (!fichier || fichier.size === 0) {
      setErreur("Choisis un fichier PDF.");
      return;
    }
    if (fichier.type !== "application/pdf") {
      setErreur("Seuls les fichiers PDF sont acceptés.");
      return;
    }
    if (fichier.size > TAILLE_MAX_PDF) {
      setErreur("Le fichier dépasse 20 Mo.");
      return;
    }
    if (formData.get("destination") === "joueuses" && formData.getAll("destinataires").length === 0) {
      setErreur("Choisis au moins une joueuse.");
      return;
    }
    startTransition(async () => {
      await ajouterDocument(formData);
      setOuvert(false);
    });
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="w-fit rounded-lg border border-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-or"
      >
        + Ajouter un document
      </button>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-rof-or bg-rof-carte-haut p-4"
    >
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Nouveau document</div>
      <input type="hidden" name="team_id" value={teamId} />

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Titre</p>
        <input
          name="titre"
          required
          placeholder="Ex. : Formulaire de consentement photo"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Fichier PDF (max 20 Mo)</p>
        <input
          type="file"
          name="fichier"
          accept="application/pdf"
          className="w-full text-sm text-rof-gris file:mr-3 file:rounded-lg file:border-0 file:bg-rof-craie file:px-3 file:py-2 file:text-rof-texte"
        />
        {erreur && <p className="mt-1 text-xs text-rof-rouge">{erreur}</p>}
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Partager avec</p>
        <select
          name="destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value as "equipe" | "joueuses")}
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
        >
          <option value="equipe">Toute l&apos;équipe</option>
          <option value="joueuses">Certaines joueuses seulement</option>
        </select>
      </div>

      {destination === "joueuses" ? (
        <div>
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Joueuses destinataires</p>
          <div className="flex max-h-48 flex-col gap-1 overflow-y-auto rounded-lg border border-rof-ligne bg-rof-craie p-2">
            {joueuses.map((j) => (
              <label key={j.id} className="flex items-center gap-2 text-sm text-rof-texte">
                <input type="checkbox" name="destinataires" value={j.id} /> {j.nom}
              </label>
            ))}
            {joueuses.length === 0 && <p className="text-sm text-rof-gris">Aucune joueuse dans cette équipe.</p>}
          </div>
        </div>
      ) : (
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Statut minimum requis pour voir</p>
        <select
          name="min_status"
          defaultValue="1"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
        >
          <option value="1">1 — Prospect (tout le monde)</option>
          <option value="2">2 — 9U</option>
          <option value="3">3 — 10U</option>
          <option value="4">4 — 11U</option>
          <option value="5">5 — 12U</option>
          <option value="6">6 — 13U</option>
          <option value="7">7 — 14U</option>
          <option value="8">8 — 15U</option>
          <option value="9">9 — 16U</option>
          <option value="10">10 — 17U</option>
          <option value="11">11 — 18U</option>
        </select>
      </div>
      )}

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          disabled={enCours}
          className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {enCours ? "Envoi…" : "Publier"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-lg border border-rof-ligne px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-gris"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
