"use client";

import { useRef, useState, useTransition } from "react";
import { changerPhotoJoueuse } from "@/app/membres/admin/joueurs/actions";
import { compresserImage } from "@/lib/compress-image";

/** Direction : ajouter ou remplacer la photo d'une joueuse. */
export function FormPhotoJoueuse({ profileId }: { profileId: string }) {
  const champ = useRef<HTMLInputElement>(null);
  const [enCours, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function onChoisi(e: React.ChangeEvent<HTMLInputElement>) {
    const fichier = e.target.files?.[0];
    e.target.value = "";
    if (!fichier) return;
    setMessage("");
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("profile_id", profileId);
        formData.set("photo", await compresserImage(fichier, 900, 0.85));
        await changerPhotoJoueuse(formData);
        setMessage("Photo enregistrée.");
      } catch {
        setMessage("Image illisible.");
      }
    });
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
      <input ref={champ} type="file" accept="image/*" onChange={onChoisi} className="hidden" />
      <button type="button" disabled={enCours} onClick={() => champ.current?.click()} className="text-rof-poudre underline disabled:opacity-50">
        {enCours ? "Envoi…" : "Ajouter / changer la photo de la joueuse"}
      </button>
      {message && <span className="text-rof-gris">{message}</span>}
    </div>
  );
}
