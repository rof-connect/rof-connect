import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type Connexion = { id: string; nom: string; courriel: string; role: string; vue: string | null };

/** Comptes avec leur dernière connexion (la plus récente d'abord ; ceux jamais connectés à la fin). Les profils d'enfants sont omis. */
export async function chargerConnexions(): Promise<Connexion[]> {
  const admin = createAdminClient();
  const [{ data: profils }, utilisateurs] = await Promise.all([
    admin.from("profiles").select("id, full_name, email, role, parent_id"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);
  const derniere = new Map<string, string | null>();
  (utilisateurs.data?.users ?? []).forEach((u) => derniere.set(u.id, u.last_sign_in_at ?? null));

  return (profils ?? [])
    .filter((p) => !p.parent_id)
    .map((p) => ({ id: p.id, nom: p.full_name ?? "", courriel: p.email ?? "", role: p.role, vue: derniere.get(p.id) ?? null }))
    .sort((a, b) => {
      if (a.vue && b.vue) return b.vue.localeCompare(a.vue);
      if (a.vue) return -1;
      if (b.vue) return 1;
      return a.nom.localeCompare(b.nom, "fr");
    });
}

/** « il y a 3 h », « il y a 2 jours »… */
export function ilYa(iso: string) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 30) return `il y a ${j} jour${j > 1 ? "s" : ""}`;
  return `il y a ${Math.floor(j / 30)} mois`;
}
