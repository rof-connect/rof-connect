import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CarteDocument } from "@/components/membres/CarteDocument";
import { FormAjoutDocument } from "@/components/membres/FormAjoutDocument";

type DocumentBody = {
  fichier_path?: string | null;
  fichier_nom?: string | null;
};

export default async function DocumentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";

  const { data: memberships } = await supabase
    .from("team_members")
    .select("team_id, role_in_team, teams!inner (id, name)")
    .eq("profile_id", user!.id)
    .eq("teams.archived", false);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Documents</h1>
      </div>

      {(memberships ?? []).length === 0 && (
        <p className="text-sm text-rof-gris">Aucune équipe assignée pour le moment.</p>
      )}

      {(memberships ?? []).map((m) => {
        const team = Array.isArray(m.teams) ? m.teams[0] : m.teams;
        const peutEditer = estAdmin || m.role_in_team === "coach";
        return (
          <EquipeDocuments key={m.team_id} teamId={m.team_id} teamName={team?.name ?? ""} peutEditer={peutEditer} />
        );
      })}
    </main>
  );
}

async function EquipeDocuments({
  teamId,
  teamName,
  peutEditer,
}: {
  teamId: string;
  teamName: string;
  peutEditer: boolean;
}) {
  const supabase = await createClient();

  const { data: documents } = await supabase
    .from("contents")
    .select("id, title, body, created_at")
    .eq("team_id", teamId)
    .eq("kind", "document")
    .order("created_at", { ascending: false });

  const admin = createAdminClient();
  const items = await Promise.all(
    (documents ?? []).map(async (d) => {
      const body = (d.body ?? {}) as DocumentBody;
      let urlSignee: string | null = null;
      if (body.fichier_path) {
        const { data } = await admin.storage.from("media").createSignedUrl(body.fichier_path, 60 * 60);
        urlSignee = data?.signedUrl ?? null;
      }
      return { ...d, body, urlSignee };
    }),
  );

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-white">{teamName}</h2>

      {peutEditer && <FormAjoutDocument teamId={teamId} />}

      <div className="flex flex-col gap-2">
        {items.map((d) => (
          <CarteDocument
            key={d.id}
            id={d.id}
            titre={d.title}
            nomFichier={d.body.fichier_nom ?? null}
            urlSignee={d.urlSignee}
            cheminFichier={d.body.fichier_path ?? null}
            peutEditer={peutEditer}
          />
        ))}
        {items.length === 0 && <p className="text-sm text-rof-gris">Aucun document pour le moment.</p>}
      </div>
    </section>
  );
}
