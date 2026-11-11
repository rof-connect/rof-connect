"use client";

import { useState, useTransition } from "react";
import { majOptionSondage, supprimerOptionSondage } from "@/app/membres/admin/sondages/actions";
import { compresserImage } from "@/lib/compress-image";
import { bouton } from "@/components/ui/boutons";

export function FormOptionSondage({
  optionId,
  label,
  imageUrl,
}: {
  optionId: string;
  label: string;
  imageUrl: string | null;
}) {
  const [enCours, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const photo = formData.get("photo") as File | null;
    startTransition(async () => {
      if (photo && photo.size > 0) {
        try {
          formData.set("photo", await compresserImage(photo, 1200, 0.82));
        } catch {
          setMessage("Image illisible.");
          return;
        }
      }
      await majOptionSondage(formData);
      setMessage("Enregistré.");
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-rof-ligne bg-rof-craie p-3">
      <form onSubmit={onSubmit} className="flex flex-col gap-2">
        <input type="hidden" name="option_id" value={optionId} />
        <div className="flex items-center gap-3">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={label} className="h-16 w-16 rounded-md object-cover" />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md border border-dashed border-rof-ligne text-xs text-rof-gris">
              Photo
            </div>
          )}
          <input
            name="label"
            defaultValue={label}
            required
            className="min-w-0 flex-1 rounded-lg border border-rof-ligne bg-rof-blanc px-3 py-2 text-sm text-rof-texte"
          />
        </div>
        <input
          type="file"
          name="photo"
          accept="image/*"
          className="text-xs text-rof-gris file:mr-3 file:rounded-lg file:border-0 file:bg-rof-blanc file:px-3 file:py-1 file:text-rof-texte"
        />
        <div className="flex items-center gap-3">
          <button type="submit" disabled={enCours} className={bouton("secondaire")}>
            {enCours ? "Envoi…" : "Enregistrer"}
          </button>
          {message && <span className="text-xs text-rof-gazon">{message}</span>}
        </div>
      </form>
      <form action={supprimerOptionSondage}>
        <input type="hidden" name="option_id" value={optionId} />
        <button type="submit" className={bouton("danger")}>
          Supprimer ce choix
        </button>
      </form>
    </div>
  );
}
