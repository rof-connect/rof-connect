import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

/** min_status : 2 = joueuses sélectionnées seulement (tout sauf Prospect), 1 = tout le monde. */
export type DocumentGeneral = { id: string; titre: string; path: string; nom: string; min_status?: number };

const CLE = "documents_generaux";

/** Documents offerts à toutes les joueuses (liste stockée dans site_content, fichiers dans le bucket privé media). */
export async function chargerDocumentsGeneraux(): Promise<DocumentGeneral[]> {
  const { data } = await createAdminClient().from("site_content").select("value").eq("key", CLE).maybeSingle();
  try {
    const liste = JSON.parse(data?.value ?? "[]");
    return Array.isArray(liste) ? (liste as DocumentGeneral[]) : [];
  } catch {
    return [];
  }
}

export async function enregistrerDocumentsGeneraux(liste: DocumentGeneral[]) {
  await createAdminClient()
    .from("site_content")
    .upsert({ key: CLE, value: JSON.stringify(liste), updated_at: new Date().toISOString() }, { onConflict: "key" });
}
