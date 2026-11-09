import { createClient } from "@/lib/supabase/server";
import { getDictionnaire } from "@/lib/i18n/server";
import { CarteHub } from "@/components/membres/CarteHub";
import { FicheAthlete } from "@/components/membres/FicheAthlete";
import { FormPhotoProfil } from "@/components/membres/FormPhotoProfil";
import { urlPhotoProfil } from "@/lib/photo-profil";
import { parcoursOuvert } from "@/lib/statuts";

export default async function MoiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const uid = user!.id;
  const { t, locale } = await getDictionnaire();
  const h = t.hubs;

  const [{ data: profile }, { data: roles }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", uid).single(),
    supabase.from("team_members").select("role_in_team").eq("profile_id", uid),
  ]);
  // Joueuse = dans une équipe comme athlète, ou membre sans équipe (Prospect) qui n'est pas entraîneur.
  const estEntraineur = (roles ?? []).some((r) => r.role_in_team === "coach");
  const estAthlete = (roles ?? []).some((r) => r.role_in_team === "athlete") || (profile?.role === "member" && !estEntraineur);
  const photoUrl = estAthlete ? null : await urlPhotoProfil(uid);
  const peutParcours = profile?.role !== "member" || (await parcoursOuvert(uid));
  const nom = profile?.full_name || user?.email || "";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-8">
      {estAthlete ? (
        <FicheAthlete client={supabase} profileId={uid} t={t} locale={locale} mode="moi" />
      ) : (
        <div>
          <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{h.moiTitre}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-rof-or bg-rof-royal-sombre font-condensed text-2xl font-bold text-rof-poudre">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt={nom} className="h-full w-full object-cover" />
              ) : (
                nom.split(/\s+/).filter(Boolean).slice(0, 2).map((x: string) => x[0]?.toUpperCase()).join("")
              )}
            </div>
            <h1 className="font-condensed text-3xl font-bold uppercase leading-none text-rof-texte">{nom}</h1>
          </div>
          <FormPhotoProfil
            aPhoto={Boolean(photoUrl)}
            libelles={{ changer: t.fiche.changerPhoto, ajouter: t.fiche.ajouterPhoto, retirer: t.fiche.retirerPhoto, illisible: t.fiche.photoIllisible }}
          />
        </div>
      )}

      <p className="mt-2 font-condensed text-xs font-bold uppercase tracking-[0.2em] text-rof-gris">{t.fiche.autres}</p>
      <div className="flex flex-col gap-3">
        <CarteHub href="/membres/documents" titre={t.nav.documents} description={h.documentsDesc} />
        <CarteHub href="/membres/sondages" titre={t.nav.sondages} description={h.sondagesDesc} />
        {!estAthlete && peutParcours && <CarteHub href="/membres/parcours" titre={t.nav.parcours} description={h.parcoursDesc} />}
        <CarteHub href="/membres/contact" titre={t.nav.contact} description={h.contactDesc} />
      </div>
    </main>
  );
}
