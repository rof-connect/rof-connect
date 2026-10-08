import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deconnecter } from "@/app/connexion/actions";
import { LogoR } from "@/components/LogoR";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { createAdminClient } from "@/lib/supabase/admin";
import { famille } from "@/lib/joueuses";
import { changerDeJoueuse } from "@/app/membres/famille/actions";
import type { Dictionnaire } from "@/lib/i18n/dictionaries";

const ONGLETS: [string, keyof Dictionnaire["nav"]][] = [
  ["/membres", "accueil"],
  ["/membres/agenda", "agenda"],
  ["/membres/documents", "documents"],
  ["/membres/gc", "gc"],
  ["/membres/messages", "messages"],
];

export default async function MembresLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  const estAdmin = profile?.role === "admin";

  const { locale, t } = await getDictionnaire();
  const { membres: famMembres } = await famille(createAdminClient(), user!.id);

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
        {famMembres.length > 1 && (
          <form action={changerDeJoueuse} className="mx-auto flex max-w-3xl items-center gap-2 px-5 pb-2">
            <span className="text-xs uppercase tracking-wide text-rof-gris">{t.membres.joueuseActive}</span>
            <select
              name="profile_id"
              defaultValue={user!.id}
              className="min-w-0 rounded-lg border border-rof-ligne bg-rof-craie px-2 py-1 text-sm text-rof-texte"
            >
              {famMembres.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || "—"}
                </option>
              ))}
            </select>
            <button type="submit" className="text-sm text-rof-poudre underline">
              {t.membres.changer}
            </button>
          </form>
        )}
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
      <footer className="border-t border-rof-ligne px-5 py-4 text-center text-xs text-rof-gris">
        {t.confirmation.depotSoftball}
      </footer>
    </div>
  );
}
