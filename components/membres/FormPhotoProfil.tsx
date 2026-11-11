"use client";

import { useRef, useState, useTransition } from "react";
import { changerMaPhoto, retirerMaPhoto } from "@/app/membres/moi/actions";
import { compresserImage } from "@/lib/compress-image";
import { bouton } from "@/components/ui/boutons";

export function FormPhotoProfil({
  aPhoto,
  libelles,
}: {
  aPhoto: boolean;
  libelles: { changer: string; ajouter: string; retirer: string; illisible: string };
}) {
  const champ = useRef<HTMLInputElement>(null);
  const [enCours, startTransition] = useTransition();
  const [erreur, setErreur] = useState("");

  function onChoisi(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    setErreur("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("photo", await compresserImage(fichier, 600, 0.85));
        await changerMaPhoto(formData);
      } catch {
        setErreur(libelles.illisible);
      }
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
      <input ref={champ} type="file" accept="image/*" onChange={onChoisi} className="hidden" />
      <button type="button" disabled={enCours} onClick={() => champ.current?.click()} className={bouton("secondaire")}>
        {aPhoto ? libelles.changer : libelles.ajouter}
      </button>
      {aPhoto && (
        <button type="button" disabled={enCours} onClick={() => startTransition(() => retirerMaPhoto())} className={bouton("danger")}>
          {libelles.retirer}
        </button>
      )}
      {erreur && <span className="text-xs text-rof-rouge">{erreur}</span>}
    </div>
  );
}
