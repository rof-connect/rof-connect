"use client";

import { useRef, useState, useTransition } from "react";
import { ajouterNouvelle } from "@/app/membres/nouvelles/actions";
import { compresserImage } from "@/lib/compress-image";

const TAILLE_MAX_PHOTO = 10 * 1024 * 1024;

export function FormAjoutNouvelle({ teamId }: { teamId: string }) {
  const [ouvert, setOuvert] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [apercu, setApercu] = useState<string | null>(null);
  const [compression, setCompression] = useState(false);
  const [erreur, setErreur] = useState("");
  const [enCours, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  async function onFichierChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    if (!fichier) return;
    if (fichier.size > TAILLE_MAX_PHOTO) {
      setErreur("La photo dépasse 10 Mo. Choisis une image plus légère.");
      return;
    }
    setErreur("");
    setCompression(true);
    try {
      const compressee = await compresserImage(fichier);
      setPhoto(compressee);
      setApercu(URL.createObjectURL(compressee));
    } finally {
      setCompression(false);
    }
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(formRef.current!);
    formData.delete("photo");
    if (photo) formData.set("photo", photo);
    startTransition(async () => {
      await ajouterNouvelle(formData);
      setOuvert(false);
      setPhoto(null);
      setApercu(null);
    });
  }

  if (!ouvert) {
    return (
      <button
        onClick={() => setOuvert(true)}
        className="w-fit rounded-lg border border-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-or"
      >
        + Ajouter une nouvelle
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      className="flex flex-col gap-3 rounded-xl border-2 border-dashed border-rof-or bg-rof-carte-haut p-4"
    >
      <div className="font-condensed text-lg font-bold uppercase tracking-wide text-white">Nouvelle nouvelle</div>
      <input type="hidden" name="team_id" value={teamId} />

      <Champ label="Titre" name="titre" required placeholder="Ex. : Championnes FPN Firecracker ! 👑" />
      <Champ label="Date" name="date" placeholder="Ex. : 6 juillet 2026" />

      <div>
        <Etiquette texte="Texte de la nouvelle" />
        <textarea
          name="texte"
          rows={4}
          placeholder="Raconte le moment : le pointage, les faits saillants, les félicitations…"
          className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
        />
      </div>

      <div>
        <Etiquette texte="Photo (max 10 Mo, compressée automatiquement)" />
        <input
          type="file"
          accept="image/*"
          onChange={onFichierChange}
          className="w-full text-sm text-rof-gris file:mr-3 file:rounded-lg file:border-0 file:bg-rof-craie file:px-3 file:py-2 file:text-rof-texte"
        />
        {compression && <p className="mt-1 text-xs text-rof-gris">Compression en cours…</p>}
        {erreur && <p className="mt-1 text-xs text-rof-rouge">{erreur}</p>}
        {apercu && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={apercu} alt="Aperçu" className="mt-2 max-h-40 rounded-lg object-cover" />
        )}
      </div>

      <Champ label="Lien vidéo (YouTube, Drive…)" name="video_url" placeholder="https://… (optionnel)" />

      <div>
        <Etiquette texte="Statut minimum requis pour voir" />
        <select name="min_status" defaultValue="1" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
          <option value="1">1 — Prospect (tout le monde)</option>
          <option value="2">2 — Mineur</option>
          <option value="3">3 — Majeur</option>
          <option value="4">4 — Intermédiaire</option>
          <option value="5">5 — Junior</option>
          <option value="6">6 — Senior</option>
          <option value="7">7 — JV</option>
          <option value="8">8 — Varsity</option>
        </select>
      </div>

      <div className="mt-1 flex gap-2">
        <button
          type="submit"
          disabled={enCours || compression}
          className="rounded-lg bg-rof-or px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {enCours ? "Publication…" : "Publier"}
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

function Etiquette({ texte }: { texte: string }) {
  return <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">{texte}</p>;
}

function Champ({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <Etiquette texte={label} />
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
      />
    </div>
  );
}
