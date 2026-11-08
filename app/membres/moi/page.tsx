import { createClient } from "@/lib/supabase/server";
import { getDictionnaire } from "@/lib/i18n/server";
import { CarteHub } from "@/components/membres/CarteHub";
import { FicheAthlete } from "@/components/membres/FicheAthlete";

export default async function MoiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user!.id;
  const { t, locale } = await getDictionnaire();
  const h = t.hubs;

  const [{ data: profile }, { data: athlete }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", uid).single(),
    supabase.from("team_members").select("team_id").eq("profile_id", uid).eq("role_in_team", "athlete").limit(1),
  ]);
  const estAthlete = (athlete ?? []).length > 0;
  const nom = profile?.full_name || user?.email || "";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-8">
      {estAthlete ? (
        <FicheAthlete client={supabase} profileId={uid} t={t} locale={locale} mode="moi" />
      ) : (
        <div>
          <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{h.moiTitre}</p>
          <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{nom}</h1>
        </div>
      )}

      <p className="mt-2 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">{t.fiche.autres}</p>
      <div className="flex flex-col gap-3">
        <CarteHub href="/membres/documents" titre={t.nav.documents} description={h.documentsDesc} />
        <CarteHub href="/membres/sondages" titre={t.nav.sondages} description={h.sondagesDesc} />
        {!estAthlete && <CarteHub href="/membres/parcours" titre={t.nav.parcours} description={h.parcoursDesc} />}
        <CarteHub href="/membres/contact" titre={t.nav.contact} description={h.contactDesc} />
      </div>
    </main>
  );
}
