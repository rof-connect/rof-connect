import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deconnecter } from "@/app/connexion/actions";
import { LogoR } from "@/components/LogoR";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import type { Dictionnaire } from "@/lib/i18n/dictionaries";

const ONGLETS_BASE: [string, keyof Dictionnaire["nav"]][] = [
  ["/membres", "accueil"],
  ["/membres/agenda", "agenda"],
  ["/membres/nouvelles", "nouvelles"],
  ["/membres/saison", "saison"],
  ["/membres/plans", "plans"],
  ["/membres/relais", "relais"],
  ["/membres/videos", "videos"],
  ["/membres/gc", "gc"],
  ["/membres/signaux", "signaux"],
  ["/membres/messages", "messages"],
];

export default async function MembresLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";
  const { data: memberships } = await supabase
    .from("team_members")
    .select("role_in_team")
    .eq("profile_id", user!.id);
  const estStaff = estAdmin || (memberships ?? []).some((m) => m.role_in_team === "coach");

  // Le calendrier direction n'est visible (RLS) que par les coachs/admins.
  const ONGLETS: [string, keyof Dictionnaire["nav"]][] = estStaff
    ? [ONGLETS_BASE[0], ["/membres/calendrier", "calendrier"], ...ONGLETS_BASE.slice(1)]
    : ONGLETS_BASE;

  const { locale, t } = await getDictionnaire();

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
          <div className="flex min-w-0 items-center gap-2">
            <LanguageToggle locale={locale} />
            {estAdmin && (
              <Link
                href="/membres/admin"
                className="shrink-0 rounded-lg border border-rof-poudre px-2 py-1 font-condensed text-xs font-semibold uppercase tracking-wide text-rof-poudre"
              >
                {t.nav.direction}
              </Link>
            )}
            <form action={deconnecter} className="shrink-0">
              <button type="submit" className="text-sm text-rof-gris underline">
                {t.nav.quitter}
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto flex max-w-3xl gap-4 overflow-x-auto px-5 pb-2">
          {ONGLETS.map(([href, cle]) => (
            <Link
              key={href}
              href={href}
              className="shrink-0 font-condensed text-sm font-semibold uppercase tracking-wide text-rof-gris"
            >
              {t.nav[cle]}
            </Link>
          ))}
        </nav>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
