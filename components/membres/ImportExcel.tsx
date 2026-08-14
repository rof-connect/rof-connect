"use client";

import { useState } from "react";
import { MODELES_IMPORT } from "@/lib/import-templates";
import { importerLot } from "@/app/membres/import-actions";

type Kind = "agenda" | "news" | "plan" | "relay" | "video" | "gamechanger" | "signal";

const SLUG_VERS_KIND: Record<string, Kind> = {
  agenda: "agenda",
  nouvelles: "news",
  relais: "relay",
};

export function ImportExcel({ modeleSlug, teamId, accesDefaut }: { modeleSlug: string; teamId: string; accesDefaut: number }) {
  const modele = MODELES_IMPORT[modeleSlug];
  const kind = SLUG_VERS_KIND[modeleSlug];
  const [ouvert, setOuvert] = useState(false);
  const [lignes, setLignes] = useState<Record<string, string>[] | null>(null);
  const [erreur, setErreur] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [resultat, setResultat] = useState("");

  async function telechargerGabarit() {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(modele.gabarit, { header: modele.colonnes });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, modeleSlug.slice(0, 28));
    XLSX.writeFile(wb, `rof-gabarit-${modeleSlug}.xlsx`);
  }

  async function onFichier(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    setErreur("");
    setResultat("");
    try {
      const XLSX = await import("xlsx");
      const buf = await fichier.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: false });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const brut = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
      const mappees = brut.map(modele.mapper).filter(modele.valide);
      if (mappees.length === 0) {
        setErreur("Aucune ligne valide trouvée. Vérifie que les colonnes correspondent au gabarit.");
        setLignes(null);
        return;
      }
      setLignes(mappees);
    } catch {
      setErreur("Impossible de lire le fichier. Formats acceptés : .xlsx, .xls, .csv");
      setLignes(null);
    }
  }

  async function importer() {
    if (!lignes) return;
    setEnCours(true);
    const res = await importerLot(teamId, kind, accesDefaut, modele.titreChamp, lignes);
    setEnCours(false);
    if (res.ok) {
      setResultat(`${res.count} élément(s) importé(s).`);
      setLignes(null);
      setOuvert(false);
    } else {
      setErreur("L'importation a échoué.");
    }
  }

  if (!modele) return null;

  if (!ouvert) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => setOuvert(true)}
          className="w-fit rounded-lg border border-rof-poudre px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-poudre"
        >
          Importer depuis Excel
        </button>
        {resultat && <span className="text-sm text-rof-gazon">{resultat}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-rof-poudre bg-rof-carte-haut p-4">
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Import Excel / CSV</div>
      <p className="text-sm text-rof-gris">Colonnes attendues : {modele.colonnes.join(", ")}</p>

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
