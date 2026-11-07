import { getDictionnaire } from "@/lib/i18n/server";
import { CarteHub } from "@/components/membres/CarteHub";

export default async function EquipePage() {
  const { t } = await getDictionnaire();
  const h = t.hubs;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-5 py-10">
      <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">{t.nav.espaceMembres}</p>
      <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">{h.equipeTitre}</h1>
      <div className="mt-6 flex flex-col gap-3">
        <CarteHub href="/membres/gc" titre={t.nav.gc} description={h.gcDesc} />
        <CarteHub titre={t.nav.videos} description={h.videosDesc} bientot={h.bientot} />
        <CarteHub titre={h.plansTitre} description={h.plansDesc} bientot={h.bientot} />
        <CarteHub titre={t.nav.signaux} description={h.signauxDesc} bientot={h.bientot} />
      </div>
    </main>
  );
}
