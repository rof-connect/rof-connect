import { createAdminClient } from "@/lib/supabase/admin";
import { inscrireAthlete } from "./actions";
import Link from "next/link";

const POSITIONS = ["Lanceur·euse", "Receveur·euse", "1er but", "2e but", "3e but", "Arrêt-court", "Champ extérieur", "Utilitaire"];

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;
  const admin = createAdminClient();
  const { data: teams } = await admin
    .from("teams")
    .select("id, name, sport")
    .eq("archived", false)
    .order("name");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Royal On Field</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Inscription</h1>
      <p className="mt-2 text-sm text-rof-gris">
        Le courriel du parent ou du tuteur sert d&apos;identifiant de connexion. Tu commences avec le statut Prospect —
        ton entraîneur fera évoluer ton statut selon ton programme.
      </p>

      {erreur && (
        <div className="mt-4 rounded-lg bg-rof-rouge/10 px-3 py-2 text-sm text-rof-rouge">{erreur}</div>
      )}

      <form action={inscrireAthlete} className="mt-6 flex flex-col gap-4">
        <Champ label="Nom complet de l'athlète" name="full_name" required placeholder="Ex. : Bella Di Peco" />
        <Champ label="Courriel du parent ou du tuteur" name="email" type="email" required placeholder="parent@courriel.com" />
        <Champ label="Mot de passe" name="password" type="password" required minLength={8} />

        <div>
          <Etiquette texte="Équipe" />
          <select
            name="team_id"
            required
            className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
          >
            {(teams ?? []).map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <Champ label="Date de naissance" name="birth_date" type="date" />

        <div>
          <Etiquette texte="Position principale" />
          <select name="position" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
            <option value="">— Choisir —</option>
            {POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Etiquette texte="Lance" />
            <select name="throws" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
              <option value="">—</option>
              <option value="Droite">Droite</option>
              <option value="Gauche">Gauche</option>
            </select>
          </div>
          <div>
            <Etiquette texte="Frappe" />
            <select name="bats" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
              <option value="">—</option>
              <option value="Droite">Droite</option>
              <option value="Gauche">Gauche</option>
              <option value="Ambidextre">Ambidextre</option>
            </select>
          </div>
        </div>

        <Champ label="Nom du parent ou tuteur" name="guardian_name" placeholder="Ex. : Nick Di Peco" />
        <Champ label="Téléphone du parent ou tuteur" name="guardian_phone" type="tel" placeholder="Ex. : 450 555-1234" />
        <Champ label="Courriel du parent ou tuteur (si différent)" name="guardian_email" type="email" />
        <Champ label="Allergies / infos médicales" name="medical_notes" placeholder="Optionnel" />

        <label className="mt-1 flex items-start gap-2 text-sm text-rof-texte">
          <input type="checkbox" name="photo_consent" className="mt-0.5" />
          <span>J&apos;autorise Royal On Field à utiliser des photos et vidéos de l&apos;athlète à des fins promotionnelles.</span>
        </label>

        <button
          type="submit"
          className="mt-3 w-full rounded-xl bg-rof-or py-3 font-condensed text-lg font-bold uppercase tracking-wider text-white"
        >
          M&apos;inscrire
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-rof-gris">
        Déjà inscrit·e ? <Link href="/connexion" className="text-rof-poudre">Se connecter</Link>
      </p>
    </main>
  );
}

function Etiquette({ texte }: { texte: string }) {
  return <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-rof-gris">{texte}</p>;
}

function Champ({
  label,
  name,
  type = "text",
  required,
  placeholder,
  minLength,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
}) {
  return (
    <div>
      <Etiquette texte={label} />
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        minLength={minLength}
        className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte placeholder:text-rof-gris/60"
      />
    </div>
  );
}
