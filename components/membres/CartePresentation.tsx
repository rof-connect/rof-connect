import { majMaPresentation, regenererMonLien } from "@/app/membres/presentation/actions";
import type { Presentation } from "@/lib/presentation";
import { LienPartage } from "@/components/membres/LienPartage";

const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte";

/** Réglages de la page de présentation partageable de la joueuse (carte de l'onglet Moi). */
export function CartePresentation({ reglages, lectureSeule = false }: { reglages: Presentation | null; lectureSeule?: boolean }) {
  const actif = reglages?.actif ?? false;

  return (
    <section className="rounded-xl border border-rof-ligne bg-rof-blanc p-4">
      <p className="font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">Ma page de présentation</p>
      <p className="mt-1 text-sm text-rof-gris">
        Une page professionnelle avec tes infos, que tu peux partager aux entraîneurs et recruteurs par un lien. Elle reste privée tant que tu ne
        l&apos;actives pas : seules les personnes qui ont le lien peuvent la voir.
      </p>

      {actif && reglages && (
        <div className="mt-3">
          {lectureSeule ? (
            <a href={`/joueuse/${reglages.token}`} target="_blank" rel="noopener noreferrer" className="text-sm text-rof-poudre underline">
              Voir sa page de présentation ↗
            </a>
          ) : (
            <LienPartage chemin={`/joueuse/${reglages.token}`} />
          )}
        </div>
      )}

      {lectureSeule ? (
        <ul className="mt-3 text-sm text-rof-texte">
          <li>Page {actif ? "activée" : "non activée"}</li>
          <li>Photo : {reglages?.photo ?? true ? "affichée" : "masquée"}</li>
          <li>Contact du parent : {reglages?.contact ? "affiché" : "masqué"}</li>
          {reglages?.apropos && <li className="mt-1 whitespace-pre-line text-rof-gris">{reglages.apropos}</li>}
        </ul>
      ) : (
      <form action={majMaPresentation} className="mt-4 flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm font-semibold text-rof-texte">
          <input type="checkbox" name="actif" defaultChecked={actif} /> Activer ma page de présentation
        </label>
        <label className="flex items-center gap-2 text-sm text-rof-texte">
          <input type="checkbox" name="photo" defaultChecked={reglages?.photo ?? true} /> Afficher ma photo de profil
        </label>
        <label className="flex items-center gap-2 text-sm text-rof-texte">
          <input type="checkbox" name="contact" defaultChecked={reglages?.contact ?? false} /> Afficher le contact de mon parent / tuteur
        </label>
        <label className="flex flex-col gap-1 text-xs text-rof-gris">
          À propos de moi (facultatif, 600 caractères)
          <textarea name="apropos" rows={4} maxLength={600} defaultValue={reglages?.apropos ?? ""} className={champ} />
        </label>
        <p className="text-xs text-rof-gris">
          La page montre ton nom, tes positions, ton équipe, tes liens (FieldLevel, Instagram, YouTube, X) et ce que tu coches ci-dessus. Elle ne
          montre jamais ta date de naissance, tes notes médicales ni tes courriels, sauf le contact si tu le coches.
        </p>
        <button type="submit" className="self-start rounded-full bg-rof-royal px-5 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-white">
          Enregistrer
        </button>
      </form>
      )}

      {reglages && !lectureSeule && (
        <form action={regenererMonLien} className="mt-3">
          <button type="submit" className="text-xs text-rof-rouge underline">
            Créer un nouveau lien (l&apos;ancien cessera de fonctionner)
          </button>
        </form>
      )}
    </section>
  );
}
