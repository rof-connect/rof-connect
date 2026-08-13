import { createAdminClient } from "@/lib/supabase/admin";
import { inscrireAthlete } from "./actions";
import Link from "next/link";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";

export default async function InscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const { erreur } = await searchParams;
  const { locale, t } = await getDictionnaire();
  const i = t.inscription;
  const admin = createAdminClient();
  const { data: teams } = await admin
    .from("teams")
    .select("id, name, sport")
    .eq("archived", false)
    .order("name");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 py-10">
      <div className="mb-2">
        <LanguageToggle locale={locale} />
      </div>
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Royal On Field</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{i.titre}</h1>
      <p className="mt-2 text-sm text-rof-gris">{i.intro}</p>

      {erreur && (
        <div className="mt-4 rounded-lg bg-rof-rouge/10 px-3 py-2 text-sm text-rof-rouge">{erreur}</div>
      )}

      <form action={inscrireAthlete} className="mt-6 flex flex-col gap-4">
        <Champ label={i.nomAthlete} name="full_name" required placeholder="Ex. : Bella Di Peco" />
        <Champ label={i.courrielParent} name="email" type="email" required placeholder="parent@courriel.com" />
        <Champ label={i.motDePasse} name="password" type="password" required minLength={8} />

        <div>
          <Etiquette texte={i.equipe} />
          <select
            name="team_id"
            required
            className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte"
          >
            {(teams ?? []).map((tm) => (
              <option key={tm.id} value={tm.id}>
                {tm.name}
              </option>
            ))}
          </select>
        </div>

        <Champ label={i.dateNaissance} name="birth_date" type="date" />

        <div>
          <Etiquette texte={i.position} />
          <select name="position" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
            <option value="">{i.choisir}</option>
            {i.positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Etiquette texte={i.lance} />
            <select name="throws" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
              <option value="">—</option>
              <option value="Droite">{i.droite}</option>
              <option value="Gauche">{i.gauche}</option>
            </select>
          </div>
          <div>
            <Etiquette texte={i.frappe} />
            <select name="bats" className="w-full rounded-lg border border-rof-ligne bg-rof-craie px-3 py-2 text-rof-texte">
              <option value="">—</option>
              <option value="Droite">{i.droite}</option>
              <option value="Gauche">{i.gauche}</option>
              <option value="Ambidextre">{i.ambidextre}</option>
            </select>
          </div>
        </div>

        <Champ label={i.nomParent} name="guardian_name" placeholder="Ex. : Nick Di Peco" />
        <Champ label={i.telParent} name="guardian_phone" type="tel" placeholder="Ex. : 450 555-1234" />
        <Champ label={i.courrielParentSiDifferent} name="guardian_email" type="email" />
        <Champ label={i.medical} name="medical_notes" placeholder={i.optionnel} />

        <label className="mt-1 flex items-start gap-2 text-sm text-rof-texte">
          <input type="checkbox" name="photo_consent" className="mt-0.5" />
          <span>{i.consentement}</span>
        </label>

        <button
          type="submit"
          className="mt-3 w-full rounded-xl bg-rof-or py-3 font-condensed text-lg font-bold uppercase tracking-wider text-white"
        >
          {i.minscrire}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-rof-gris">
        {i.dejaInscrit} <Link href="/connexion" className="text-rof-poudre">{i.seConnecter}</Link>
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
