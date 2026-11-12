import Link from "next/link";
import { redirect } from "next/navigation";
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

  const { data: profile } = await supabase.from("profiles").select("role, parent_id, full_name").eq("id", user!.id).single();
  // Accès « 2e courriel » d'une famille : on bascule sur le compte principal pour voir l'agenda et tout le reste.
  if (profile?.parent_id && profile.role !== "admin" && (profile.full_name ?? "").endsWith("(2e courriel)")) redirect("/membres/acces-principal");
  const estAdmin = profile?.role === "admin";

  const { locale, t } = await getDictionnaire();
  const { membres: famMembresTous } = await famille(createAdminClient(), user!.id);
  const famMembres = famMembresTous.filter((m) => !(m.full_name ?? "").endsWith("(2e courriel)")); // les accès « 2e courriel » ne sont pas des joueuses

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

      <div className="pb-24" aria-hidden />

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
