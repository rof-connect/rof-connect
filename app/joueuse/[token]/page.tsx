import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { trouverParToken } from "@/lib/presentation";
import { liensDe } from "@/lib/liens-sociaux";
import { urlPhotoProfil } from "@/lib/photo-profil";

// Page privée par lien secret : jamais indexée par les moteurs de recherche.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const { token } = await params;
  const trouve = await trouverParToken(token);
  let nom = "Joueuse";
  if (trouve) {
    const { data } = await createAdminClient().from("profiles").select("full_name").eq("id", trouve.profileId).single();
    nom = data?.full_name || nom;
  }
  return {
    title: `${nom} | Royal On Field`,
    robots: { index: false, follow: false, nocache: true },
  };
}

type Fiche = {
  position: string | null;
  throws: string | null;
  bats: string | null;
  fieldlevel_url: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  guardian_email: string | null;
};

export default async function PagePresentation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trouve = await trouverParToken(token);
  if (!trouve) notFound();
  const { profileId, reglages } = trouve;

  const admin = createAdminClient();
  const [{ data: profil }, { data: fiche }, { data: equipes }, { data: bilan }, liens, photoUrl] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", profileId).single(),
    admin
      .from("athlete_details")
      .select("position, throws, bats, fieldlevel_url, guardian_name, guardian_phone, guardian_email")
      .eq("profile_id", profileId)
      .maybeSingle(),
    admin.from("team_members").select("teams!inner (name, sport, archived)").eq("profile_id", profileId).eq("role_in_team", "athlete").eq("teams.archived", false),
    admin.from("parcours_demandes").select("reponses").eq("profile_id", profileId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    liensDe(profileId),
    reglages.photo ? urlPhotoProfil(profileId) : Promise.resolve(null),
  ]);

  const nom = profil?.full_name || "Joueuse";
  const f = (fiche ?? {}) as Partial<Fiche>;
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x: string) => x[0]?.toUpperCase())
    .join("");
  const positions = (f.position ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  const nomsEquipes = (equipes ?? []).map((e) => {
    const t = (Array.isArray(e.teams) ? e.teams[0] : e.teams) as { name: string } | null;
    return t?.name;
  }).filter(Boolean) as string[];
  const fin = Number((bilan?.reponses as { fin?: number } | null)?.fin);
  const promotion = Number.isInteger(fin) && fin > 2000 ? String(fin) : "";

  const faits = [
    f.throws ? ["Lance", f.throws] : null,
    f.bats ? ["Frappe", f.bats] : null,
    promotion ? ["Promotion", promotion] : null,
  ].filter(Boolean) as string[][];

  const boutons = [
    f.fieldlevel_url ? ["FieldLevel", f.fieldlevel_url] : null,
    liens.instagram ? ["Instagram", liens.instagram] : null,
    liens.youtube ? ["YouTube", liens.youtube] : null,
    liens.x ? ["X", liens.x] : null,
  ].filter(Boolean) as string[][];

  const contact = reglages.contact ? [f.guardian_name, f.guardian_phone, f.guardian_email].filter(Boolean) : [];

  return (
    <main className="min-h-screen bg-rof-noir text-rof-texte">
      <header className="border-b border-rof-ligne">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
          <span className="font-condensed text-sm font-bold uppercase tracking-[0.3em] text-rof-or">Royal On Field</span>
          <span className="text-xs uppercase tracking-widest text-rof-gris">Profil de recrutement</span>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 pb-8 pt-10">
        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-rof-or bg-rof-royal-sombre font-condensed text-5xl font-bold text-rof-poudre">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={nom} className="h-full w-full object-cover" />
            ) : (
              initiales
            )}
          </div>
          <div className="min-w-0">
            <h1 className="font-condensed text-4xl font-bold uppercase leading-none sm:text-5xl">{nom}</h1>
            {positions.length > 0 && (
              <p className="mt-2 font-condensed text-lg uppercase tracking-wide text-rof-or">{positions.join(" · ")}</p>
            )}
            {nomsEquipes.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {nomsEquipes.map((n) => (
                  <span key={n} className="rounded-full border border-rof-ligne bg-rof-blanc px-3 py-1 font-condensed text-sm uppercase">
                    {n}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-5 pb-14">
        {faits.length > 0 && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {faits.map(([etiquette, valeur]) => (
              <div key={etiquette} className="rounded-xl border border-rof-ligne bg-rof-blanc p-4 text-center">
                <p className="font-condensed text-3xl font-bold text-rof-or">{valeur}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-rof-gris">{etiquette}</p>
              </div>
            ))}
          </section>
        )}

        {reglages.apropos && (
          <section className="rounded-xl border border-rof-ligne bg-rof-blanc p-5">
            <h2 className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">À propos</h2>
            <p className="mt-2 whitespace-pre-line text-rof-texte">{reglages.apropos}</p>
          </section>
        )}

        {boutons.length > 0 && (
          <section className="rounded-xl border border-rof-ligne bg-rof-blanc p-5">
            <h2 className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">Liens</h2>
            <div className="mt-3 flex flex-wrap gap-3">
              {boutons.map(([etiquette, url]) => (
                <a
                  key={etiquette}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="rounded-full border border-rof-or px-5 py-2 font-condensed text-sm font-bold uppercase tracking-wide text-rof-or hover:bg-rof-or hover:text-black"
                >
                  {etiquette} ↗
                </a>
              ))}
            </div>
          </section>
        )}

        {contact.length > 0 && (
          <section className="rounded-xl border border-rof-ligne bg-rof-blanc p-5">
            <h2 className="font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or">Contact (parent / tuteur)</h2>
            <p className="mt-2 text-rof-texte">{f.guardian_name}</p>
            {f.guardian_phone && (
              <p>
                <a href={`tel:${f.guardian_phone}`} className="text-rof-poudre underline">
                  {f.guardian_phone}
                </a>
              </p>
            )}
            {f.guardian_email && (
              <p>
                <a href={`mailto:${f.guardian_email}`} className="text-rof-poudre underline">
                  {f.guardian_email}
                </a>
              </p>
            )}
          </section>
        )}

        <footer className="border-t border-rof-ligne pt-5 text-center text-xs text-rof-gris">
          Page de présentation partagée par la joueuse · Royal On Field · Repentigny, Lanaudière
        </footer>
      </div>
    </main>
  );
}
