import { comparerEquipes } from "@/lib/equipes";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { CarteDocument } from "@/components/membres/CarteDocument";
import { FormAjoutDocument } from "@/components/membres/FormAjoutDocument";
import { chargerDocumentsGeneraux } from "@/lib/documents-generaux";

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

  // Documents pour toute l'académie : la Direction et les entraîneurs voient tout ; une joueuse seulement si elle n'est plus Prospect (sauf document ouvert à tous).
  const { data: statuts } = await supabase
    .from("team_members")
    .select("status_id, role_in_team")
    .eq("profile_id", user!.id);
  const estStaff = estAdmin || (statuts ?? []).some((s) => s.role_in_team === "coach");
  const statutMax = Math.max(1, ...(statuts ?? []).filter((s) => s.role_in_team === "athlete").map((s) => s.status_id ?? 1));
  const generaux = (await chargerDocumentsGeneraux()).filter((d) => estStaff || statutMax >= (d.min_status ?? 2));
  const adminStorage = createAdminClient();
  const generauxAvecUrl = await Promise.all(
    generaux.map(async (d) => {
      const { data } = await adminStorage.storage.from("media").createSignedUrl(d.path, 60 * 60);
      return { ...d, urlSignee: data?.signedUrl ?? null };
    }),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-10 px-5 py-10">
      <div>
        <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Espace membres</p>
        <h1 className="mt-1 font-condensed text-3xl font-bold uppercase text-rof-texte">Documents</h1>
      </div>

      {(generauxAvecUrl.length > 0 || estAdmin) && (
        <section className="flex flex-col gap-4">
          <h2 className="font-condensed text-xl font-bold uppercase tracking-wide text-white">Pour toutes les joueuses</h2>
          {estAdmin && <FormAjoutDocument general />}
          <div className="flex flex-col gap-2">
            {generauxAvecUrl.map((d) => (
              <CarteDocument
                key={d.id}
                id={d.id}
                titre={d.titre}
                nomFichier={d.nom}
                urlSignee={d.urlSignee}
                cheminFichier={d.path}
                peutEditer={estAdmin}
                general
                etiquette={estAdmin ? ((d.min_status ?? 2) === 1 ? "Visible par tout le monde" : "Visible sauf Prospect") : undefined}
              />
            ))}
            {generauxAvecUrl.length === 0 && <p className="text-sm text-rof-gris">Aucun document pour le moment.</p>}
          </div>
        </section>
      )}

      {(memberships ?? []).length === 0 && generauxAvecUrl.length === 0 && (
        <p className="text-sm text-rof-gris">Aucune équipe assignée pour le moment.</p>
      )}

      {[...(memberships ?? [])]
        .sort((x, y) => {
          const nx = Array.isArray(x.teams) ? x.teams[0]?.name : (x.teams as { name: string } | null)?.name;
          const ny = Array.isArray(y.teams) ? y.teams[0]?.name : (y.teams as { name: string } | null)?.name;
          return comparerEquipes({ name: nx ?? "" }, { name: ny ?? "" });
        })
        .map((m) => {
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
    .select("id, title, body, created_at, recipient_ids")
    .eq("team_id", teamId)
    .eq("kind", "document")
    .order("created_at", { ascending: false });

  const admin = createAdminClient();

  let joueuses: { id: string; nom: string }[] = [];
  if (peutEditer) {
    const { data: athletes } = await admin
      .from("team_members")
      .select("profile_id, profiles (full_name)")
      .eq("team_id", teamId)
      .eq("role_in_team", "athlete");
    joueuses = (athletes ?? [])
      .map((a) => {
        const p = Array.isArray(a.profiles) ? a.profiles[0] : a.profiles;
        return { id: a.profile_id, nom: p?.full_name ?? "—" };
      })
      .sort((a, b) => a.nom.localeCompare(b.nom));
  }
  const nomParId = new Map(joueuses.map((j) => [j.id, j.nom]));

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

      {peutEditer && <FormAjoutDocument teamId={teamId} joueuses={joueuses} />}

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
            destinataires={
              peutEditer && d.recipient_ids ? d.recipient_ids.map((id: string) => nomParId.get(id) ?? "—") : null
            }
          />
        ))}
        {items.length === 0 && <p className="text-sm text-rof-gris">Aucun document pour le moment.</p>}
      </div>
    </section>
  );
}
