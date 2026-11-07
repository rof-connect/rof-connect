import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deconnecter } from "@/app/connexion/actions";
import { LogoR } from "@/components/LogoR";
import { getDictionnaire } from "@/lib/i18n/server";
import { LanguageToggle } from "@/components/i18n/LanguageToggle";
import { createAdminClient } from "@/lib/supabase/admin";
import { famille } from "@/lib/joueuses";
import { changerDeJoueuse } from "@/app/membres/famille/actions";
import { BarreOnglets } from "@/components/membres/BarreOnglets";
import { SelecteurJoueuse } from "@/components/membres/SelecteurJoueuse";

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
            <span className="font-condensed text-lg font-bold uppercase tracking-[0.04em] text-white">ROF Connect</span>
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            {famMembres.length > 1 && (
              <SelecteurJoueuse
                membres={famMembres}
                actuelId={user!.id}
                action={changerDeJoueuse}
                label={t.membres.joueuseActive}
              />
            )}
            <LanguageToggle locale={locale} />
            <form action={deconnecter} className="shrink-0">
              <button type="submit" className="text-sm text-rof-gris underline">
                {t.nav.quitter}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col">{children}</div>

      <footer className="border-t border-rof-ligne px-5 pb-28 pt-4 text-center text-xs text-rof-gris">
        {t.confirmation.depotSoftball}
      </footer>

      <BarreOnglets
        estAdmin={estAdmin}
        labels={{
          accueil: t.nav.accueil,
          agenda: t.nav.agenda,
          equipe: t.nav.equipe,
          messages: t.nav.messages,
          moi: t.nav.moi,
          direction: t.nav.direction,
        }}
      />
    </div>
  );
}
