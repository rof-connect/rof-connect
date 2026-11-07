import { createClient } from "@/lib/supabase/server";
import { getDictionnaire } from "@/lib/i18n/server";
import { CarteHub } from "@/components/membres/CarteHub";

export default async function MoiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user!.id).single();

  const { t } = await getDictionnaire();
  const h = t.hubs;
  const nom = profile?.full_name || user?.email || "";
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x: string) => x[0]?.toUpperCase())
    .join("");

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{h.moiTitre}</p>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rof-royal-sombre font-condensed text-2xl font-bold text-rof-poudre">
          {initiales}
        </div>
        <h1 className="min-w-0 font-condensed text-3xl font-bold uppercase text-rof-texte">{nom}</h1>
      </div>
      <div className="mt-6 flex flex-col gap-3">
        <CarteHub href="/membres/parcours" titre={t.nav.parcours} description={h.parcoursDesc} />
        <CarteHub href="/membres/documents" titre={t.nav.documents} description={h.documentsDesc} />
        <CarteHub href="/membres/sondages" titre={t.nav.sondages} description={h.sondagesDesc} />
        <CarteHub href="/membres/contact" titre={t.nav.contact} description={h.contactDesc} />
      </div>
    </main>
  );
}
