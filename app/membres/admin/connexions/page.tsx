import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const ROLES: Record<string, string> = { admin: "Direction", coach: "Entraîneur", member: "Membre" };

function ilYa(date: Date) {
  const min = Math.floor((Date.now() - date.getTime()) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 30) return `il y a ${j} jour${j > 1 ? "s" : ""}`;
  const m = Math.floor(j / 30);
  return `il y a ${m} mois`;
}

export default async function ConnexionsPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const { role: filtre } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: moi } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (moi?.role !== "admin") redirect("/membres");

  const admin = createAdminClient();
  const [{ data: profils }, utilisateurs] = await Promise.all([
    admin.from("profiles").select("id, full_name, email, role, parent_id"),
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  const derniere = new Map<string, string | null>();
  (utilisateurs.data?.users ?? []).forEach((u) => derniere.set(u.id, u.last_sign_in_at ?? null));

  // Les profils d'enfants (rattachés à un parent) n'ont pas de connexion propre : on les omet.
  const lignes = (profils ?? [])
    .filter((p) => !p.parent_id)
    .map((p) => ({ ...p, vue: derniere.get(p.id) ?? null }))
    .filter((p) => !filtre || p.role === filtre)
    .sort((a, b) => {
      if (a.vue && b.vue) return b.vue.localeCompare(a.vue);
      if (a.vue) return -1;
      if (b.vue) return 1;
      return (a.full_name ?? "").localeCompare(b.full_name ?? "", "fr");
    });

  const jamais = lignes.filter((l) => !l.vue).length;
  const chip = (valeur: string | undefined, label: string) => (
    <Link
      href={valeur ? `/membres/admin/connexions?role=${valeur}` : "/membres/admin/connexions"}
      className={`rounded-full border px-3 py-1 text-xs ${filtre === valeur || (!filtre && !valeur) ? "border-rof-or text-rof-or" : "border-rof-ligne text-rof-gris"}`}
    >
      {label}
    </Link>
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 px-5 py-10">
      <div>
        <Link href="/membres/admin" className="text-sm text-rof-poudre underline">
          ← Direction
        </Link>
        <h1 className="mt-3 font-condensed text-3xl font-bold uppercase text-rof-texte">Dernières connexions</h1>
        <p className="text-sm text-rof-gris">
          {lignes.length} compte{lignes.length > 1 ? "s" : ""} · {jamais} jamais connecté{jamais > 1 ? "s" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {chip(undefined, "Tous")}
        {chip("member", "Membres")}
        {chip("coach", "Entraîneurs")}
        {chip("admin", "Direction")}
      </div>

      <ul className="flex flex-col gap-2">
        {lignes.map((l) => {
          const d = l.vue ? new Date(l.vue) : null;
          return (
            <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-rof-ligne bg-rof-blanc px-4 py-3">
              <div className="min-w-0">
                <Link href={`/membres/admin/joueurs?id=${l.id}`} className="font-semibold text-rof-texte hover:text-rof-or">
                  {l.full_name || l.email || "—"}
                </Link>
                <span className="ml-2 rounded-md bg-rof-craie px-1.5 py-0.5 text-xs text-rof-gris">{ROLES[l.role] ?? l.role}</span>
              </div>
              <div className="text-right text-sm">
                {d ? (
                  <>
                    <span className="text-rof-texte">{ilYa(d)}</span>
                    <span className="block text-xs text-rof-gris">
                      {d.toLocaleString("fr-CA", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Toronto" })}
                    </span>
                  </>
                ) : (
                  <span className="text-rof-rouge">Jamais connecté</span>
                )}
              </div>
            </li>
          );
        })}
        {lignes.length === 0 && <li className="text-sm text-rof-gris">Aucun compte.</li>}
      </ul>
    </main>
  );
}
