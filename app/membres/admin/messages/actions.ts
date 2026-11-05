"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CLES_MESSAGES } from "@/lib/messages-tous";

export async function majMessagesTous(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return;

  const lignes = CLES_MESSAGES.flatMap((cle) =>
    (["fr", "en"] as const).map((langue) => ({
      key: `message_tous_${cle}_${langue}`,
      value: String(formData.get(`${cle}_${langue}`) ?? "").trim().slice(0, 1500),
      updated_at: new Date().toISOString(),
    })),
  );
  await createAdminClient().from("site_content").upsert(lignes, { onConflict: "key" });
  revalidatePath("/membres");
  revalidatePath("/membres/admin/messages");
}
