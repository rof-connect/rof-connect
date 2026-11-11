"use client";

import { useState, useTransition } from "react";
import { majImageSondage } from "@/app/membres/admin/sondages/actions";
import { compresserImage } from "@/lib/compress-image";
import { bouton } from "@/components/ui/boutons";

export function FormImageSondage({ pollId, imageUrl }: { pollId: string; imageUrl: string | null }) {
  const [enCours, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const photo = formData.get("photo") as File | null;
    if (!photo || photo.size === 0) {
      setMessage("Choisis une image.");
      return;
    }
    startTransition(async () => {
      try {
        formData.set("photo", await compresserImage(photo, 1600, 0.85));
      } catch {
        setMessage("Image illisible.");
        return;
      }
      await majImageSondage(formData);
      setMessage("Image enregistrée.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2 rounded-lg border border-rof-ligne bg-rof-craie p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-rof-gris">Image du sondage (affichée en haut)</p>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imageUrl} alt="" className="max-h-48 w-fit rounded-md" />
      )}
      <input type="hidden" name="poll_id" value={pollId} />
      <input
        type="file"
        name="photo"
        accept="image/*"
        className="text-xs text-rof-gris file:mr-3 file:rounded-lg file:border-0 file:bg-rof-blanc file:px-3 file:py-1 file:text-rof-texte"
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={enCours} className={bouton("secondaire")}>
          {enCours ? "Envoi…" : "Enregistrer l'image"}
        </button>
        {message && <span className="text-xs text-rof-gazon">{message}</span>}
      </div>
    </form>
  );
}
