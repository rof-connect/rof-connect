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
    title: `${nom} | Profil de recrutement | Royal On Field`,
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

const titreSection = "font-condensed text-sm font-bold uppercase tracking-[0.2em] text-rof-or";
const carte = "rounded-xl border border-rof-ligne bg-rof-blanc p-5";

function dateFr(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
}

export default async function PagePresentation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const trouve = await trouverParToken(token);
  if (!trouve) notFound();
  const { profileId, reglages } = trouve;
  const profil = reglages.profil ?? {};

  const admin = createAdminClient();
  const [{ data: nomProfil }, { data: fiche }, { data: equipes }, { data: bilan }, liens, photoUrl] = await Promise.all([
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

  const nom = nomProfil?.full_name || "Joueuse";
  const f = (fiche ?? {}) as Partial<Fiche>;
  const reponses = (bilan?.reponses ?? {}) as { fin?: number; domaine?: string; anglais?: string; divisions?: string[] };
  const initiales = nom
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x: string) => x[0]?.toUpperCase())
    .join("");
  const positions = (f.position ?? "").split(",").map((p) => p.trim()).filter(Boolean);
  const equipesListe = (equipes ?? [])
    .map((e) => (Array.isArray(e.teams) ? e.teams[0] : e.teams) as { name: string; sport: string } | null)
    .filter(Boolean) as { name: string; sport: string }[];
  const fin = Number(reponses.fin);
  const promotion = Number.isInteger(fin) && fin > 2000 ? String(fin) : "";
  const domaine = profil.domaine || reponses.domaine || "";
  const anglais = profil.anglais || reponses.anglais || "";
  const divisions = reponses.divisions ?? [];

  // Bandeau de faits clés, façon fiche de recrutement.
  const faits = [
    ["Promotion", promotion],
    ["Taille", profil.taille],
    ["Poids", profil.poids],
    ["Lance", f.throws],
    ["Frappe", f.bats],
    ["Moyenne", profil.moyenne],
  ].filter(([, v]) => v) as string[][];

  const lieu = [profil.ecole, profil.ville].filter(Boolean).join(" · ");
  const etudes = [
    ["Domaine d'études visé", domaine],
    ["Anglais", anglais],
    ["Moyenne scolaire", profil.moyenne],
    ["Divisions visées", divisions.join(", ")],
  ].filter(([, v]) => v) as string[][];

  const aujourdhui = new Date().toISOString().slice(0, 10);
  const evenements = [...(profil.evenements ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  const aVenir = evenements.filter((e) => e.date >= aujourdhui);
  const passes = evenements.filter((e) => e.date < aujourdhui).reverse().slice(0, 4);

  const boutons = [
    f.fieldlevel_url ? ["FieldLevel", f.fieldlevel_url] : null,
    liens.instagram ? ["Instagram", liens.instagram] : null,
    liens.youtube ? ["YouTube", liens.youtube] : null,
    liens.x ? ["X", liens.x] : null,
  ].filter(Boolean) as string[][];

  const aContact = reglages.contact && (f.guardian_name || f.guardian_phone || f.guardian_email);

  return (
    <main className="min-h-screen bg-rof-noir text-rof-texte">
      <header className="sticky top-0 z-10 border-b border-rof-ligne bg-rof-noir/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-5 py-3">
          <span className="font-condensed text-sm font-bold uppercase tracking-[0.3em] text-rof-or">Royal On Field</span>
          {aContact && f.guardian_email ? (
            <a
              href={`mailto:${f.guardian_email}?subject=${encodeURIComponent("Recrutement : " + nom)}`}
              className="rounded-full bg-rof-or px-4 py-1.5 font-condensed text-sm font-bold uppercase tracking-wide text-black"
            >
              Contacter
            </a>
          ) : (
            <span className="text-xs uppercase tracking-widest text-rof-gris">Profil de recrutement</span>
          )}
        </div>
      </header>

      <section className="border-b border-rof-ligne bg-gradient-to-b from-rof-royal-sombre/40 to-transparent">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 pb-8 pt-10 text-center sm:flex-row sm:items-end sm:text-left">
          <div className="flex h-40 w-40 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-rof-or bg-rof-royal-sombre font-condensed text-6xl font-bold text-rof-poudre">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt={nom} className="h-full w-full object-cover" />
            ) : (
              initiales
            )}
          </div>
          <div className="min-w-0 flex-1">
            {promotion && <p className="font-condensed text-sm uppercase tracking-[0.3em] text-rof-poudre">Promotion {promotion}</p>}
            <h1 className="mt-1 font-condensed text-4xl font-bold uppercase leading-none sm:text-6xl">{nom}</h1>
            {positions.length > 0 && <p className="mt-2 font-condensed text-xl uppercase tracking-wide text-rof-or">{positions.join(" · ")}</p>}
            {lieu && <p className="mt-1 text-sm text-rof-gris">{lieu}</p>}
            {equipesListe.length > 0 && (
              <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
                {equipesListe.map((e) => (
                  <span key={e.name} className="rounded-full border border-rof-ligne bg-rof-blanc px-3 py-1 font-condensed text-sm uppercase">
                    {e.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-5 py-8">
        {faits.length > 0 && (
          <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {faits.map(([etiquette, valeur]) => (
              <div key={etiquette} className="rounded-xl border border-rof-ligne bg-rof-blanc p-4 text-center">
                <p className="font-condensed text-2xl font-bold text-rof-or">{valeur}</p>
                <p className="mt-1 text-xs uppercase tracking-wide text-rof-gris">{etiquette}</p>
              </div>
            ))}
          </section>
        )}

        {reglages.apropos && (
          <section className={carte}>
            <h2 className={titreSection}>À propos</h2>
            <p className="mt-2 whitespace-pre-line text-rof-texte">{reglages.apropos}</p>
          </section>
        )}

        {profil.video && (
          <section className={carte}>
            <h2 className={titreSection}>Vidéo de présentation</h2>
            <div className="mt-3 aspect-video overflow-hidden rounded-lg bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${profil.video}`}
                title={`Vidéo de ${nom}`}
                loading="lazy"
                allow="encrypted-media; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
          </section>
        )}

        {(profil.mesures ?? []).length > 0 && (
          <section className={carte}>
            <h2 className={titreSection}>Mesures athlétiques</h2>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(profil.mesures ?? []).map((m) => (
                <div key={m.label} className="rounded-lg border border-rof-ligne bg-rof-craie p-3">
                  <p className="font-condensed text-2xl font-bold text-rof-texte">{m.valeur}</p>
                  <p className="text-xs uppercase tracking-wide text-rof-gris">{m.label}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {(profil.realisations ?? []).length > 0 && (
          <section className={carte}>
            <h2 className={titreSection}>Réalisations et honneurs</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {(profil.realisations ?? []).map((r) => (
                <li key={r} className="flex gap-2 text-rof-texte">
                  <span className="text-rof-or" aria-hidden>
                    ★
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        {etudes.length > 0 && (
          <section className={carte}>
            <h2 className={titreSection}>Études</h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {etudes.map(([etiquette, valeur]) => (
                <div key={etiquette}>
                  <dt className="text-xs uppercase tracking-wide text-rof-gris">{etiquette}</dt>
                  <dd className="text-rof-texte">{valeur}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {(aVenir.length > 0 || passes.length > 0) && (
          <section className={carte}>
            <h2 className={titreSection}>Calendrier des matchs et compétitions</h2>
            <ul className="mt-3 flex flex-col divide-y divide-rof-ligne">
              {aVenir.map((e) => (
                <li key={e.date + e.nom} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                  <span className="font-semibold text-rof-texte">{e.nom}</span>
                  <span className="text-sm text-rof-gris">
                    {dateFr(e.date)}
                    {e.lieu ? ` · ${e.lieu}` : ""}
                  </span>
                </li>
              ))}
              {passes.map((e) => (
                <li key={e.date + e.nom} className="flex flex-wrap items-baseline justify-between gap-2 py-2 opacity-60">
                  <span className="text-rof-texte">{e.nom}</span>
                  <span className="text-sm text-rof-gris">
                    {dateFr(e.date)}
                    {e.lieu ? ` · ${e.lieu}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {boutons.length > 0 && (
          <section className={carte}>
            <h2 className={titreSection}>Liens</h2>
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

        {(profil.reference || aContact) && (
          <section className="grid gap-6 sm:grid-cols-2">
            {profil.reference && (
              <div className={carte}>
                <h2 className={titreSection}>Référence</h2>
                <p className="mt-2 font-semibold text-rof-texte">{profil.reference.nom}</p>
                {profil.reference.role && <p className="text-sm text-rof-gris">{profil.reference.role}</p>}
                {profil.reference.contact && <p className="text-sm text-rof-texte">{profil.reference.contact}</p>}
              </div>
            )}
            {aContact && (
              <div className={carte}>
                <h2 className={titreSection}>Contact (parent / tuteur)</h2>
                {f.guardian_name && <p className="mt-2 font-semibold text-rof-texte">{f.guardian_name}</p>}
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
              </div>
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
