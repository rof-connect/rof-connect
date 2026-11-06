import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const CLE = "joueuses_archivees";

/** Identifiants des joueuses archivées (le compte et les données sont conservés, la joueuse peut toujours se connecter). */
export async function chargerArchivees(): Promise<Set<string>> {
  const { data } = await createAdminClient().from("site_content").select("value").eq("key", CLE).maybeSingle();
  try {
    const liste = JSON.parse(data?.value ?? "[]");
    return new Set(Array.isArray(liste) ? (liste as string[]) : []);
  } catch {
    return new Set();
  }
}

export async function definirArchivee(profileId: string, archivee: boolean) {
  const ids = await chargerArchivees();
  if (archivee) ids.add(profileId);
  else ids.delete(profileId);
  await createAdminClient()
    .from("site_content")
    .upsert({ key: CLE, value: JSON.stringify([...ids]), updated_at: new Date().toISOString() }, { onConflict: "key" });
}
