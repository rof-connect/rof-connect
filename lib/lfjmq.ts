import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { idGameChanger, lienGameChanger } from "@/lib/site-v2/donnees";

const FICHIER = "lfjmq.json"; // bucket privé « media » : widgets GameChanger de la bande de résultats (aucune migration nécessaire)

export type DivisionCle = "d1" | "d2" | "d3";
export const CLES_DIVISION: DivisionCle[] = ["d1", "d2", "d3"];

export type WidgetDivision = { widgetId: string; url: string };
export type DonneesLfjmq = { widgets: Record<DivisionCle, WidgetDivision> };

const vide = (): DonneesLfjmq => ({ widgets: { d1: { widgetId: "", url: "" }, d2: { widgetId: "", url: "" }, d3: { widgetId: "", url: "" } } });

export async function chargerLfjmq(): Promise<DonneesLfjmq> {
  const res = vide();
  const { data } = await createAdminClient().storage.from("media").download(FICHIER);
  if (!data) return res;
  try {
    const o = JSON.parse(await data.text());
    for (const k of CLES_DIVISION) {
      res.widgets[k] = { widgetId: idGameChanger(o?.widgets?.[k]?.widgetId), url: lienGameChanger(o?.widgets?.[k]?.url) };
    }
  } catch {
    /* fichier illisible : on repart du vide */
  }
  return res;
}

export async function sauverLfjmq(d: DonneesLfjmq) {
  await createAdminClient()
    .storage.from("media")
    .upload(FICHIER, new Blob([JSON.stringify(d)], { type: "application/json" }), { upsert: true, contentType: "application/json" });
}
