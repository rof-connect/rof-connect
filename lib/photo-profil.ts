import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export const cheminPhotoProfil = (profileId: string) => `avatars/${profileId}.jpg`;

/** URL signée (1 h) de la photo de profil d'une joueuse, ou null si elle n'en a pas. */
export async function urlPhotoProfil(profileId: string): Promise<string | null> {
  const { data, error } = await createAdminClient().storage.from("media").createSignedUrl(cheminPhotoProfil(profileId), 60 * 60);
  return error ? null : (data?.signedUrl ?? null);
}
