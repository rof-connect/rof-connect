"use client";

import { useState } from "react";
import { importerJoueurs } from "@/app/membres/admin/joueurs/actions";

const COLONNES = ["nom_athlete", "courriel_parent", "equipe", "statut", "date_naissance", "nom_parent", "telephone_parent"];

const GABARIT = [
  {
    nom_athlete: "Alex Tremblay",
    courriel_parent: "parent1@exemple.com",
    equipe: "Baseball 10U",
    statut: "Prospect",
    date_naissance: "2016-05-12",
    nom_parent: "Marie Tremblay",
    telephone_parent: "514-555-1234",
  },
  {
    nom_athlete: "Sam Roy",
    courriel_parent: "parent2@exemple.com",
    equipe: "Softball 14U",
    statut: "Mineur",
    date_naissance: "2012-09-03",
    nom_parent: "",
    telephone_parent: "",
  },
];

export function ImportJoueurs() {
  const [ouvert, setOuvert] = useState(false);
  const [lignes, setLignes] = useState<Record<string, string>[] | null>(null);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [resultat, setResultat] = useState<{ count: number; erreurs: string[] } | null>(null);

  async function telechargerGabarit() {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(GABARIT, { header: COLONNES });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "joueurs");
    XLSX.writeFile(wb, "rof-gabarit-joueurs.xlsx");
  }

  async function onFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur("");
    setResultat(null);
    try {
      const XLSX = await import("xlsx");
      const buf = await fichier.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const brut = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "", raw: false });
      const normalisees = brut.map((r) =>
        Object.fromEntries(COLONNES.map((c) => [c, String(r[c] ?? "").trim()])),
      );
      const valides = normalisees.filter((r) => r.nom_athlete && r.courriel_parent && r.equipe);
      if (valides.length === 0) {
        setErreur("Aucune ligne valide trouvée. Vérifie que les colonnes correspondent au gabarit.");
        setLignes(null);
        return;
      }
      setLignes(valides);
    } catch {
      setErreur("Impossible de lire le fichier. Formats acceptés : .xlsx, .xls, .csv");
      setLignes(null);
    }
  }

  async function importer() {
    if (!lignes) return;
    setEnCours(true);
    const res = await importerJoueurs(lignes);
    setEnCours(false);
    if (res.ok) {
      setResultat({ count: res.count, erreurs: res.erreurs });
      setLignes(null);
      if (res.erreurs.length === 0) setOuvert(false);
    } else {
      setErreur(res.erreurs[0] ?? "L'importation a échoué.");
    }
  }

  if (!ouvert) {
    return (
      <div className="flex flex-col gap-1">
        <button
          onClick={() => setOuvert(true)}
          className="w-fit rounded-lg border border-rof-poudre px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-poudre"
        >
          Importer depuis Excel
        </button>
        {resultat && (
          <div className="text-sm">
            <p className="text-rof-gazon">{resultat.count} joueur(s) importé(s).</p>
            {resultat.erreurs.map((e, i) => (
              <p key={i} className="text-rof-rouge">
                {e}
              </p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-rof-poudre bg-rof-carte-haut p-4">
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Import Excel / CSV — Joueurs</div>
      <p className="text-sm text-rof-gris">
        Colonnes attendues : {COLONNES.join(", ")}. Le nom d&apos;équipe doit correspondre exactement à une équipe
        active existante. Si le courriel n&apos;a pas encore de compte, une invitation lui sera envoyée automatiquement.
      </p>

      <button
        onClick={telechargerGabarit}
        className="w-fit rounded-lg bg-rof-craie px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-texte"
      >
        Télécharger le gabarit
      </button>

      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">Fichier (.xlsx, .xls, .csv)</p>
        <input
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={onFichier}
          className="w-full text-sm text-rof-gris file:mr-3 file:rounded-lg file:border-0 file:bg-rof-craie file:px-3 file:py-2 file:text-rof-texte"
        />
      </div>

      {erreur && <p className="text-sm text-rof-rouge">{erreur}</p>}
      {lignes && <p className="text-sm text-rof-gazon">{lignes.length} ligne(s) prête(s) à importer.</p>}

      <div className="flex gap-2">
        <button
          onClick={importer}
          disabled={!lignes || enCours}
          className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {enCours ? "Importation…" : "Importer"}
        </button>
        <button
          type="button"
          onClick={() => setOuvert(false)}
          className="rounded-lg border border-rof-ligne px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-gris"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}
