import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deconnecter } from "@/app/connexion/actions";
import { LogoR } from "@/components/LogoR";

const ONGLETS: [string, string][] = [
  ["/membres", "Accueil"],
  ["/membres/agenda", "Agenda"],
  ["/membres/nouvelles", "Nouvelles"],
  ["/membres/saison", "Saison"],
  ["/membres/plans", "Plans"],
  ["/membres/relais", "Relais"],
  ["/membres/videos", "Vidéos"],
  ["/membres/gc", "GC"],
  ["/membres/signaux", "Signaux"],
  ["/membres/messages", "Messages"],
];

export default async function MembresLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();

  return (
    <div className="flex min-h-screen flex-col bg-rof-noir">
      <header className="sticky top-0 z-30 border-b border-rof-ligne bg-rof-noir/92 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-5 py-3">
          <Link href="/membres" className="flex shrink-0 items-center gap-2">
            <LogoR h={28} />
            <span className="hidden font-condensed text-lg font-bold uppercase tracking-[0.04em] text-white sm:inline">
              ROF Connect
            </span>
          </Link>
          <div className="flex min-w-0 items-center gap-1">
            {profile?.role === "admin" && (
              <Link
                href="/membres/admin"
                className="shrink-0 rounded-lg border border-rof-poudre px-2 py-1 font-condensed text-xs font-semibold uppercase tracking-wide text-rof-poudre"
              >
                Direction
              </Link>
            )}
            <form action={deconnecter} className="shrink-0">
              <button type="submit" className="text-sm text-rof-gris underline">
                Quitter
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-4 overflow-x-auto px-5 pb-2">
          {ONGLETS.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 font-condensed text-sm font-semibold uppercase tracking-wide text-rof-gris"
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
