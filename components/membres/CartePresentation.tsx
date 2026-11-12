import { majMaPresentation, regenererMonLien } from "@/app/membres/presentation/actions";
import type { Presentation } from "@/lib/presentation";
import { LienPartage } from "@/components/membres/LienPartage";
import { evenementsEnTexte, mesuresEnTexte } from "@/lib/presentation-format";
import { bouton } from "@/components/ui/boutons";

const champ = "w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-sm text-rof-texte";

/** Réglages de la page de présentation partageable de la joueuse (carte de l'onglet Moi). */
export function CartePresentation({ reglages, lectureSeule = false }: { reglages: Presentation | null; lectureSeule?: boolean }) {
  const actif = reglages?.actif ?? false;
  const p = reglages?.profil ?? {};

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
            <a href={`/joueuse/${reglages.token}`} target="_blank" rel="noopener noreferrer" className={bouton("secondaire")}>
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
        {!reglages?.consentement_le && (
          <label className="flex items-start gap-2 rounded-lg border border-rof-or p-3 text-sm text-rof-texte">
            <input type="checkbox" name="consentement" className="mt-0.5" />
            <span>
              J&apos;autorise la publication de ma page de présentation (nom, positions, équipe, liens et ce que je coche ci-dessous). Si j&apos;ai moins de 18 ans, mon
              parent ou tuteur y consent. Je peux la désactiver ou changer le lien en tout temps.
            </span>
          </label>
        )}
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

        <p className="mt-2 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-or">Ma fiche de recrutement (tout est facultatif)</p>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Taille
            <input name="taille" defaultValue={p.taille ?? ""} placeholder={"5'8\" ou 173 cm"} className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Poids
            <input name="poids" defaultValue={p.poids ?? ""} placeholder="140 lb ou 64 kg" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            École secondaire
            <input name="ecole" defaultValue={p.ecole ?? ""} className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Ville
            <input name="ville" defaultValue={p.ville ?? ""} placeholder="Repentigny, QC" className={champ} />
          </label>
          <label className="flex items-start gap-2 text-xs text-rof-gris sm:col-span-2">
            <input type="checkbox" name="afficher_ecole_ville" defaultChecked={p.afficherEcoleVille === true} className="mt-0.5 h-4 w-4" />
            <span>Afficher mon école et ma ville sur le site public (sinon, l&apos;alignement de l&apos;équipe affichera « — »).</span>
          </label>
          <label className="flex items-start gap-2 text-xs text-rof-gris sm:col-span-2">
            <input type="checkbox" name="masquer_site" defaultChecked={p.masquerSite === true} className="mt-0.5 h-4 w-4" />
            <span>Masquer mon profil du site public (je n&apos;apparais ni dans l&apos;alignement de l&apos;équipe, ni avec une page à mon nom).</span>
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Année de graduation (grad year)
            <input name="grad" inputMode="numeric" maxLength={4} defaultValue={p.grad ?? ""} placeholder="Ex. : 2027" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Moyenne scolaire
            <input name="moyenne" defaultValue={p.moyenne ?? ""} placeholder="Ex. : 85 %" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Langue
            <input name="anglais" defaultValue={p.anglais ?? ""} placeholder="Ex. : Français, anglais" className={champ} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs text-rof-gris">
          Domaine d&apos;études visé
          <input name="domaine" defaultValue={p.domaine ?? ""} placeholder="Ex. : Kinésiologie" className={champ} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Exit Velo
            <input name="exit_velo" defaultValue={p.exitVelo ?? ""} placeholder="Ex. : 68 mi/h" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Pitching Velo
            <input name="pitching_velo" defaultValue={p.pitchingVelo ?? ""} placeholder="Ex. : 62 mi/h" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Course 60&apos;
            <input name="course_60" defaultValue={p.course60 ?? ""} placeholder="Ex. : 8,4 s" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Pop Time (receveuse)
            <input name="pop_time" defaultValue={p.popTime ?? ""} placeholder="Ex. : 1,85 s" className={champ} />
          </label>
        </div>
        <label className="flex flex-col gap-1 text-xs text-rof-gris">
          Autres mesures athlétiques (une par ligne : « Libellé : valeur »)
          <textarea name="mesures" rows={4} defaultValue={mesuresEnTexte(p.mesures)} placeholder={"Vitesse de lancer : 62 mi/h\n60 verges : 8,4 s\nTemps de réception au 2e but : 1,85 s"} className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-rof-gris">
          Réalisations et honneurs (un par ligne)
          <textarea name="realisations" rows={4} defaultValue={(p.realisations ?? []).join("\n")} placeholder={"Championne provinciale 2026\nÉquipe étoile du tournoi"} className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-rof-gris">
          Vidéo de présentation (lien YouTube)
          <input name="video" defaultValue={p.video ? `https://youtu.be/${p.video}` : ""} placeholder="https://youtu.be/…" className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-rof-gris">
          Calendrier de matchs et compétitions (un par ligne : « AAAA-MM-JJ | Nom | Lieu »)
          <textarea name="evenements" rows={4} defaultValue={evenementsEnTexte(p.evenements)} placeholder={"2027-06-12 | Tournoi Perfect Game | Taylor, MI"} className={champ} />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Référence (entraîneur)
            <input name="ref_nom" defaultValue={p.reference?.nom ?? ""} className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Rôle
            <input name="ref_role" defaultValue={p.reference?.role ?? ""} placeholder="Entraîneur-chef" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-rof-gris">
            Contact
            <input name="ref_contact" defaultValue={p.reference?.contact ?? ""} className={champ} />
          </label>
        </div>
        <p className="text-xs text-rof-gris">
          La page montre ton nom, tes positions, ton équipe, tes liens (FieldLevel, Instagram, YouTube, X) et ce que tu coches ci-dessus. Elle ne
          montre jamais ta date de naissance, tes notes médicales ni tes courriels, sauf le contact si tu le coches.
        </p>
        <button type="submit" className={`${bouton("accent", "md")} self-start`}>
          Enregistrer
        </button>
      </form>
      )}

      {reglages && !lectureSeule && (
        <form action={regenererMonLien} className="mt-3">
          <button type="submit" className={bouton("danger")}>
            Créer un nouveau lien (l&apos;ancien cessera de fonctionner)
          </button>
        </form>
      )}
    </section>
  );
}
