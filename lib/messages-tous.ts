import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const CLES_MESSAGES = ["selection", "prospect", "general"] as const;
export type CleMessage = (typeof CLES_MESSAGES)[number];

export const MESSAGES_PAR_DEFAUT: Record<"fr" | "en", Record<CleMessage, string>> = {
  fr: {
    selection: "Félicitations pour votre sélection avec le Royal On Field !",
    prospect: "Merci de l'intérêt envers le programme. Un responsable prendra contact avec vous.",
    general: "",
  },
  en: {
    selection: "Congratulations on your selection with Royal On Field!",
    prospect: "Thank you for your interest in the program. A staff member will contact you.",
    general: "",
  },
};

/** Textes des « Messages à tous » (modifiables par la Direction), avec valeurs par défaut. */
export async function chargerMessagesTous(locale: "fr" | "en"): Promise<Record<CleMessage, string>> {
  const { data } = await createAdminClient()
    .from("site_content")
    .select("key, value")
    .like("key", "message_tous_%");
  const stock = new Map((data ?? []).map((r) => [r.key, r.value]));
  const res = { ...MESSAGES_PAR_DEFAUT[locale] };
  for (const cle of CLES_MESSAGES) {
    const v = stock.get(`message_tous_${cle}_${locale}`);
    if (v !== undefined) res[cle] = v;
  }
  return res;
}
