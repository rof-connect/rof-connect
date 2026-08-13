"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SECTIONS, type SectionConfig } from "@/lib/section-config";

const CHAMPS_RESERVES = new Set(["team_id", "kind", "title", "min_status", "slug"]);

export async function ajouterContenu(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const config: SectionConfig | undefined = SECTIONS[slug];
  if (!config) return;

  const teamId = String(formData.get("team_id") ?? "");
  const minStatus = Number(formData.get("min_status") ?? config.accesDefaut);
  const title = String(formData.get(config.titreChamp) ?? "").trim();
  if (!teamId || !title) return;

  const body: Record<string, string> = {};
  for (const champ of config.champs) {
    const v = String(formData.get(champ.name) ?? "").trim();
    if (v) body[champ.name] = v;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("contents").insert({
    team_id: teamId,
    kind: config.kind,
    min_status: minStatus,
    title,
    created_by: user.id,
    body,
  });

  revalidatePath(`/membres/${slug}`);
}

export async function supprimerContenu(formData: FormData) {
  const slug = String(formData.get("slug") ?? "");
  const contentId = String(formData.get("content_id") ?? "");
  if (!contentId) return;

  const supabase = await createClient();
  await supabase.from("contents").delete().eq("id", contentId);

  revalidatePath(`/membres/${slug}`);
}
